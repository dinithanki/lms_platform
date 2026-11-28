$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2.0

$Namespace = 'lms'
$ExpectedContext = 'kind-kind'
$KindCluster = 'kind'
$RolloutTimeout = '180s'
$script:WorkloadUpdatesStarted = $false
$script:DeploymentSummaryDisplayed = $false

$Services = @(
    [pscustomobject]@{
        Name = 'auth-service'
        Deployment = 'auth-service'
        Container = 'auth-service'
        Image = 'ghcr.io/dinithanki/lms_platform-auth-service'
    }
    [pscustomobject]@{
        Name = 'user-service'
        Deployment = 'user-service'
        Container = 'user-service'
        Image = 'ghcr.io/dinithanki/lms_platform-user-service'
    }
    [pscustomobject]@{
        Name = 'course-service'
        Deployment = 'course-service'
        Container = 'course-service'
        Image = 'ghcr.io/dinithanki/lms_platform-course-service'
    }
    [pscustomobject]@{
        Name = 'quiz-service'
        Deployment = 'quiz-service'
        Container = 'quiz-service'
        Image = 'ghcr.io/dinithanki/lms_platform-quiz-service'
    }
    [pscustomobject]@{
        Name = 'api-gateway'
        Deployment = 'api-gateway'
        Container = 'api-gateway'
        Image = 'ghcr.io/dinithanki/lms_platform-api-gateway'
    }
    [pscustomobject]@{
        Name = 'lms-frontend'
        Deployment = 'lms-frontend'
        Container = 'lms-frontend'
        Image = 'ghcr.io/dinithanki/lms_platform-lms-frontend'
    }
)

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Executable,
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,
        [Parameter(Mandatory = $true)]
        [string]$Operation
    )

    $output = @(& $Executable @Arguments 2>$null)
    $commandExitCode = $LASTEXITCODE
    if ($commandExitCode -ne 0) {
        throw "$Operation failed (exit code $commandExitCode)."
    }

    return $output
}

function Select-Services {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$AvailableServices
    )

    while ($true) {
        Write-Host ''
        Write-Host 'Select one or more services (comma-separated numbers or names; "all" selects every service):'
        for ($index = 0; $index -lt $AvailableServices.Count; $index++) {
            Write-Host ('  {0}) {1}' -f ($index + 1), $AvailableServices[$index].Name)
        }

        $selectionText = (Read-Host 'Services').Trim()
        if ($selectionText -eq 'all') {
            return $AvailableServices
        }

        $tokens = @($selectionText -split ',' | ForEach-Object { $_.Trim() } | Where-Object { $_ })
        if ($tokens.Count -eq 0) {
            Write-Host 'Select at least one service.' -ForegroundColor Yellow
            continue
        }

        $selectedNames = @()
        $invalidSelection = $false
        foreach ($token in $tokens) {
            $matchedService = $null
            if ($token -match '^\d+$') {
                $serviceIndex = [int]$token - 1
                if ($serviceIndex -ge 0 -and $serviceIndex -lt $AvailableServices.Count) {
                    $matchedService = $AvailableServices[$serviceIndex]
                }
            }
            else {
                $matchedService = $AvailableServices |
                    Where-Object { $_.Name -ieq $token } |
                    Select-Object -First 1
            }

            if ($null -eq $matchedService) {
                Write-Host "Invalid service selection: '$token'." -ForegroundColor Yellow
                $invalidSelection = $true
                break
            }

            if ($selectedNames -notcontains $matchedService.Name) {
                $selectedNames += $matchedService.Name
            }
        }

        if ($invalidSelection) {
            continue
        }

        $selectedServices = @(
            foreach ($service in $AvailableServices) {
                if ($selectedNames -contains $service.Name) {
                    $service
                }
            }
        )
        return $selectedServices
    }
}

function Get-PreviousImage {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Deployment,
        [Parameter(Mandatory = $true)]
        [string]$Container
    )

    $jsonLines = Invoke-ExternalCommand `
        -Executable 'kubectl' `
        -Arguments @('get', 'deployment', $Deployment, '--namespace', $Namespace, '-o', 'json') `
        -Operation "Reading the current image for deployment '$Deployment'"
    try {
        $deploymentObject = ($jsonLines -join [Environment]::NewLine) | ConvertFrom-Json
    }
    catch {
        throw "Could not parse the current deployment details for '$Deployment'."
    }

    $containers = @($deploymentObject.spec.template.spec.containers)
    $containerSpec = $containers | Where-Object { $_.name -eq $Container } | Select-Object -First 1
    if ($null -eq $containerSpec -or [string]::IsNullOrWhiteSpace($containerSpec.image)) {
        throw "Container '$Container' with an image was not found in deployment '$Deployment'."
    }

    return [string]$containerSpec.image
}

function Invoke-ManualDeployment {
    Write-Host 'LMS manual deployment'
    Write-Host 'This script only deploys after your confirmation; it does not run from CI or GitHub push events.'
    Write-Host '  1) Deploy selected services'
    Write-Host '  2) Exit'

    while ($true) {
        $menuChoice = (Read-Host 'Choose an option').Trim()
        if ($menuChoice -eq '2') {
            return
        }
        if ($menuChoice -eq '1') {
            break
        }
        Write-Host 'Enter 1 to deploy or 2 to exit.' -ForegroundColor Yellow
    }

    $selectedServices = @(Select-Services -AvailableServices $Services)
    if ($selectedServices.Count -eq 0) {
        throw 'No services were selected.'
    }

    do {
        $commitSha = (Read-Host 'Enter the full 40-character Git commit SHA').Trim()
        if ($commitSha -notmatch '^[0-9a-fA-F]{40}$') {
            Write-Host 'Invalid commit SHA. Enter exactly 40 hexadecimal characters.' -ForegroundColor Yellow
        }
    } while ($commitSha -notmatch '^[0-9a-fA-F]{40}$')
    $commitSha = $commitSha.ToLowerInvariant()

    foreach ($service in $selectedServices) {
        $service | Add-Member -NotePropertyName TargetImage -NotePropertyValue "$($service.Image):sha-$commitSha"
    }

    Write-Host ''
    Write-Host 'Selected deployment targets:'
    foreach ($service in $selectedServices) {
        Write-Host ('  {0}: {1}' -f $service.Name, $service.TargetImage)
    }

    $confirmation = Read-Host 'Type DEPLOY to continue'
    if ($confirmation -cne 'DEPLOY') {
        Write-Host 'Deployment cancelled; no images or workloads were changed.'
        return
    }

    foreach ($tool in @('kubectl', 'docker', 'kind')) {
        if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
            throw "Required command '$tool' was not found on PATH."
        }
    }

    $currentContextLines = Invoke-ExternalCommand `
        -Executable 'kubectl' `
        -Arguments @('config', 'current-context') `
        -Operation 'Checking the Kubernetes context'
    $currentContext = ($currentContextLines -join '').Trim()
    if ($currentContext -cne $ExpectedContext) {
        throw "Refusing deployment: current Kubernetes context is '$currentContext'; expected '$ExpectedContext'."
    }

    $null = Invoke-ExternalCommand `
        -Executable 'kubectl' `
        -Arguments @('get', 'namespace', $Namespace, '-o', 'name') `
        -Operation "Verifying that namespace '$Namespace' exists"

    $kindClusters = @(Invoke-ExternalCommand `
        -Executable 'kind' `
        -Arguments @('get', 'clusters') `
        -Operation 'Checking for the Kind cluster')
    $kindClusterExists = $false
    foreach ($cluster in $kindClusters) {
        if (([string]$cluster).Trim() -ceq $KindCluster) {
            $kindClusterExists = $true
            break
        }
    }
    if (-not $kindClusterExists) {
        throw "Refusing deployment: Kind cluster '$KindCluster' was not found."
    }

    $previousImages = @{}
    foreach ($service in $selectedServices) {
        $previousImages[$service.Name] = Get-PreviousImage `
            -Deployment $service.Deployment `
            -Container $service.Container
    }

    foreach ($service in $selectedServices) {
        Write-Host "Pulling $($service.TargetImage)..."
        $null = Invoke-ExternalCommand `
            -Executable 'docker' `
            -Arguments @('pull', $service.TargetImage) `
            -Operation "Pulling image for '$($service.Name)'"
    }

    foreach ($service in $selectedServices) {
        Write-Host "Loading $($service.TargetImage) into Kind cluster '$KindCluster'..."
        $null = Invoke-ExternalCommand `
            -Executable 'kind' `
            -Arguments @('load', 'docker-image', $service.TargetImage, '--name', $KindCluster) `
            -Operation "Loading image for '$($service.Name)' into Kind"
    }

    $statuses = @{}
    $updatedServices = @()
    $hasFailures = $false
    $script:WorkloadUpdatesStarted = $true
    foreach ($service in $selectedServices) {
        Write-Host "Updating deployment '$($service.Deployment)'..."
        try {
            $null = Invoke-ExternalCommand `
                -Executable 'kubectl' `
                -Arguments @(
                    'set', 'image',
                    "deployment/$($service.Deployment)",
                    "$($service.Container)=$($service.TargetImage)",
                    '--namespace', $Namespace
                ) `
                -Operation "Updating deployment '$($service.Deployment)'"
            $updatedServices += $service
        }
        catch {
            Write-Host "FAILED to update $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
            $statuses[$service.Name] = 'Set image failed'
            $hasFailures = $true
        }
    }

    foreach ($service in $updatedServices) {
        Write-Host "Waiting for rollout of '$($service.Deployment)'..."
        try {
            $null = Invoke-ExternalCommand `
                -Executable 'kubectl' `
                -Arguments @(
                    'rollout', 'status',
                    "deployment/$($service.Deployment)",
                    '--namespace', $Namespace,
                    "--timeout=$RolloutTimeout"
                ) `
                -Operation "Waiting for rollout of '$($service.Deployment)'"
            $statuses[$service.Name] = 'Succeeded'
            Write-Host "Rollout succeeded: $($service.Name)" -ForegroundColor Green
        }
        catch {
            $statuses[$service.Name] = 'Rollout failed'
            $hasFailures = $true
            Write-Host "Rollout failed for $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    if ($updatedServices.Count -gt 0) {
        Write-Host ''
        Write-Host 'Rollback uses only the image references recorded before this deployment.'
        $rollbackChoice = Read-Host 'Roll back any updated service(s) now? [y/N]'
        if ($rollbackChoice -match '^(y|yes)$') {
            $servicesToRollback = @(Select-Services -AvailableServices $updatedServices)
            foreach ($service in $servicesToRollback) {
                Write-Host "Restoring $($service.Name) to $($previousImages[$service.Name])..."
                try {
                    $null = Invoke-ExternalCommand `
                        -Executable 'kubectl' `
                        -Arguments @(
                            'set', 'image',
                            "deployment/$($service.Deployment)",
                            "$($service.Container)=$($previousImages[$service.Name])",
                            '--namespace', $Namespace
                        ) `
                        -Operation "Rolling back deployment '$($service.Deployment)'"
                    $null = Invoke-ExternalCommand `
                        -Executable 'kubectl' `
                        -Arguments @(
                            'rollout', 'status',
                            "deployment/$($service.Deployment)",
                            '--namespace', $Namespace,
                            "--timeout=$RolloutTimeout"
                        ) `
                        -Operation "Waiting for rollback of '$($service.Deployment)'"
                    $statuses[$service.Name] = 'Rolled back'
                    Write-Host "Rollback succeeded: $($service.Name)" -ForegroundColor Green
                }
                catch {
                    $statuses[$service.Name] = 'Rollback failed'
                    $hasFailures = $true
                    Write-Host "Rollback failed for $($service.Name): $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        }
    }

    Write-Host ''
    Write-Host 'Deployment summary:'
    foreach ($service in $selectedServices) {
        if ($statuses.ContainsKey($service.Name)) {
            Write-Host ('  {0}: {1}' -f $service.Name, $statuses[$service.Name])
        }
        else {
            Write-Host ('  {0}: Not updated' -f $service.Name)
        }
    }
    $script:DeploymentSummaryDisplayed = $true

    if ($hasFailures) {
        throw 'One or more deployment or rollback operations failed; review the summary above.'
    }
}

try {
    Invoke-ManualDeployment
    exit 0
}
catch {
    if (-not $script:DeploymentSummaryDisplayed) {
        [Console]::Error.WriteLine('Deployment summary:')
        if ($script:WorkloadUpdatesStarted) {
            [Console]::Error.WriteLine('  Status: Incomplete; verify the selected Deployments before retrying.')
        }
        else {
            [Console]::Error.WriteLine('  Status: Aborted before Kubernetes workloads were changed.')
        }
    }
    [Console]::Error.WriteLine("ERROR: $($_.Exception.Message)")
    exit 1
}

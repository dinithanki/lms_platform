$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot
try {
    $composeArgs = @(
        "compose",
        "--project-name", "lms-platform",
        "--file", "docker-compose.lms.yml"
    )

    & docker @composeArgs up -d lms-postgres
    if ($LASTEXITCODE -ne 0) {
        throw "Could not start the dedicated LMS PostgreSQL service."
    }

    $restoreArgs = $composeArgs + @("run", "--rm", "lms-db-restore")
    & docker @restoreArgs
    if ($LASTEXITCODE -ne 0) {
        throw "Database restore failed. Original backups are mounted read-only; inspect LMS database state before retrying."
    }
}
finally {
    Pop-Location
}

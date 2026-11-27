$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $repoRoot ".env"
if (Test-Path -LiteralPath $envPath) {
    throw "Refusing to overwrite an existing .env file."
}

$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
function New-HexSecret {
    param([int]$ByteCount)
    $bytes = [byte[]]::new($ByteCount)
    $random.GetBytes($bytes)
    return [System.BitConverter]::ToString($bytes).Replace("-", "").ToLowerInvariant()
}

$lines = @(
    "LMS_DB_USER=lms_app"
    "LMS_DB_PASSWORD=$(New-HexSecret 32)"
    "LMS_JWT_SECRET=$(New-HexSecret 48)"
    "LMS_AUTH_SERVICE_TOKEN=$(New-HexSecret 48)"
    "LMS_QUIZ_SERVICE_TOKEN=$(New-HexSecret 48)"
    "LMS_BACKUP_DIR=C:/Users/dinit/AppData/Local/LMS/db-backups"
    "LMS_FRONTEND_PORT=3001"
    "LMS_GATEWAY_PORT=8085"
)

[System.IO.File]::WriteAllLines($envPath, $lines, [System.Text.UTF8Encoding]::new($false))
Write-Output "Created ignored .env with randomly generated credentials. Keep it private."

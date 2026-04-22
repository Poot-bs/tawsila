$ErrorActionPreference = "Stop"

function Set-EnvFromDotEnv {
  param([string]$Path)

  if (-not (Test-Path $Path)) {
    throw ".env file not found at $Path"
  }

  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }

    $idx = $line.IndexOf("=")
    if ($idx -lt 1) {
      return
    }

    $key = $line.Substring(0, $idx).Trim()
    $value = $line.Substring($idx + 1).Trim().Trim('"')

    Set-Item -Path ("Env:" + $key) -Value $value
  }
}

$conn = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -First 1
if ($conn) {
  Write-Host "Port 8080 is used by PID $($conn.OwningProcess). Stopping it..."
  Stop-Process -Id $conn.OwningProcess -Force
}

$envPath = Join-Path $PSScriptRoot ".env"
Set-EnvFromDotEnv -Path $envPath

if (-not $env:POSTGRES_URL -or -not $env:POSTGRES_USER -or -not $env:POSTGRES_PASSWORD) {
  throw "POSTGRES_URL, POSTGRES_USER and POSTGRES_PASSWORD must be set in .env"
}

$env:APP_PERSISTENCE_MODE = "postgres"

Write-Host "Starting UniRide with Postgres on http://localhost:8080 ..."
mvn spring-boot:run

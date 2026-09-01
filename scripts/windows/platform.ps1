[CmdletBinding()]
param(
    [ValidateSet("Start", "Stop", "Doctor", "Install", "SelfTest")]
    [string]$Mode = "Start",
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$BackendRoot = Join-Path $ProjectRoot "backend"
$FrontendRoot = Join-Path $ProjectRoot "frontend"
$VenvRoot = Join-Path $BackendRoot ".venv"
$VenvPython = Join-Path $VenvRoot "Scripts\python.exe"
$NextCli = Join-Path $FrontendRoot "node_modules\next\dist\bin\next"
$RuntimeRoot = Join-Path $ProjectRoot ".runtime"
$StatePath = Join-Path $RuntimeRoot "launcher-state.json"
$LogRoot = Join-Path $RuntimeRoot "logs"
$FrontendUrl = "http://127.0.0.1:3000/"
$BackendHealthUrl = "http://127.0.0.1:8000/health"

function Write-Step([string]$Message) {
    Write-Host "[INFO] $Message"
}

function Write-Ok([string]$Message) {
    Write-Host "[OK]   $Message" -ForegroundColor Green
}

function Write-Failure([string]$Message) {
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Get-CommandPath([string]$Name) {
    $command = Get-Command $Name -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($null -eq $command) { return $null }
    return $command.Source
}

function Get-SystemPython {
    $candidates = New-Object System.Collections.Generic.List[string]
    if ($env:LocalAppData) {
        $candidates.Add((Join-Path $env:LocalAppData "Programs\Python\Python312\python.exe"))
    }
    $pathPython = Get-CommandPath "python.exe"
    if ($pathPython) { $candidates.Add($pathPython) }

    foreach ($candidate in ($candidates | Select-Object -Unique)) {
        if (-not (Test-Path -LiteralPath $candidate -PathType Leaf)) { continue }
        try {
            $version = & $candidate -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')" 2>$null
            if ($LASTEXITCODE -ne 0) { continue }
            $parts = $version.Trim().Split(".")
            if ([int]$parts[0] -gt 3 -or ([int]$parts[0] -eq 3 -and [int]$parts[1] -ge 12)) {
                return $candidate
            }
        } catch {
            continue
        }
    }
    return $null
}

function Test-VenvPython {
    if (-not (Test-Path -LiteralPath $VenvPython -PathType Leaf)) { return $false }
    try {
        & $VenvPython -c "import sys; raise SystemExit(0 if sys.version_info >= (3, 12) else 1)" 2>$null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-BackendPackages {
    if (-not (Test-VenvPython)) { return $false }
    try {
        & $VenvPython -c "import fastapi, pydantic_settings, sqlalchemy, uvicorn" 2>$null
        if ($LASTEXITCODE -ne 0) { return $false }
        & $VenvPython -m pip check 2>$null | Out-Null
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-FrontendPackages {
    return Test-Path -LiteralPath $NextCli -PathType Leaf
}

function Get-InstallPlan(
    [bool]$VenvExists,
    [bool]$VenvWorks,
    [bool]$BackendPackagesWork,
    [bool]$FrontendPackagesWork
) {
    $actions = New-Object System.Collections.Generic.List[string]
    if ($VenvExists -and -not $VenvWorks) { $actions.Add("backup-stale-venv") }
    if (-not $VenvWorks) { $actions.Add("create-venv") }
    if (-not $BackendPackagesWork) { $actions.Add("install-backend") }
    if (-not $FrontendPackagesWork) { $actions.Add("install-frontend") }
    return @($actions)
}

function Get-EnvironmentStatus {
    $nodePath = Get-CommandPath "node.exe"
    $npmPath = Get-CommandPath "npm.cmd"
    $nodeSupported = $false
    $nodeVersion = $null
    if ($nodePath) {
        try {
            $nodeVersion = (& $nodePath --version 2>$null).Trim()
            $nodeMajor = [int]($nodeVersion.TrimStart("v").Split(".")[0])
            $nodeSupported = $nodeMajor -ge 20
        } catch {
            $nodeSupported = $false
        }
    }
    return [pscustomobject]@{
        SystemPython = Get-SystemPython
        NodePath = $nodePath
        NodeVersion = $nodeVersion
        NodeSupported = $nodeSupported
        NpmPath = $npmPath
        VenvExists = Test-Path -LiteralPath $VenvRoot -PathType Container
        VenvWorks = Test-VenvPython
        BackendPackagesWork = Test-BackendPackages
        FrontendPackagesWork = Test-FrontendPackages
    }
}

function Backup-StaleVenv {
    $resolvedSource = [System.IO.Path]::GetFullPath($VenvRoot)
    $expectedSource = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot "backend\.venv"))
    if (-not $resolvedSource.Equals($expectedSource, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to move unexpected venv path: $resolvedSource"
    }
    $backupRoot = [System.IO.Path]::GetFullPath((Join-Path $ProjectRoot "_backups"))
    New-Item -ItemType Directory -Path $backupRoot -Force | Out-Null
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $destination = [System.IO.Path]::GetFullPath((Join-Path $backupRoot "stale-backend-venv-$stamp"))
    if (-not $destination.StartsWith($backupRoot + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Refusing to use backup path outside _backups: $destination"
    }
    Write-Step "The existing backend venv cannot run. Moving it to $destination"
    Move-Item -LiteralPath $resolvedSource -Destination $destination
    Write-Ok "Stale venv preserved as a recoverable backup."
}

function Invoke-Install {
    Write-Host "==============================================="
    Write-Host "  SlovoKrok - dependency setup"
    Write-Host "==============================================="

    if (-not (Test-Path -LiteralPath (Join-Path $BackendRoot "requirements.txt"))) {
        throw "backend\requirements.txt was not found."
    }
    if (-not (Test-Path -LiteralPath (Join-Path $FrontendRoot "package.json"))) {
        throw "frontend\package.json was not found."
    }

    $status = Get-EnvironmentStatus
    if (-not $status.SystemPython) {
        throw "Python 3.12 or newer was not found. Install it from python.org and enable PATH."
    }
    if (-not $status.NodePath -or -not $status.NpmPath) {
        throw "Node.js with npm was not found. Install Node.js 20 LTS or newer from nodejs.org."
    }
    if (-not $status.NodeSupported) {
        throw "Node.js $($status.NodeVersion) is too old. Install Node.js 20 LTS or newer."
    }

    $plan = Get-InstallPlan $status.VenvExists $status.VenvWorks $status.BackendPackagesWork $status.FrontendPackagesWork
    if ($plan -contains "backup-stale-venv") { Backup-StaleVenv }
    if ($plan -contains "create-venv") {
        Write-Step "Creating backend virtual environment..."
        & $status.SystemPython -m venv $VenvRoot
        if ($LASTEXITCODE -ne 0) { throw "Python could not create backend\.venv." }
        Write-Ok "Backend virtual environment created."
    }
    if ($plan -contains "install-backend") {
        Write-Step "Installing missing backend dependencies..."
        & $VenvPython -m pip install -r (Join-Path $BackendRoot "requirements.txt")
        if ($LASTEXITCODE -ne 0) { throw "Backend dependency installation failed." }
        if (-not (Test-BackendPackages)) { throw "Backend dependencies remain inconsistent after installation." }
        Write-Ok "Backend dependencies are ready."
    } else {
        Write-Ok "Backend environment is already ready; no reinstall needed."
    }
    if ($plan -contains "install-frontend") {
        Write-Step "Installing missing frontend dependencies..."
        Push-Location $FrontendRoot
        try {
            & $status.NpmPath install
            if ($LASTEXITCODE -ne 0) { throw "Frontend dependency installation failed." }
        } finally {
            Pop-Location
        }
        if (-not (Test-FrontendPackages)) { throw "Next.js is still missing after npm install." }
        Write-Ok "Frontend dependencies are ready."
    } else {
        Write-Ok "Frontend environment is already ready; no reinstall needed."
    }

    if (Test-Path -LiteralPath (Join-Path $ProjectRoot ".env")) {
        Write-Ok "Existing .env preserved."
    } else {
        Write-Step "No .env file found. Built-in local defaults will be used; no secret file was created."
    }
    Write-Ok "Dependency setup completed."
}

function Test-PortListening([int]$Port) {
    $client = New-Object System.Net.Sockets.TcpClient
    try {
        $result = $client.BeginConnect("127.0.0.1", $Port, $null, $null)
        if (-not $result.AsyncWaitHandle.WaitOne(350)) { return $false }
        $client.EndConnect($result)
        return $true
    } catch {
        return $false
    } finally {
        $client.Dispose()
    }
}

function Test-BackendHealthy {
    try {
        $response = Invoke-RestMethod -Uri $BackendHealthUrl -TimeoutSec 2
        return $response.status -eq "ok"
    } catch {
        return $false
    }
}

function Test-FrontendHealthy {
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $FrontendUrl -TimeoutSec 3
        return $response.StatusCode -eq 200 -and $response.Content -match "SlovoKrok"
    } catch {
        return $false
    }
}

function Get-LaunchDecision(
    [bool]$BackendHealthy,
    [bool]$BackendListening,
    [bool]$FrontendHealthy,
    [bool]$FrontendListening
) {
    if ($BackendListening -and -not $BackendHealthy) { return "backend-conflict" }
    if ($FrontendListening -and -not $FrontendHealthy) { return "frontend-conflict" }
    if ($BackendHealthy -and $FrontendHealthy) { return "reuse-all" }
    if ($BackendHealthy) { return "start-frontend" }
    if ($FrontendHealthy) { return "start-backend" }
    return "start-both"
}

function Read-LauncherState {
    if (-not (Test-Path -LiteralPath $StatePath -PathType Leaf)) { return $null }
    try {
        return Get-Content -LiteralPath $StatePath -Raw | ConvertFrom-Json
    } catch {
        Write-Step "Ignoring unreadable launcher state; no process will be stopped from it."
        return $null
    }
}

function Save-LauncherState($State) {
    New-Item -ItemType Directory -Path $RuntimeRoot -Force | Out-Null
    $State | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $StatePath -Encoding UTF8
}

function New-ProcessRecord([System.Diagnostics.Process]$Process, [string]$Role) {
    return [pscustomobject]@{
        pid = $Process.Id
        role = $Role
        startedAtUtc = $Process.StartTime.ToUniversalTime().ToString("o")
    }
}

function Test-ProcessRecord($Record) {
    if ($null -eq $Record -or -not $Record.pid -or -not $Record.startedAtUtc) { return $false }
    try {
        $process = Get-Process -Id ([int]$Record.pid) -ErrorAction Stop
        $recorded = [datetime]::Parse($Record.startedAtUtc).ToUniversalTime()
        $actual = $process.StartTime.ToUniversalTime()
        return [math]::Abs(($actual - $recorded).TotalSeconds) -lt 2
    } catch {
        return $false
    }
}

function Stop-ProcessRecord($Record) {
    if (-not (Test-ProcessRecord $Record)) { return $false }
    Write-Step "Stopping launcher-owned $($Record.role) process tree (PID $($Record.pid))..."
    & taskkill.exe /PID ([int]$Record.pid) /T /F 2>$null | Out-Null
    return $LASTEXITCODE -eq 0
}

function Wait-Until([scriptblock]$Probe, [int]$TimeoutSeconds, [string]$Name) {
    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if (& $Probe) { Write-Ok "$Name is ready."; return $true }
        Start-Sleep -Milliseconds 500
    }
    return $false
}

function Invoke-Start {
    Write-Host "==============================================="
    Write-Host "  SlovoKrok"
    Write-Host "==============================================="

    $status = Get-EnvironmentStatus
    if (-not ($status.VenvWorks -and $status.BackendPackagesWork -and $status.FrontendPackagesWork)) {
        Write-Step "Required local dependencies are missing or stale; running safe setup."
        Invoke-Install
        $status = Get-EnvironmentStatus
    }
    if (-not ($status.VenvWorks -and $status.BackendPackagesWork -and $status.FrontendPackagesWork)) {
        throw "Local dependencies are not ready after setup. Run doctor.cmd for details."
    }

    $backendHealthy = Test-BackendHealthy
    $frontendHealthy = Test-FrontendHealthy
    $decision = Get-LaunchDecision $backendHealthy (Test-PortListening 8000) $frontendHealthy (Test-PortListening 3000)
    if ($decision -eq "backend-conflict") {
        throw "Port 8000 is occupied by a service that is not this backend. It was not stopped."
    }
    if ($decision -eq "frontend-conflict") {
        throw "Port 3000 is occupied by a service that is not this frontend. It was not stopped."
    }
    if ($decision -eq "reuse-all") {
        Write-Ok "The application is already running and healthy."
        if (-not $NoBrowser) { Start-Process $FrontendUrl }
        return
    }

    New-Item -ItemType Directory -Path $LogRoot -Force | Out-Null
    $state = Read-LauncherState
    if ($null -eq $state) { $state = [pscustomobject]@{ backend = $null; frontend = $null } }
    $startedBackend = $null
    $startedFrontend = $null
    try {
        if ($decision -in @("start-backend", "start-both")) {
            Write-Step "Starting backend on 127.0.0.1:8000..."
            $startedBackend = Start-Process -FilePath $VenvPython -ArgumentList @("-m", "uvicorn", "app.main:app", "--reload", "--host", "127.0.0.1", "--port", "8000") -WorkingDirectory $BackendRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $LogRoot "backend.out.log") -RedirectStandardError (Join-Path $LogRoot "backend.err.log")
            $state.backend = New-ProcessRecord $startedBackend "backend"
            Save-LauncherState $state
            if (-not (Wait-Until ${function:Test-BackendHealthy} 45 "Backend")) {
                throw "Backend did not become healthy. See .runtime\logs\backend.err.log."
            }
        }
        if ($decision -in @("start-frontend", "start-both")) {
            Write-Step "Starting frontend on 127.0.0.1:3000..."
            $nodePath = Get-CommandPath "node.exe"
            $quotedNextCli = '"' + $NextCli + '"'
            $startedFrontend = Start-Process -FilePath $nodePath -ArgumentList @($quotedNextCli, "dev", "--hostname", "127.0.0.1", "--port", "3000") -WorkingDirectory $FrontendRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $LogRoot "frontend.out.log") -RedirectStandardError (Join-Path $LogRoot "frontend.err.log")
            $state.frontend = New-ProcessRecord $startedFrontend "frontend"
            Save-LauncherState $state
            if (-not (Wait-Until ${function:Test-FrontendHealthy} 60 "Frontend")) {
                throw "Frontend did not become ready. See .runtime\logs\frontend.err.log."
            }
        }
    } catch {
        if ($startedFrontend) { Stop-ProcessRecord (New-ProcessRecord $startedFrontend "frontend") | Out-Null }
        if ($startedBackend) { Stop-ProcessRecord (New-ProcessRecord $startedBackend "backend") | Out-Null }
        if ((Test-ProcessRecord $state.frontend) -or (Test-ProcessRecord $state.backend)) {
            Save-LauncherState $state
        } elseif (Test-Path -LiteralPath $StatePath) {
            Remove-Item -LiteralPath $StatePath -Force
        }
        throw
    }

    Write-Ok "SlovoKrok is ready at $FrontendUrl"
    Write-Step "Use stop.cmd to stop only processes started by this launcher."
    if (-not $NoBrowser) { Start-Process $FrontendUrl }
}

function Invoke-Stop {
    $state = Read-LauncherState
    if ($null -eq $state) {
        Write-Step "No launcher-owned processes were recorded. Nothing was stopped."
        return
    }
    $stopped = $false
    if (Stop-ProcessRecord $state.frontend) { $stopped = $true }
    if (Stop-ProcessRecord $state.backend) { $stopped = $true }
    if ((Test-ProcessRecord $state.frontend) -or (Test-ProcessRecord $state.backend)) {
        Save-LauncherState $state
        throw "A launcher-owned process could not be stopped. Its state was preserved for a safe retry."
    }
    if (Test-Path -LiteralPath $StatePath) { Remove-Item -LiteralPath $StatePath -Force }
    if ($stopped) { Write-Ok "Launcher-owned processes stopped." }
    else { Write-Step "Recorded processes were already stopped or their PIDs were reused; no process was killed." }
}

function Invoke-Doctor {
    $status = Get-EnvironmentStatus
    Write-Host "SlovoKrok diagnostics"
    Write-Host "Project: $ProjectRoot"
    if ($status.SystemPython) { Write-Ok "System Python 3.12+ found." } else { Write-Failure "System Python 3.12+ not found." }
    if ($status.NodeSupported -and $status.NpmPath) { Write-Ok "Node.js $($status.NodeVersion) and npm found." } else { Write-Failure "Node.js 20+ with npm not found." }
    if ($status.VenvWorks) { Write-Ok "backend\.venv Python works." } else { Write-Failure "backend\.venv is missing or stale; install.cmd will preserve and replace a stale copy." }
    if ($status.BackendPackagesWork) { Write-Ok "Backend packages are consistent." } else { Write-Failure "Backend packages are missing or inconsistent." }
    if ($status.FrontendPackagesWork) { Write-Ok "Frontend packages are present." } else { Write-Failure "Frontend packages are missing." }

    $backendHealthy = Test-BackendHealthy
    $frontendHealthy = Test-FrontendHealthy
    $decision = Get-LaunchDecision $backendHealthy (Test-PortListening 8000) $frontendHealthy (Test-PortListening 3000)
    Write-Host "Port decision: $decision"
    if ($backendHealthy) { Write-Ok "Backend health endpoint responds." }
    if ($frontendHealthy) { Write-Ok "Frontend identity check responds." }
    if ($decision -like "*-conflict") { Write-Failure "A required port belongs to another or unhealthy service; the launcher will not stop it." }

    if (-not ($status.SystemPython -and $status.NodeSupported -and $status.NpmPath -and $status.VenvWorks -and $status.BackendPackagesWork -and $status.FrontendPackagesWork) -or $decision -like "*-conflict") {
        exit 1
    }
}

function Assert-Equal($Actual, $Expected, [string]$Name) {
    if ($Actual -ne $Expected) { throw "Self-test failed: $Name (expected '$Expected', got '$Actual')" }
}

function Invoke-SelfTest {
    Assert-Equal (Get-LaunchDecision $false $false $false $false) "start-both" "clean start"
    Assert-Equal (Get-LaunchDecision $true $true $true $true) "reuse-all" "repeat start"
    Assert-Equal (Get-LaunchDecision $false $true $false $false) "backend-conflict" "occupied backend port"
    Assert-Equal (Get-LaunchDecision $false $false $false $true) "frontend-conflict" "occupied frontend port"
    Assert-Equal ((Get-InstallPlan $false $false $false $false) -join ",") "create-venv,install-backend,install-frontend" "clean install plan"
    Assert-Equal ((Get-InstallPlan $true $true $true $true) -join ",") "" "ready environment plan"
    Assert-Equal ((Get-InstallPlan $true $false $false $true) -join ",") "backup-stale-venv,create-venv,install-backend" "stale venv plan"
    Write-Ok "Launcher decision self-tests passed."
}

try {
    switch ($Mode) {
        "Start" { Invoke-Start }
        "Stop" { Invoke-Stop }
        "Doctor" { Invoke-Doctor }
        "Install" { Invoke-Install }
        "SelfTest" { Invoke-SelfTest }
    }
} catch {
    Write-Failure $_.Exception.Message
    exit 1
}

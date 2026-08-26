[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
Set-Location $ProjectRoot

function Normalize-RepositoryPath([string]$Path) {
    $normalized = $Path.Replace("\", "/")
    if ($normalized.StartsWith("./", [System.StringComparison]::Ordinal)) {
        return $normalized.Substring(2)
    }
    return $normalized
}

$candidatePaths = @(
    & git.exe -c core.quotepath=false ls-files --cached --others --exclude-standard |
        ForEach-Object { Normalize-RepositoryPath $_ } |
        Where-Object { $_ -and (Test-Path -LiteralPath (Join-Path $ProjectRoot $_) -PathType Leaf) } |
        Sort-Object -Unique
)
if ($LASTEXITCODE -ne 0) { throw "git ls-files failed." }

$forbiddenPaths = New-Object System.Collections.Generic.List[string]
$secretPaths = New-Object System.Collections.Generic.List[string]
$largePaths = New-Object System.Collections.Generic.List[string]

$forbiddenPattern = '(^|/)(\.env($|\.)|backend/data/|\.runtime/|_backups/|Install/|node_modules/|\.next($|[-/])|playwright-report/|test-results/|\.ai/private/)|(^|/).*(sync-conflict|~syncthing~)|\.(db|sqlite3?|log|bak)$'
$binaryInstallerPattern = '\.(exe|msi|msix|appx)$'
$allowedEnvPath = ".env.example"
$placeholderPattern = '^(replace_me|your_[a-z0-9_-]+|placeholder|example|change[-_]?me[a-z0-9_-]*|none|null|\.\.\.|<[^>]+>|\$\{[^}]+\})$'
$assignmentPattern = '(?im)^[ \t]*(OPENAI_API_KEY|POLZA_API_KEY|API_KEY|SECRET_KEY|JWT_SECRET|ACCESS_TOKEN|PASSWORD)[ \t]*=[ \t]*([^\s#]+)'
$credentialPatterns = @(
    '(?i)\bsk-[a-z0-9_-]{20,}\b',
    '(?i)\bpza_[a-z0-9_-]{20,}\b',
    '(?i)\bghp_[a-z0-9]{30,}\b',
    '(?i)\bgithub_pat_[a-z0-9_]{30,}\b',
    '\bAKIA[0-9A-Z]{16}\b',
    '-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----'
)

foreach ($relativePath in $candidatePaths) {
    $fullPath = Join-Path $ProjectRoot $relativePath
    $normalized = Normalize-RepositoryPath $relativePath
    if (($normalized -ne $allowedEnvPath -and $normalized -match $forbiddenPattern) -or $normalized -match $binaryInstallerPattern) {
        $forbiddenPaths.Add($normalized)
    }

    $fileInfo = Get-Item -LiteralPath $fullPath
    if ($fileInfo.Length -gt 20MB) { $largePaths.Add("$normalized ($([math]::Round($fileInfo.Length / 1MB, 1)) MB)") }
    if ($fileInfo.Length -gt 2MB) { continue }

    try {
        $bytes = [System.IO.File]::ReadAllBytes($fullPath)
        if ($bytes -contains 0) { continue }
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
    } catch {
        continue
    }

    $hasSecret = $false
    $extension = [System.IO.Path]::GetExtension($normalized).ToLowerInvariant()
    if ($extension -notin @(".py", ".ts", ".tsx", ".js", ".mjs", ".ps1")) {
        foreach ($match in [regex]::Matches($content, $assignmentPattern)) {
            $value = $match.Groups[2].Value.Trim('"', "'")
            if ($value -notmatch $placeholderPattern) { $hasSecret = $true; break }
        }
    }
    if (-not $hasSecret) {
        foreach ($pattern in $credentialPatterns) {
            if ($content -match $pattern) { $hasSecret = $true; break }
        }
    }
    if ($hasSecret) { $secretPaths.Add($normalized) }
}

$deletedTracked = @(& git.exe -c core.quotepath=false ls-files --deleted)
if ($LASTEXITCODE -ne 0) { throw "git ls-files --deleted failed." }

Write-Host "Repository hygiene audit"
Write-Host "Candidate files present in a future snapshot: $($candidatePaths.Count)"
Write-Host "Tracked paths currently deleted in the working tree: $($deletedTracked.Count)"

if ($largePaths.Count) {
    Write-Host "Large files requiring owner review:" -ForegroundColor Yellow
    $largePaths | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" }
}
if ($forbiddenPaths.Count) {
    Write-Host "Forbidden local/generated paths:" -ForegroundColor Red
    $forbiddenPaths | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" }
}
if ($secretPaths.Count) {
    Write-Host "Files with credential-like content (values suppressed):" -ForegroundColor Red
    $secretPaths | Sort-Object -Unique | ForEach-Object { Write-Host "  $_" }
}

if ($forbiddenPaths.Count -or $secretPaths.Count) { exit 1 }
Write-Host "[OK] No forbidden local paths or credential-like values found in present candidate files." -ForegroundColor Green

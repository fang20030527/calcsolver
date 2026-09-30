$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$distRoot = Join-Path $projectRoot 'dist'
$artifactRoot = Join-Path $projectRoot 'artifacts'
$archivePath = Join-Path $artifactRoot 'calcsolver-info-cloudflare-pages.zip'

if (-not (Test-Path -LiteralPath (Join-Path $distRoot 'index.html'))) {
    throw 'Run npm run verify before packaging the site.'
}

New-Item -ItemType Directory -Path $artifactRoot -Force | Out-Null
Compress-Archive -Path (Join-Path $distRoot '*') -DestinationPath $archivePath -Force
Get-Item -LiteralPath $archivePath | Select-Object FullName, Length

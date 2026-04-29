param(
  [switch]$NoInstall,
  [switch]$NoOpen
)

$ErrorActionPreference = "Stop"

function Assert-CommandExists([string]$cmd) {
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)) {
    throw "Missing command: $cmd. Please install Node.js (with npm) and retry."
  }
}

Assert-CommandExists "node"
Assert-CommandExists "npm"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not $NoInstall) {
  if (-not (Test-Path (Join-Path $root "node_modules"))) {
    Write-Host "node_modules not found. Running npm install..."
    npm install
  }
}

if (-not $NoOpen) {
  Start-Job -ScriptBlock {
    Start-Sleep -Seconds 2
    Start-Process "http://localhost:3000/"
  } | Out-Null
}

Write-Host "Starting web dev server: http://localhost:3000/"
npm run dev

# Publish ALL local changes to GitHub, then optionally deploy on the VPS.
# Use this instead of uploading files one-by-one — the VPS always deploys from git.
#
# Usage (PowerShell, repo root):
#   .\scripts\publish-full.ps1
#   .\scripts\publish-full.ps1 -Message "Describe your changes"
#   .\scripts\publish-full.ps1 -SkipDeploy
#   .\scripts\publish-full.ps1 -VpsHost "user@your-vps" -AppPath "/home/fptn.com/app/flashpoint-network"
#
# Requires: git, optional ssh for -VpsHost

param(
  [string]$Message = "",
  [string]$Branch = "main",
  [switch]$SkipDeploy,
  [string]$VpsHost = "",
  [string]$AppPath = "/home/fptn.com/app/flashpoint-network"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "[publish] repo: $Root" -ForegroundColor Cyan
Write-Host "[publish] branch: $Branch" -ForegroundColor Cyan

git fetch origin 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "[publish] WARN: git fetch failed (offline?). Continuing with local state." -ForegroundColor Yellow
}

$status = git status --porcelain
if ($status) {
  Write-Host "[publish] Uncommitted changes (will stage all except ignored files):" -ForegroundColor Yellow
  git status --short
  if (-not $Message) {
    $Message = "Sync local work: home live Brightcove, admin/public updates, deploy scripts."
  }
  git add -A
  git commit -m $Message
  if ($LASTEXITCODE -ne 0) {
    throw "git commit failed"
  }
} else {
  Write-Host "[publish] Working tree clean — nothing to commit." -ForegroundColor Green
}

$ahead = git rev-list --count "origin/$Branch..HEAD" 2>$null
if (-not $ahead) { $ahead = "0" }
if ([int]$ahead -eq 0) {
  $localHead = git rev-parse HEAD
  $remoteHead = git rev-parse "origin/$Branch" 2>$null
  if ($remoteHead -and $localHead -ne $remoteHead) {
    Write-Host "[publish] Local HEAD differs from origin/$Branch — pushing anyway." -ForegroundColor Yellow
  } else {
    Write-Host "[publish] Already up to date with origin/$Branch." -ForegroundColor Green
  }
}

Write-Host "[publish] git push origin $Branch" -ForegroundColor Cyan
git push -u origin $Branch
if ($LASTEXITCODE -ne 0) {
  throw "git push failed — fix conflicts, then re-run this script"
}

$sha = git rev-parse --short HEAD
Write-Host "[publish] OK pushed $sha to origin/$Branch" -ForegroundColor Green
Write-Host "[publish] VPS deploy pulls the FULL branch (not single files). Run on server:" -ForegroundColor Cyan
Write-Host "  cd $AppPath && bash scripts/deploy-from-github.sh" -ForegroundColor White

if ($SkipDeploy -or -not $VpsHost) {
  if (-not $VpsHost) {
    Write-Host "[publish] Set -VpsHost user@host to SSH-deploy after push." -ForegroundColor DarkGray
  }
  exit 0
}

Write-Host "[publish] SSH deploy on $VpsHost ..." -ForegroundColor Cyan
ssh $VpsHost "cd $AppPath && GIT_BRANCH=$Branch bash scripts/deploy-from-github.sh"
if ($LASTEXITCODE -ne 0) {
  throw "Remote deploy failed"
}
Write-Host "[publish] VPS deploy finished." -ForegroundColor Green

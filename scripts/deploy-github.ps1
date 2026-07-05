# Lucky Bite GitHub Push & Cloudflare Pages Deploy Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts\deploy-github.ps1

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Lucky Bite - GitHub Push Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check git
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] git not found, please install Git for Windows" -ForegroundColor Red
    exit 1
}

# Input GitHub username
$githubUser = Read-Host "Enter your GitHub username"
if (-not $githubUser) {
    Write-Host "[ERROR] GitHub username cannot be empty" -ForegroundColor Red
    exit 1
}

# Input repo name
$repoName = Read-Host "Enter repo name (default: lucky-bite)"
if (-not $repoName) { $repoName = "lucky-bite" }

# Secure input token (hidden)
$secToken = Read-Host "Enter GitHub Personal Access Token (input hidden)" -AsSecureString
$bsr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secToken)
$token = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($bsr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bsr)

if (-not $token) {
    Write-Host "[ERROR] Token cannot be empty" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[1/5] Configuring git user..." -ForegroundColor Yellow
$currentUser = git config user.name 2>$null
$currentEmail = git config user.email 2>$null
if (-not $currentUser) { git config user.name $githubUser }
if (-not $currentEmail) { git config user.email "$githubUser@users.noreply.github.com" }

Write-Host "[2/5] Creating GitHub repo..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
}
$body = @{
    name = $repoName
    description = "Lucky Bite - PWA gacha restaurant picker"
    private = $false
    auto_init = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
    Write-Host "  Repo created: $($response.html_url)" -ForegroundColor Green
} catch {
    if ($_.Exception.Response.StatusCode -eq 422) {
        Write-Host "  Repo already exists, continue" -ForegroundColor Yellow
    } else {
        Write-Host "[ERROR] Failed to create repo: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[3/5] Adding git remote..." -ForegroundColor Yellow
$remoteUrl = "https://$githubUser`:$token@github.com/$githubUser/$repoName.git"
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    git remote set-url origin "https://github.com/$githubUser/$repoName.git"
    Write-Host "  Updated origin remote" -ForegroundColor Green
} else {
    git remote add origin "https://github.com/$githubUser/$repoName.git"
    Write-Host "  Added origin remote" -ForegroundColor Green
}

Write-Host "[4/5] Staging and committing changes..." -ForegroundColor Yellow
git add -A
$status = git status --porcelain
if ($status) {
    $commitMsg = "chore: optimize PWA fullscreen, adjust form fields, prepare Cloudflare Pages"
    git commit -m $commitMsg
    Write-Host "  Committed" -ForegroundColor Green
} else {
    Write-Host "  No changes to commit" -ForegroundColor Yellow
}

Write-Host "[5/5] Pushing to GitHub..." -ForegroundColor Yellow
git remote set-url origin $remoteUrl
try {
    git push -u origin master
    Write-Host "  Push success!" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Push failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please verify Token has repo scope" -ForegroundColor Yellow
} finally {
    git remote set-url origin "https://github.com/$githubUser/$repoName.git"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Push complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repo URL: https://github.com/$githubUser/$repoName" -ForegroundColor White
Write-Host ""
Write-Host "=== NEXT: Connect to Cloudflare Pages ===" -ForegroundColor Yellow
Write-Host "1. Visit: https://dash.cloudflare.com/?to=/:account/pages" -ForegroundColor White
Write-Host "2. Click: Create a project > Connect to Git" -ForegroundColor White
Write-Host "3. Select GitHub, authorize, pick $repoName" -ForegroundColor White
Write-Host "4. Configure build settings:" -ForegroundColor White
Write-Host "   - Framework preset: None" -ForegroundColor White
Write-Host "   - Build command: npx @cloudflare/next-on-pages@1.13.16" -ForegroundColor White
Write-Host "   - Build output directory: .vercel/output/static" -ForegroundColor White
Write-Host "   - Environment variables:" -ForegroundColor White
Write-Host "     * NODE_VERSION = 20" -ForegroundColor White
Write-Host "5. Click: Save and Deploy" -ForegroundColor White
Write-Host ""
Write-Host "After deploy, you get a *.pages.dev domain" -ForegroundColor Green
Write-Host "Access from China is more stable than Vercel" -ForegroundColor Green
Write-Host ""
Write-Host "=== iPhone Add to Home Screen (PWA) ===" -ForegroundColor Yellow
Write-Host "1. Open the *.pages.dev URL in Safari" -ForegroundColor White
Write-Host "2. Tap Share button > Add to Home Screen" -ForegroundColor White
Write-Host "3. Tap icon on home screen to launch fullscreen" -ForegroundColor White

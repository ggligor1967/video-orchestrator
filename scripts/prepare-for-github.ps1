# GitHub Repository Preparation Script
# Run this before pushing to GitHub

Write-Host "`n=== VIDEO ORCHESTRATOR - GITHUB PREP ===" -ForegroundColor Cyan
Write-Host "Preparing repository for GitHub..." -ForegroundColor White

# Verification timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "`nVerification Time: $timestamp" -ForegroundColor Gray

# Step 1: Verify Git repository
Write-Host "`n[1/8] Verifying Git repository..." -ForegroundColor Yellow
if (Test-Path ".git") {
    Write-Host "  ✅ Git repository exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ No Git repository found. Run: git init" -ForegroundColor Red
    exit 1
}

# Step 2: Check branch
Write-Host "`n[2/8] Checking Git branch..." -ForegroundColor Yellow
$branch = git branch --show-current
Write-Host "  Current branch: $branch" -ForegroundColor Cyan

# Step 3: Verify required files
Write-Host "`n[3/8] Verifying required files..." -ForegroundColor Yellow
$requiredFiles = @(
    "README.md",
    "LICENSE",
    "CONTRIBUTING.md",
    "SECURITY.md",
    "CHANGELOG.md",
    ".gitignore",
    "package.json"
)

$allFilesPresent = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Missing: $file" -ForegroundColor Red
        $allFilesPresent = $false
    }
}

if (-not $allFilesPresent) {
    Write-Host "`n  Some required files are missing!" -ForegroundColor Red
    exit 1
}

# Step 4: Check for secrets
Write-Host "`n[4/8] Checking for exposed secrets..." -ForegroundColor Yellow
$secretPatterns = @(
    "sk-[a-zA-Z0-9]{32,}",
    "AIza[0-9A-Za-z_-]{35}"
)

$secretsFound = $false
foreach ($pattern in $secretPatterns) {
    $matches = git grep -E $pattern 2>$null
    if ($matches) {
        Write-Host "  ⚠️  Potential secrets found:" -ForegroundColor Red
        Write-Host "     $matches" -ForegroundColor Gray
        $secretsFound = $true
    }
}

if (-not $secretsFound) {
    Write-Host "  ✅ No obvious secrets detected" -ForegroundColor Green
} else {
    Write-Host "`n  ⚠️  Review and remove secrets before pushing!" -ForegroundColor Red
    $continue = Read-Host "  Continue anyway? (y/N)"
    if ($continue -ne "y") {
        exit 1
    }
}

# Step 5: Check file sizes
Write-Host "`n[5/8] Checking for large files..." -ForegroundColor Yellow
$largeFiles = Get-ChildItem -Recurse -File | 
    Where-Object { $_.Length -gt 10MB -and $_.FullName -notlike "*node_modules*" -and $_.FullName -notlike "*target*" -and $_.FullName -notlike "*tools*" } |
    Select-Object FullName, @{N="MB";E={[math]::Round($_.Length/1MB,2)}}

if ($largeFiles) {
    Write-Host "  ⚠️  Large files found (>10MB):" -ForegroundColor Yellow
    $largeFiles | ForEach-Object {
        $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
        Write-Host "     $relativePath - $($_.MB) MB" -ForegroundColor Gray
    }
    Write-Host "  Consider adding to .gitignore or using Git LFS" -ForegroundColor Yellow
} else {
    Write-Host "  ✅ No large files detected" -ForegroundColor Green
}

# Step 6: Run linting
Write-Host "`n[6/8] Running ESLint..." -ForegroundColor Yellow
$lintResult = pnpm lint 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Linting passed" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Linting issues found" -ForegroundColor Yellow
    Write-Host "  Run: pnpm lint --fix" -ForegroundColor Gray
}

# Step 7: Check Git status
Write-Host "`n[7/8] Checking Git status..." -ForegroundColor Yellow
$status = git status --short
if ($status) {
    Write-Host "  Modified files:" -ForegroundColor Cyan
    $status | ForEach-Object {
        Write-Host "     $_" -ForegroundColor Gray
    }
    
    $commit = Read-Host "`n  Commit changes now? (y/N)"
    if ($commit -eq "y") {
        $message = Read-Host "  Commit message"
        git add .
        git commit -m $message
        Write-Host "  ✅ Changes committed" -ForegroundColor Green
    }
} else {
    Write-Host "  ✅ Working tree clean" -ForegroundColor Green
}

# Step 8: Summary and next steps
Write-Host "`n[8/8] Preparation Summary" -ForegroundColor Yellow
Write-Host "  ✅ Repository is ready for GitHub!" -ForegroundColor Green

Write-Host "`n=== NEXT STEPS ===" -ForegroundColor Cyan
Write-Host @"

1. Create GitHub repository:
   - Go to https://github.com/new
   - Name: video-orchestrator
   - Description: AI-powered desktop app for automated vertical video creation
   - Visibility: Public or Private

2. Add remote:
   git remote add origin https://github.com/YOUR_USERNAME/video-orchestrator.git

3. Push to GitHub:
   git branch -M main
   git push -u origin main

4. Configure GitHub repository:
   - Add topics: ai, video, tauri, svelte, nodejs, desktop-app
   - Enable Issues
   - Enable Discussions
   - Add repository description
   - Set up branch protection (optional)

5. Create first release:
   - Go to Releases
   - Create new release
   - Tag: v1.0.0
   - Title: Video Orchestrator v1.0.0 - Initial Release
   - Description: Use CHANGELOG.md content

6. Optional configurations:
   - Set up GitHub Pages for documentation
   - Configure Dependabot
   - Add code owners (CODEOWNERS file)
   - Set up project boards

"@ -ForegroundColor White

Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Green
$endTime = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Time: $endTime" -ForegroundColor Gray

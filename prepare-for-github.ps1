# ================================================================
# PREPARE FOR GITHUB - VERSIUNE ÎMBUNĂTĂȚITĂ
# Script securizat pentru inițializare repository GitHub
# ================================================================

$ErrorActionPreference = "Stop"

# Colors pentru output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Warning-Custom { Write-Host "⚠️  $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }
function Write-Step { Write-Host "`n▶️  $args" -ForegroundColor Magenta }

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     VIDEO ORCHESTRATOR - GITHUB REPOSITORY SETUP          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# ================================================================
# VERIFICĂRI PRELIMINARE
# ================================================================

Write-Step "VERIFICĂRI PRELIMINARE"

# 1. Verifică Git instalat
Write-Info "Verificare Git..."
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error-Custom "Git nu este instalat!"
    Write-Host "   Descarcă de la: https://git-scm.com/download/win" -ForegroundColor Gray
    exit 1
}
$gitVersion = git --version
Write-Success "Git instalat: $gitVersion"

# ================================================================
# COLECTARE INPUT
# ================================================================

Write-Step "COLECTARE INFORMAȚII"

# 1. Cale proiect
do {
    $projectPath = Read-Host "`nIntroduceți calea către directorul proiectului"
    
    if ([string]::IsNullOrWhiteSpace($projectPath)) {
        Write-Warning-Custom "Calea nu poate fi goală!"
        continue
    }
    
    # Normalizare cale
    $projectPath = $projectPath.Trim('"').Trim("'")
    
    if (-not (Test-Path $projectPath)) {
        Write-Warning-Custom "Directorul nu există: $projectPath"
        $create = Read-Host "Doriți să-l creați? (y/N)"
        if ($create -eq "y") {
            New-Item -ItemType Directory -Path $projectPath -Force | Out-Null
            Write-Success "Director creat"
            break
        }
        continue
    }
    
    break
} while ($true)

Write-Success "Director validat: $projectPath"

# 2. Nume utilizator
do {
    $userName = Read-Host "`nIntroduceți numele dumneavoastră pentru Git"
    if ([string]::IsNullOrWhiteSpace($userName)) {
        Write-Warning-Custom "Numele nu poate fi gol!"
        continue
    }
    break
} while ($true)

# 3. Email cu validare
do {
    $userEmail = Read-Host "Introduceți adresa dumneavoastră de email"
    
    if ([string]::IsNullOrWhiteSpace($userEmail)) {
        Write-Warning-Custom "Email-ul nu poate fi gol!"
        continue
    }
    
    # Validare format email
    if ($userEmail -notmatch '^[\w\.-]+@[\w\.-]+\.\w+$') {
        Write-Warning-Custom "Email-ul nu pare valid: $userEmail"
        $continue = Read-Host "Continuă oricum? (y/N)"
        if ($continue -ne "y") {
            continue
        }
    }
    
    break
} while ($true)

# 4. URL GitHub cu validare
do {
    $repoUrl = Read-Host "`nIntroduceți URL-ul repository-ului GitHub"
    
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Warning-Custom "URL-ul nu poate fi gol!"
        continue
    }
    
    # Validare format GitHub URL
    if ($repoUrl -notmatch '^https://github\.com/[\w-]+/[\w-]+(.git)?$') {
        Write-Warning-Custom "URL-ul nu pare un URL GitHub valid"
        Write-Host "   Format așteptat: https://github.com/username/repo.git" -ForegroundColor Gray
        Write-Host "   Sau: https://github.com/username/repo" -ForegroundColor Gray
        $continue = Read-Host "Continuă oricum? (y/N)"
        if ($continue -ne "y") {
            continue
        }
    }
    
    # Adaugă .git dacă lipsește
    if ($repoUrl -notmatch '\.git$') {
        $repoUrl = "$repoUrl.git"
        Write-Info "URL normalizat la: $repoUrl"
    }
    
    break
} while ($true)

# ================================================================
# NAVIGHEAZĂ LA DIRECTOR
# ================================================================

Write-Step "NAVIGARE LA DIRECTOR PROIECT"

try {
    Set-Location $projectPath
    Write-Success "Director curent: $(Get-Location)"
} catch {
    Write-Error-Custom "Nu s-a putut accesa directorul: $_"
    exit 1
}

# ================================================================
# VERIFICARE .GITIGNORE
# ================================================================

Write-Step "VERIFICARE .GITIGNORE"

if (-not (Test-Path ".gitignore")) {
    Write-Warning-Custom ".gitignore nu există!"
    Write-Host "   Fără .gitignore, toate fișierele (inclusiv node_modules, binare) vor fi adăugate." -ForegroundColor Yellow
    Write-Host "   Aceasta poate duce la un repository FOARTE MARE și push FOARTE LENT." -ForegroundColor Yellow
    
    $createGitignore = Read-Host "`nDoriți să creați un .gitignore acum? (Y/n)"
    if ($createGitignore -ne "n") {
        # Creează .gitignore de bază
        @"
# Dependencies
node_modules/
**/node_modules/

# Build outputs
dist/
build/
target/
apps/ui/.svelte-kit/

# Environment variables
.env
.env.local

# Logs
*.log
logs/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temporary files
*.tmp
*.temp
temp/
data/tts/*.wav

# Tool binaries
tools/ffmpeg/*.exe
tools/piper/*.exe
tools/whisper/*.exe
tools/godot/*.exe
"@ | Out-File -FilePath ".gitignore" -Encoding UTF8
        Write-Success ".gitignore creat cu configurare de bază"
    } else {
        $continueAnyway = Read-Host "Continuă fără .gitignore? (y/N)"
        if ($continueAnyway -ne "y") {
            Write-Host "Operație anulată." -ForegroundColor Yellow
            exit 0
        }
    }
} else {
    Write-Success ".gitignore găsit"
}

# ================================================================
# INIȚIALIZARE GIT
# ================================================================

Write-Step "INIȚIALIZARE REPOSITORY GIT"

# Verifică dacă Git este deja inițializat
if (Test-Path ".git") {
    Write-Warning-Custom "Repository Git deja inițializat în acest director!"
    $reinit = Read-Host "Doriți să reinițializați? (y/N)"
    if ($reinit -ne "y") {
        Write-Info "Se sare peste inițializare..."
    } else {
        git init
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Git init eșuat!"
            exit 1
        }
        Write-Success "Repository reinițializat"
    }
} else {
    git init
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Git init eșuat!"
        exit 1
    }
    Write-Success "Repository Git inițializat"
}

# ================================================================
# CONFIGURARE GIT USER
# ================================================================

Write-Step "CONFIGURARE IDENTITATE GIT"

git config user.name $userName
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Configurare nume eșuată!"
    exit 1
}

git config user.email $userEmail
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Configurare email eșuat!"
    exit 1
}

Write-Success "Identitate configurată: $userName <$userEmail>"

# ================================================================
# PREVIEW FIȘIERE
# ================================================================

Write-Step "PREVIEW FIȘIERE PENTRU ADĂUGARE"

Write-Info "Scanare fișiere..."

# Dry-run pentru a vedea ce va fi adăugat
$filesToAdd = git add --dry-run . 2>&1 | Where-Object { $_ -match "^add" }
$fileCount = ($filesToAdd | Measure-Object).Count

if ($fileCount -eq 0) {
    Write-Warning-Custom "Niciun fișier nou de adăugat!"
    $showAll = Read-Host "Doriți să vedeți statusul complet? (y/N)"
    if ($showAll -eq "y") {
        git status
    }
} else {
    Write-Host "`nFișiere care vor fi adăugate:" -ForegroundColor Cyan
    
    if ($fileCount -gt 20) {
        Write-Host "($fileCount fișiere total - se afișează primele 20)" -ForegroundColor Gray
        $filesToAdd | Select-Object -First 20 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
        Write-Host "   ... și încă $($fileCount - 20) fișiere" -ForegroundColor Gray
    } else {
        $filesToAdd | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
    
    Write-Host "`n📊 Total: $fileCount fișiere" -ForegroundColor Cyan
    
    # Verificare dimensiune aproximativă
    $totalSize = (Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $totalSizeMB = [math]::Round($totalSize / 1MB, 2)
    
    if ($totalSizeMB -gt 100) {
        Write-Warning-Custom "Dimensiune totală: $totalSizeMB MB (MARE!)"
        Write-Host "   Recomandare: verificați că fișierele mari sunt în .gitignore" -ForegroundColor Yellow
    } else {
        Write-Info "Dimensiune totală: $totalSizeMB MB"
    }
}

$confirm = Read-Host "`nContinuă cu adăugarea acestor fișiere? (Y/n)"
if ($confirm -eq "n") {
    Write-Host "Operație anulată. Puteți ajusta .gitignore și reîncerca." -ForegroundColor Yellow
    exit 0
}

# ================================================================
# ADĂUGARE FIȘIERE
# ================================================================

Write-Step "ADĂUGARE FIȘIERE ÎN STAGING"

git add .
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Git add eșuat!"
    exit 1
}

Write-Success "Fișiere adăugate în staging"

# ================================================================
# COMMIT
# ================================================================

Write-Step "COMMIT MODIFICĂRI"

do {
    $commitMessage = Read-Host "`nIntroduceți mesajul de commit"
    
    if ([string]::IsNullOrWhiteSpace($commitMessage)) {
        Write-Warning-Custom "Mesajul de commit nu poate fi gol!"
        continue
    }
    
    # Sugestie pentru conventional commits
    if ($commitMessage -notmatch '^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+') {
        Write-Warning-Custom "Mesajul nu urmează formatul Conventional Commits"
        Write-Host "   Exemplu: 'feat: add new feature' sau 'fix: resolve bug'" -ForegroundColor Gray
        $useAnyway = Read-Host "Folosește oricum acest mesaj? (y/N)"
        if ($useAnyway -ne "y") {
            continue
        }
    }
    
    break
} while ($true)

git commit -m $commitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Git commit eșuat!"
    exit 1
}

Write-Success "Commit creat: $commitMessage"

# ================================================================
# BRANCH
# ================================================================

Write-Step "VERIFICARE BRANCH"

$currentBranch = git branch --show-current
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Write-Info "Niciun branch setat, creăm branch principal..."
    $branchName = Read-Host "Nume branch principal (main/master) [main]"
    if ([string]::IsNullOrWhiteSpace($branchName)) {
        $branchName = "main"
    }
    
    git checkout -b $branchName
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Creare branch eșuată!"
        exit 1
    }
    Write-Success "Branch creat: $branchName"
} else {
    $branchName = $currentBranch
    Write-Success "Branch curent: $branchName"
}

# ================================================================
# REMOTE
# ================================================================

Write-Step "CONFIGURARE REMOTE"

# Verifică dacă remote există deja
$existingRemote = git remote get-url origin 2>$null
if ($existingRemote) {
    Write-Warning-Custom "Remote 'origin' deja configurat: $existingRemote"
    $overwrite = Read-Host "Suprascrie cu noul URL? (y/N)"
    if ($overwrite -eq "y") {
        git remote set-url origin $repoUrl
        if ($LASTEXITCODE -ne 0) {
            Write-Error-Custom "Actualizare remote eșuată!"
            exit 1
        }
        Write-Success "Remote actualizat"
    }
} else {
    git remote add origin $repoUrl
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Custom "Adăugare remote eșuată!"
        exit 1
    }
    Write-Success "Remote adăugat: origin -> $repoUrl"
}

# ================================================================
# PUSH
# ================================================================

Write-Step "PUSH CĂTRE GITHUB"

Write-Host "`n⚠️  Atenție: Urmează să trimiteți codul către GitHub!" -ForegroundColor Yellow
Write-Host "   Repository: $repoUrl" -ForegroundColor Gray
Write-Host "   Branch: $branchName" -ForegroundColor Gray
Write-Host "   Fișiere: $fileCount" -ForegroundColor Gray
Write-Host "   Dimensiune: $totalSizeMB MB" -ForegroundColor Gray

$finalConfirm = Read-Host "`nContinuați cu push-ul? (Y/n)"
if ($finalConfirm -eq "n") {
    Write-Host "`nOperație anulată." -ForegroundColor Yellow
    Write-Host "Modificările sunt comise local. Puteți face push manual mai târziu cu:" -ForegroundColor Cyan
    Write-Host "   git push -u origin $branchName" -ForegroundColor Gray
    exit 0
}

Write-Info "Se trimite codul către GitHub..."

git push -u origin $branchName
if ($LASTEXITCODE -ne 0) {
    Write-Error-Custom "Git push eșuat!"
    Write-Host "`nPosibile cauze:" -ForegroundColor Yellow
    Write-Host "   - Repository-ul nu există pe GitHub" -ForegroundColor Gray
    Write-Host "   - Nu aveți permisiuni de write" -ForegroundColor Gray
    Write-Host "   - Autentificare necesară (Git Credential Manager)" -ForegroundColor Gray
    Write-Host "`nSoluție:" -ForegroundColor Cyan
    Write-Host "   1. Creați repository-ul pe GitHub: $repoUrl" -ForegroundColor Gray
    Write-Host "   2. Verificați autentificarea Git" -ForegroundColor Gray
    Write-Host "   3. Reîncercați: git push -u origin $branchName" -ForegroundColor Gray
    exit 1
}

# ================================================================
# SUCCESS!
# ================================================================

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                  ✅ SUCCESS!                               ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "🎉 Repository creat și publicat cu succes pe GitHub!" -ForegroundColor Green
Write-Host "`n📦 Detalii:" -ForegroundColor Cyan
Write-Host "   Repository: $repoUrl" -ForegroundColor White
Write-Host "   Branch: $branchName" -ForegroundColor White
Write-Host "   Commit: $commitMessage" -ForegroundColor White
Write-Host "   Fișiere: $fileCount" -ForegroundColor White

Write-Host "`n🔗 Link-uri utile:" -ForegroundColor Cyan
$repoWebUrl = $repoUrl -replace '\.git$', ''
Write-Host "   Repository: $repoWebUrl" -ForegroundColor Blue
Write-Host "   Commits: $repoWebUrl/commits/$branchName" -ForegroundColor Blue
Write-Host "   Settings: $repoWebUrl/settings" -ForegroundColor Blue

Write-Host "`n📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Adăugați topics pe GitHub (ai, video, tauri, svelte)" -ForegroundColor Gray
Write-Host "   2. Configurați branch protection" -ForegroundColor Gray
Write-Host "   3. Activați GitHub Issues și Discussions" -ForegroundColor Gray
Write-Host "   4. Creați primul release (v1.0.0)" -ForegroundColor Gray

Write-Host "`n✨ Happy coding! ✨`n" -ForegroundColor Magenta

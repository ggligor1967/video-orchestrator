# Verifică dacă rulezi scriptul cu drepturi de administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️ Acest script necesită privilegii de administrator. Repornește PowerShell ca Administrator." -ForegroundColor Yellow
    exit 1
}

# Verifică dacă winget este instalat
if (-not (Get-Command winget -ErrorAction SilentlyContinue)) {
    Write-Host "❌ winget nu este instalat. Te rog instalează-l din Microsoft Store sau de la:" -ForegroundColor Red
    Write-Host "https://learn.microsoft.com/en-us/windows/package-manager/winget/"
    exit 1
} else {
    Write-Host "✅ winget este disponibil." -ForegroundColor Green
}

# Verifică și instalează Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Instalez Node.js..." -ForegroundColor Cyan
    winget install --id OpenJS.NodeJS -e --accept-package-agreements --accept-source-agreements
    Write-Host "✅ Node.js instalat." -ForegroundColor Green
} else {
    Write-Host "✅ Node.js este deja instalat: $(node -v)" -ForegroundColor Green
}

# Instalează Rust
Write-Host "📦 Instalez Rust..." -ForegroundColor Cyan
winget install --id Rustlang.Rustup -e --accept-package-agreements --accept-source-agreements
Write-Host "✅ Rust instalat." -ForegroundColor Green

# Setează toolchain-ul MSVC
Write-Host "🔧 Setez toolchain-ul MSVC..." -ForegroundColor Cyan
rustup default stable-msvc
Write-Host "✅ Toolchain MSVC setat." -ForegroundColor Green

# Instalează Visual Studio Build Tools
Write-Host "📦 Instalez Visual Studio Build Tools..." -ForegroundColor Cyan
winget install --id Microsoft.VisualStudio.2022.BuildTools -e --accept-package-agreements --accept-source-agreements
Write-Host "✅ Visual Studio Build Tools instalat." -ForegroundColor Green

# Instalează Microsoft Edge WebView2 Runtime
Write-Host "📦 Instalez Microsoft Edge WebView2 Runtime..." -ForegroundColor Cyan
winget install --id Microsoft.EdgeWebView2Runtime -e --accept-package-agreements --accept-source-agreements
Write-Host "✅ WebView2 Runtime instalat." -ForegroundColor Green

# Instalează create-tauri-app
Write-Host "📦 Instalez create-tauri-app..." -ForegroundColor Cyan
cargo install create-tauri-app --locked
Write-Host "✅ create-tauri-app instalat." -ForegroundColor Green

# Creează proiectul Tauri
$projectName = "my-tauri-test-app"
Write-Host "🏗 Creez proiectul Tauri: $projectName..." -ForegroundColor Cyan
npm create tauri-app@latest $projectName -- --template vanilla

# Intră în directorul proiectului și instalează dependențele
Set-Location $projectName
Write-Host "📦 Instalez dependențele proiectului..." -ForegroundColor Cyan
npm install

# Pornește aplicația în modul de dezvoltare
Write-Host "🚀 Pornește aplicația Tauri în modul de dezvoltare..." -ForegroundColor Green
npm run tauri dev

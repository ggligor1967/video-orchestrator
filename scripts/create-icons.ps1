# Create Icons Script
Write-Host "Creating placeholder icons for Tauri build..." -ForegroundColor Cyan

$iconsDir = "apps\ui\src-tauri\icons"

# Create icons directory if it doesn't exist
if (!(Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Path $iconsDir -Force
}

# Create placeholder icon files (these would normally be actual image files)
$iconSizes = @("32x32.png", "128x128.png", "128x128@2x.png", "icon.icns", "icon.ico", "icon.png")

foreach ($icon in $iconSizes) {
    $iconPath = Join-Path $iconsDir $icon
    # Create empty placeholder files
    New-Item -ItemType File -Path $iconPath -Force
    Write-Host "Created placeholder: $icon" -ForegroundColor Green
}

Write-Host "Icons created successfully!" -ForegroundColor Green
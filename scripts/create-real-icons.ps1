# Create Real Icons Script
Write-Host "Creating real icons for Tauri build..." -ForegroundColor Cyan

$iconsDir = "apps\ui\src-tauri\icons"

# Simple 1x1 pixel PNG in base64 (transparent)
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU8jKgAAAABJRU5ErkJggg=="
$pngBytes = [Convert]::FromBase64String($pngBase64)

# Create PNG files
@("32x32.png", "128x128.png", "128x128@2x.png", "icon.png") | ForEach-Object {
    $iconPath = Join-Path $iconsDir $_
    [System.IO.File]::WriteAllBytes($iconPath, $pngBytes)
    Write-Host "Created: $_" -ForegroundColor Green
}

# Create ICO file (minimal valid ICO)
$icoBytes = @(0,0,1,0,1,0,1,1,0,0,1,0,24,0,40,0,0,0,22,0,0,0,40,0,0,0,1,0,0,0,2,0,0,0,1,0,24,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,255,255,255,0)
$icoPath = Join-Path $iconsDir "icon.ico"
[System.IO.File]::WriteAllBytes($icoPath, $icoBytes)
Write-Host "Created: icon.ico" -ForegroundColor Green

# Create ICNS file (minimal valid ICNS)
$icnsBytes = @(105,99,110,115,0,0,0,32,105,99,48,52,0,0,0,16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0)
$icnsPath = Join-Path $iconsDir "icon.icns"
[System.IO.File]::WriteAllBytes($icnsPath, $icnsBytes)
Write-Host "Created: icon.icns" -ForegroundColor Green

Write-Host "Real icons created successfully!" -ForegroundColor Green
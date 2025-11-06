# Set WiX Toolset in PATH
# This script must be run before building MSI

$wixPath = "d:\playground\Aplicatia\WiX Toolset\extracted"

if (Test-Path "$wixPath\candle.exe") {
    $env:Path = "$wixPath;$env:Path"
    Write-Host " WiX Toolset added to PATH" -ForegroundColor Green
    Write-Host "   Path: $wixPath" -ForegroundColor Gray
    
    # Verify
    $version = & "$wixPath\candle.exe" -? 2>&1 | Select-Object -First 1
    Write-Host "   Version: $version" -ForegroundColor Gray
} else {
    Write-Host " WiX Toolset not found at: $wixPath" -ForegroundColor Red
    exit 1
}

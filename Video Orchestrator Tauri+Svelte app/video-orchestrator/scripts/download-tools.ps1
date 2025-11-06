# Download Tools Script

$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { Write-Host "✅ $args" -ForegroundColor Green }
function Write-Error-Custom { Write-Host "❌ $args" -ForegroundColor Red }
function Write-Info { Write-Host "ℹ️  $args" -ForegroundColor Cyan }

Write-Host "`nStarting tool downloads..."

# Define tools and their download URLs
$tools = @{
    "ffmpeg" = "https://ffmpeg.org/releases/ffmpeg-release-full.7z"
    "piper" = "https://example.com/path/to/piper.zip"
    "whisper" = "https://example.com/path/to/whisper.zip"
}

# Directory to store tools
$toolsDir = "tools"

# Create tools directory if it doesn't exist
if (-not (Test-Path $toolsDir)) {
    New-Item -ItemType Directory -Path $toolsDir | Out-Null
    Write-Success "Created directory: $toolsDir"
}

# Function to download a tool
function Download-Tool {
    param (
        [string]$toolName,
        [string]$url
    )
    
    $outputPath = Join-Path -Path $toolsDir -ChildPath "$toolName.zip"
    
    Write-Info "Downloading $toolName from $url..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $outputPath
        Write-Success "$toolName downloaded successfully."
    } catch {
        Write-Error-Custom "Failed to download $toolName: $_"
    }
}

# Download each tool
foreach ($tool in $tools.GetEnumerator()) {
    Download-Tool -toolName $tool.Key -url $tool.Value
}

Write-Host "`nAll tools download process completed!"
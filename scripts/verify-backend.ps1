# Backend Verification Script - Video Orchestrator
# Created: November 3, 2025
# Purpose: Verify backend server health and API endpoints

Write-Host "=== Backend Health Check ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host ""

# Navigate to backend directory
$backendPath = "apps\orchestrator"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Backend directory not found: $backendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Backend directory: $backendPath" -ForegroundColor Gray
Set-Location $backendPath

# Check if package.json exists
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in backend directory" -ForegroundColor Red
    Set-Location ..\..
    exit 1
}

Write-Host "Starting backend server..." -ForegroundColor Yellow

# Start backend in background job
$backendJob = Start-Job -ScriptBlock {
    param($path)
    Set-Location $path
    npm run dev 2>&1
} -ArgumentList (Get-Location).Path

Write-Host "Waiting for backend to start (8 seconds)..." -ForegroundColor Gray
Start-Sleep -Seconds 8

# Test endpoints
$endpoints = @(
    @{Url="http://127.0.0.1:4545/health"; Method="GET"; Description="Health check"},
    @{Url="http://127.0.0.1:4545/api/ai/status"; Method="GET"; Description="AI service status"},
    @{Url="http://127.0.0.1:4545/api/video/status"; Method="GET"; Description="Video service status"}
)

$results = @()
$successCount = 0

Write-Host "`n=== Testing Endpoints ===" -ForegroundColor Cyan

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting: $($endpoint.Description)" -ForegroundColor Yellow
    Write-Host "  URL: $($endpoint.Url)" -ForegroundColor Gray
    Write-Host "  Method: $($endpoint.Method)" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Status: $($response.StatusCode) OK" -ForegroundColor Green
            $results += @{
                Endpoint = $endpoint.Url
                Status = "Success"
                StatusCode = $response.StatusCode
            }
            $successCount++
        } else {
            Write-Host "  ⚠️ Status: $($response.StatusCode)" -ForegroundColor Yellow
            $results += @{
                Endpoint = $endpoint.Url
                Status = "Warning"
                StatusCode = $response.StatusCode
            }
        }
    } catch {
        Write-Host "  ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Endpoint = $endpoint.Url
            Status = "Failed"
            Error = $_.Exception.Message
        }
    }
}

# Cleanup
Write-Host "`n=== Cleanup ===" -ForegroundColor Cyan
Write-Host "Stopping backend server..." -ForegroundColor Gray

Stop-Job $backendJob -ErrorAction SilentlyContinue
Remove-Job $backendJob -ErrorAction SilentlyContinue

# Return to root directory
Set-Location ..\..

# Summary
Write-Host "`n=== Results Summary ===" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date)" -ForegroundColor Gray
Write-Host "Endpoints tested: $($endpoints.Count)" -ForegroundColor Gray
Write-Host "Successful: $successCount/$($endpoints.Count)" -ForegroundColor $(if($successCount -eq $endpoints.Count){'Green'}elseif($successCount -gt 0){'Yellow'}else{'Red'})

if ($successCount -eq $endpoints.Count) {
    Write-Host "`n✅ Backend is FULLY FUNCTIONAL" -ForegroundColor Green
    Write-Host "All endpoints responding correctly" -ForegroundColor Green
    exit 0
} elseif ($successCount -gt 0) {
    Write-Host "`n⚠️ Backend is PARTIALLY FUNCTIONAL" -ForegroundColor Yellow
    Write-Host "Some endpoints have issues" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`n❌ Backend has CRITICAL ISSUES" -ForegroundColor Red
    Write-Host "No endpoints responding" -ForegroundColor Red
    exit 1
}

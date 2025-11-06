# Video Orchestrator - Service Starter
# Pornește backend și frontend în terminale separate

param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$CheckStatus
)

$ErrorActionPreference = "SilentlyContinue"

function Show-Banner {
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║        VIDEO ORCHESTRATOR - Service Manager        ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan
}

function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $null -ne $connection
}

function Stop-ServiceOnPort {
    param([int]$Port, [string]$ServiceName)
    
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        Write-Host "🛑 Stopping existing $ServiceName on port $Port..." -ForegroundColor Yellow
        foreach ($conn in $connections) {
            Stop-Process -Id $conn.OwningProcess -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
}

function Start-Backend {
    Write-Host "`n📦 Starting Backend (Port 4545)..." -ForegroundColor Green
    
    # Check if already running
    if (Test-PortInUse -Port 4545) {
        Write-Host "⚠️  Backend already running on port 4545" -ForegroundColor Yellow
        $restart = Read-Host "   Restart? (y/n)"
        if ($restart -eq 'y') {
            Stop-ServiceOnPort -Port 4545 -ServiceName "Backend"
        } else {
            return
        }
    }
    
    # Start backend in new PowerShell window
    $backendPath = Join-Path $PSScriptRoot "apps\orchestrator"
    $startCmd = "cd '$backendPath'; pnpm dev"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd
    
    Write-Host "✅ Backend starting..." -ForegroundColor Green
    Write-Host "   URL: http://127.0.0.1:4545" -ForegroundColor White
    Write-Host "   Logs: Check new PowerShell window`n" -ForegroundColor White
}

function Start-Frontend {
    Write-Host "`n🎨 Starting Frontend (Port 1421)..." -ForegroundColor Green
    
    # Check if already running
    if (Test-PortInUse -Port 1421) {
        Write-Host "⚠️  Frontend already running on port 1421" -ForegroundColor Yellow
        $restart = Read-Host "   Restart? (y/n)"
        if ($restart -eq 'y') {
            Stop-ServiceOnPort -Port 1421 -ServiceName "Frontend"
        } else {
            return
        }
    }
    
    # Start frontend in new PowerShell window
    $frontendPath = Join-Path $PSScriptRoot "apps\ui"
    $startCmd = "cd '$frontendPath'; pnpm dev"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd
    
    Write-Host "✅ Frontend starting..." -ForegroundColor Green
    Write-Host "   URL: http://127.0.0.1:1421" -ForegroundColor White
    Write-Host "   Logs: Check new PowerShell window`n" -ForegroundColor White
}

function Start-BothServices {
    Write-Host "`n🚀 Starting Both Services..." -ForegroundColor Cyan
    
    # Stop existing if running
    if (Test-PortInUse -Port 4545) {
        Stop-ServiceOnPort -Port 4545 -ServiceName "Backend"
    }
    if (Test-PortInUse -Port 1421) {
        Stop-ServiceOnPort -Port 1421 -ServiceName "Frontend"
    }
    
    # Start both in new PowerShell window
    $startCmd = "cd '$PSScriptRoot'; pnpm dev"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $startCmd
    
    Write-Host "✅ Both services starting..." -ForegroundColor Green
    Write-Host "   Backend:  http://127.0.0.1:4545" -ForegroundColor White
    Write-Host "   Frontend: http://127.0.0.1:1421" -ForegroundColor White
    Write-Host "   Logs: Check new PowerShell window`n" -ForegroundColor White
}

function Show-Status {
    Write-Host "`n📊 Service Status:" -ForegroundColor Cyan
    
    # Check Backend
    if (Test-PortInUse -Port 4545) {
        Write-Host "✅ Backend:  RUNNING on port 4545" -ForegroundColor Green
        try {
            $health = Invoke-RestMethod "http://127.0.0.1:4545/health" -TimeoutSec 2
            Write-Host "   Status: $($health.status)" -ForegroundColor White
        } catch {
            Write-Host "   Status: Port occupied but not responding" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Backend:  NOT RUNNING" -ForegroundColor Red
    }
    
    # Check Frontend
    if (Test-PortInUse -Port 1421) {
        Write-Host "✅ Frontend: RUNNING on port 1421" -ForegroundColor Green
        try {
            $response = Invoke-WebRequest "http://127.0.0.1:1421" -TimeoutSec 2 -UseBasicParsing
            Write-Host "   Status: HTTP $($response.StatusCode)" -ForegroundColor White
        } catch {
            Write-Host "   Status: Port occupied but not responding" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Frontend: NOT RUNNING" -ForegroundColor Red
    }
    
    Write-Host ""
}

# Main execution
Show-Banner

if ($CheckStatus) {
    Show-Status
    exit 0
}

if ($BackendOnly) {
    Start-Backend
    Start-Sleep -Seconds 5
    Show-Status
} elseif ($FrontendOnly) {
    Start-Frontend
    Start-Sleep -Seconds 5
    Show-Status
} else {
    # Start both services
    Start-BothServices
    Start-Sleep -Seconds 5
    Show-Status
}

Write-Host "💡 Tips:" -ForegroundColor Cyan
Write-Host "   - Services run in separate windows" -ForegroundColor White
Write-Host "   - Close windows to stop services" -ForegroundColor White
Write-Host "   - Run with -CheckStatus to see current state" -ForegroundColor White
Write-Host "   - Run with -BackendOnly or -FrontendOnly for individual services" -ForegroundColor White
Write-Host ""

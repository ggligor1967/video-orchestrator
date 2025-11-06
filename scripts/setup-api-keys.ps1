# Setup API Keys Script - Video Orchestrator
# Created: November 5, 2025
# Purpose: Help users configure real API keys for production use

Write-Host "=== Video Orchestrator - API Keys Setup ===" -ForegroundColor Cyan
Write-Host "This script will help you configure real API keys for production use." -ForegroundColor White
Write-Host ""

# Check current .env file
$envPath = ".env"
if (-not (Test-Path $envPath)) {
    Write-Host "❌ .env file not found at $envPath" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Current API Key Status:" -ForegroundColor Yellow
$content = Get-Content $envPath

# Check AI API keys
$openaiKey = ($content | Select-String "OPENAI_API_KEY=" | ForEach-Object { $_.Line -replace "OPENAI_API_KEY=", "" }).Trim()
$geminiKey = ($content | Select-String "GEMINI_API_KEY=" | ForEach-Object { $_.Line -replace "GEMINI_API_KEY=", "" }).Trim()
$aiProvider = ($content | Select-String "AI_PROVIDER=" | ForEach-Object { $_.Line -replace "AI_PROVIDER=", "" }).Trim()

Write-Host "🤖 AI APIs:" -ForegroundColor Cyan
if ($openaiKey -and $openaiKey -ne "your_openai_api_key_here") {
    Write-Host "  ✅ OpenAI API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ OpenAI API Key: Not configured" -ForegroundColor Red
    Write-Host "    Get key from: https://platform.openai.com/api-keys" -ForegroundColor Gray
}

if ($geminiKey -and $geminiKey -ne "your_gemini_api_key_here") {
    Write-Host "  ✅ Gemini API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ Gemini API Key: Not configured" -ForegroundColor Red
    Write-Host "    Get key from: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
}

Write-Host "  Current AI Provider: $aiProvider" -ForegroundColor White

# Check Stock Media API keys
$pexelsKey = ($content | Select-String "PEXELS_API_KEY=" | ForEach-Object { $_.Line -replace "PEXELS_API_KEY=", "" }).Trim()
$pixabayKey = ($content | Select-String "PIXABAY_API_KEY=" | ForEach-Object { $_.Line -replace "PIXABAY_API_KEY=", "" }).Trim()

Write-Host ""
Write-Host "🖼️  Stock Media APIs:" -ForegroundColor Cyan
if ($pexelsKey -and $pexelsKey -ne "your_pexels_api_key_here") {
    Write-Host "  ✅ Pexels API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ Pexels API Key: Not configured" -ForegroundColor Red
    Write-Host "    Get key from: https://www.pexels.com/api/" -ForegroundColor Gray
}

if ($pixabayKey -and $pixabayKey -ne "your_pixabay_api_key_here") {
    Write-Host "  ✅ Pixabay API Key: Configured" -ForegroundColor Green
} else {
    Write-Host "  ❌ Pixabay API Key: Not configured" -ForegroundColor Red
    Write-Host "    Get key from: https://pixabay.com/api/docs/" -ForegroundColor Gray
}

Write-Host ""
Write-Host "🔧 Setup Options:" -ForegroundColor Yellow
Write-Host "1. Configure AI API Keys (OpenAI or Gemini)" -ForegroundColor White
Write-Host "2. Configure Stock Media API Keys (Pexels/Pixabay)" -ForegroundColor White
Write-Host "3. Switch to mock mode for testing" -ForegroundColor White
Write-Host "4. Open .env file for manual editing" -ForegroundColor White
Write-Host "5. Test current configuration" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select an option (1-6)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🤖 AI API Key Setup:" -ForegroundColor Cyan
        Write-Host "Choose your AI provider:" -ForegroundColor White
        Write-Host "1. OpenAI (GPT-4)" -ForegroundColor White
        Write-Host "2. Google Gemini" -ForegroundColor White
        Write-Host "3. Both (recommended)" -ForegroundColor White
        Write-Host ""

        $aiChoice = Read-Host "Select AI provider (1-3)"

        $newContent = $content

        switch ($aiChoice) {
            "1" {
                $openaiKey = Read-Host "Enter your OpenAI API key (starts with sk-)"
                if ($openaiKey -match "^sk-") {
                    $newContent = $newContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$openaiKey"
                    $newContent = $newContent -replace "AI_PROVIDER=.*", "AI_PROVIDER=openai"
                    Write-Host "✅ OpenAI API key configured" -ForegroundColor Green
                } else {
                    Write-Host "❌ Invalid OpenAI API key format" -ForegroundColor Red
                }
            }
            "2" {
                $geminiKey = Read-Host "Enter your Google Gemini API key"
                if ($geminiKey) {
                    $newContent = $newContent -replace "GEMINI_API_KEY=.*", "GEMINI_API_KEY=$geminiKey"
                    $newContent = $newContent -replace "AI_PROVIDER=.*", "AI_PROVIDER=gemini"
                    Write-Host "✅ Gemini API key configured" -ForegroundColor Green
                } else {
                    Write-Host "❌ Invalid Gemini API key" -ForegroundColor Red
                }
            }
            "3" {
                $openaiKey = Read-Host "Enter your OpenAI API key (starts with sk-)"
                $geminiKey = Read-Host "Enter your Google Gemini API key"

                if ($openaiKey -match "^sk-" -and $geminiKey) {
                    $newContent = $newContent -replace "OPENAI_API_KEY=.*", "OPENAI_API_KEY=$openaiKey"
                    $newContent = $newContent -replace "GEMINI_API_KEY=.*", "GEMINI_API_KEY=$geminiKey"
                    $newContent = $newContent -replace "AI_PROVIDER=.*", "AI_PROVIDER=openai"  # Default to OpenAI
                    Write-Host "✅ Both AI API keys configured" -ForegroundColor Green
                } else {
                    Write-Host "❌ Invalid API key format(s)" -ForegroundColor Red
                }
            }
        }

        $newContent | Set-Content $envPath
    }

    "2" {
        Write-Host ""
        Write-Host "🖼️  Stock Media API Key Setup:" -ForegroundColor Cyan

        $pexelsKey = Read-Host "Enter your Pexels API key (optional)"
        $pixabayKey = Read-Host "Enter your Pixabay API key (optional)"

        $newContent = $content

        if ($pexelsKey) {
            $newContent = $newContent -replace "PEXELS_API_KEY=.*", "PEXELS_API_KEY=$pexelsKey"
            Write-Host "✅ Pexels API key configured" -ForegroundColor Green
        }

        if ($pixabayKey) {
            $newContent = $newContent -replace "PIXABAY_API_KEY=.*", "PIXABAY_API_KEY=$pixabayKey"
            Write-Host "✅ Pixabay API key configured" -ForegroundColor Green
        }

        if (-not $pexelsKey -and -not $pixabayKey) {
            Write-Host "ℹ️  No stock media keys configured - app will work but without stock footage" -ForegroundColor Yellow
        }

        $newContent | Set-Content $envPath
    }

    "3" {
        Write-Host ""
        Write-Host "🔄 Switching to mock mode for testing..." -ForegroundColor Cyan
        $newContent = $content -replace "AI_PROVIDER=.*", "AI_PROVIDER=mock"
        $newContent | Set-Content $envPath
        Write-Host "✅ Switched to mock AI provider" -ForegroundColor Green
        Write-Host "ℹ️  App will use mock responses for testing without real API calls" -ForegroundColor Yellow
    }

    "4" {
        Write-Host ""
        Write-Host "📝 Opening .env file for manual editing..." -ForegroundColor Cyan
        notepad $envPath
        Write-Host "✅ .env file opened in Notepad" -ForegroundColor Green
    }

    "5" {
        Write-Host ""
        Write-Host "🧪 Testing current configuration..." -ForegroundColor Cyan

        # Test backend health
        try {
            $health = Invoke-RestMethod -Uri "http://127.0.0.1:4545/health" -Method GET -TimeoutSec 5
            Write-Host "✅ Backend is running" -ForegroundColor Green
            Write-Host "   AI Status: $($health.ai)" -ForegroundColor White
            Write-Host "   Tools Status: $($health.tools)" -ForegroundColor White
        } catch {
            Write-Host "❌ Backend not running or not responding" -ForegroundColor Red
            Write-Host "   Start backend with: pnpm --filter @app/orchestrator dev" -ForegroundColor Yellow
        }

        # Test AI configuration
        if ($aiProvider -eq "mock") {
            Write-Host "✅ AI configured for mock/testing mode" -ForegroundColor Green
        } elseif ($openaiKey -and $openaiKey -ne "your_openai_api_key_here") {
            Write-Host "✅ AI configured with real OpenAI key" -ForegroundColor Green
        } elseif ($geminiKey -and $geminiKey -ne "your_gemini_api_key_here") {
            Write-Host "✅ AI configured with real Gemini key" -ForegroundColor Green
        } else {
            Write-Host "❌ AI not properly configured" -ForegroundColor Red
        }
    }

    "6" {
        Write-Host "👋 Goodbye!" -ForegroundColor Cyan
        exit 0
    }

    default {
        Write-Host "❌ Invalid choice. Please select 1-6." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Configuration updated! Restart the backend to apply changes." -ForegroundColor Green
Write-Host "   Run: pnpm --filter @app/orchestrator dev" -ForegroundColor Yellow</content>
<parameter name="filePath">d:\playground\Aplicatia\scripts\setup-api-keys.ps1
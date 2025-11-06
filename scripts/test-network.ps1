# Test Network Connectivity
Write-Host "🌐 Testing Network Connectivity..." -ForegroundColor Cyan

$endpoints = @(
    @{ Name = "Backend API"; Url = "http://127.0.0.1:4545/health" },
    @{ Name = "OpenAI API"; Url = "https://api.openai.com" },
    @{ Name = "Google Gemini"; Url = "https://generativelanguage.googleapis.com" },
    @{ Name = "Pexels API"; Url = "https://api.pexels.com" },
    @{ Name = "Pixabay API"; Url = "https://pixabay.com" }
)

$results = @()

foreach ($endpoint in $endpoints) {
    Write-Host "`nTesting $($endpoint.Name)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method GET -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✓ $($endpoint.Name): OK (Status: $($response.StatusCode))" -ForegroundColor Green
        $results += @{ Name = $endpoint.Name; Status = "OK"; Code = $response.StatusCode }
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -like "*Could not connect*" -or $errorMsg -like "*Unable to connect*") {
            Write-Host "  ✗ $($endpoint.Name): Connection Failed" -ForegroundColor Red
            $results += @{ Name = $endpoint.Name; Status = "Failed"; Code = "N/A" }
        }
        elseif ($errorMsg -like "*401*" -or $errorMsg -like "*403*") {
            Write-Host "  ⚠ $($endpoint.Name): Auth Required (Expected)" -ForegroundColor Yellow
            $results += @{ Name = $endpoint.Name; Status = "Auth Required"; Code = "401/403" }
        }
        else {
            Write-Host "  ⚠ $($endpoint.Name): $errorMsg" -ForegroundColor Yellow
            $results += @{ Name = $endpoint.Name; Status = "Error"; Code = $errorMsg }
        }
    }
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Network Test Summary" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

foreach ($result in $results) {
    $color = switch ($result.Status) {
        "OK" { "Green" }
        "Auth Required" { "Yellow" }
        default { "Red" }
    }
    Write-Host "$($result.Name.PadRight(20)) : $($result.Status) ($($result.Code))" -ForegroundColor $color
}

Write-Host ""

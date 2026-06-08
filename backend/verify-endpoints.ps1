# Start the backend server in the background
$serverProcess = Start-Process -FilePath ".\.venv\Scripts\python.exe" -ArgumentList "-m uvicorn app.main:app --host 127.0.0.1 --port 8000" -PassThru -NoNewWindow
Write-Host "Waiting 3 seconds for uvicorn to boot..."
Start-Sleep -Seconds 3

try {
    Write-Host "`n=== TESTING /api/channels ==="
    $channels = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/channels" -Method Get
    $channels | ConvertTo-Json -Depth 4

    Write-Host "`n=== TESTING /api/overlap (Tech / US) ==="
    $overlapBody = @{
        linkedin_filters = @{
            industries = @("Tech")
            regions = @("US")
        }
        gdelt_filters = @{
            categories = @("Technology")
            regions = @("US")
        }
    } | ConvertTo-Json
    $overlap = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/overlap" -Method Post -ContentType "application/json" -Body $overlapBody
    $overlap | ConvertTo-Json

    Write-Host "`n=== TESTING /api/reach ==="
    $reachBody = @{
        linkedin_filters = @{
            industries = @("Tech")
        }
        gdelt_filters = @{
            categories = @("Technology")
        }
        budget_allocation = @{
            linkedin = 15000
            gdelt = 10000
        }
    } | ConvertTo-Json
    $reach = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/reach" -Method Post -ContentType "application/json" -Body $reachBody
    $reach | ConvertTo-Json -Depth 4
}
catch {
    Write-Error $_
}
finally {
    Write-Host "`nShutting down backend server..."
    Stop-Process -Id $serverProcess.Id -Force
}

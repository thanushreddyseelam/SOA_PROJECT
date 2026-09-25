# ==============================================================================
# UrbanGlide — Stop All Running Microservices
# ==============================================================================
# Gracefully terminates processes running on ports:
# 8761, 8090, 8087, 8089, 8088, 8086, 8080
# ==============================================================================

$ports = @(8761, 8090, 8087, 8089, 8088, 8086, 8080)

Write-Host "Stopping UrbanGlide microservices..." -ForegroundColor Yellow

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        $pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $pids) {
            try {
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                Write-Host "Stopped process $procId on port $port" -ForegroundColor Green
            } catch {
                Write-Host "Could not stop process $procId on port $port" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "No process listening on port $port" -ForegroundColor Gray
    }
}

Write-Host "All UrbanGlide services stopped." -ForegroundColor Green

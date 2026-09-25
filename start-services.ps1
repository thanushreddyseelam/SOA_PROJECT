# ==============================================================================
# UrbanGlide — Manual Multi-Service Startup Script
# ==============================================================================
# Launches all 6 microservices in their own dedicated PowerShell windows.
# Start order:
#   1. eureka-server   (Port 8761)
#   2. auth-service     (Port 8090)
#   3. driver-service   (Port 8087)
#   4. payment-service  (Port 8088)
#   5. ride-service     (Port 8086)
#   6. api-gateway      (Port 8080)
# ==============================================================================

$root = $PSScriptRoot

# Locate Maven
$mvn = "mvn"
if (Test-Path "$env:TEMP\maven\apache-maven-3.9.6\bin\mvn.cmd") {
    $mvn = "$env:TEMP\maven\apache-maven-3.9.6\bin\mvn.cmd"
}

# Locate JDK 17
$javaHome = "C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot"
if (-not (Test-Path $javaHome) -and $env:JAVA_HOME) {
    $javaHome = $env:JAVA_HOME
}

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ">> Starting UrbanGlide Microservices Stack Manually" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

function Start-Microservice($name, $port, $waitSec) {
    Write-Host "[STARTING] $name on port $port..." -ForegroundColor Yellow
    $cmd = "`$env:JAVA_HOME = '$javaHome'; & '$mvn' -f '$root\$name\pom.xml' spring-boot:run"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '=== $name (Port $port) ===' -ForegroundColor Green; $cmd"
    Write-Host "  Waiting $waitSec seconds for $name to initialize..." -ForegroundColor Gray
    Start-Sleep -Seconds $waitSec
}

# 1. Service Discovery
Start-Microservice "eureka-server" 8761 15

# 2. Authentication
Start-Microservice "auth-service" 8090 10

# 3. Driver Fleet
Start-Microservice "driver-service" 8087 10

# 4. Payment
Start-Microservice "payment-service" 8088 10

# 5. Ride Dispatch
Start-Microservice "ride-service" 8086 10

# 6. API Gateway
Start-Microservice "api-gateway" 8080 8

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "All 6 microservices launched in separate console windows!" -ForegroundColor Green
Write-Host "- Eureka Dashboard : http://localhost:8761" -ForegroundColor Cyan
Write-Host "- API Gateway      : http://localhost:8080" -ForegroundColor Cyan
Write-Host "- Frontend Web App : Run 'npm run dev' inside frontend/ -> http://localhost:5173" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Green

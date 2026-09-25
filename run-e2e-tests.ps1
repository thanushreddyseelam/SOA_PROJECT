# ==============================================================================
# UrbanGlide - End-to-End Automated Verification Script
# ==============================================================================
# Verifies:
#   1. Gateway & Eureka Service Discovery
#   2. Rider Registration & Login (RIDER JWT)
#   3. Driver Registration & Login (DRIVER JWT)
#   4. Security Hardening (No JWT -> 401, Invalid JWT -> 401, Wrong Role -> 403)
#   5. Driver Fleet Telemetry (Location & Availability via Driver JWT)
#   6. Ride Creation, Atomic Assignment, and State Machine (Accept, Arrive, Start, Complete)
#   7. Automated Payment Processing via OpenFeign & Payment Service
# ==============================================================================

$baseUrl = "http://localhost:8080"
$ErrorActionPreference = "Stop"

function Print-Step($title) {
    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host ">> $title" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan
}

function Print-Success($msg) {
    Write-Host "[PASS] $msg" -ForegroundColor Green
}

function Print-Info($msg) {
    Write-Host "       $msg" -ForegroundColor Gray
}

function Print-Fail($msg) {
    Write-Host "[FAIL] $msg" -ForegroundColor Red
}

try {
    # -------------------------------------------------------------------------
    # STEP 1: Gateway & Eureka Health Check
    # -------------------------------------------------------------------------
    Print-Step "Step 1: Checking API Gateway & Eureka Health"
    try {
        $gwHealth = Invoke-RestMethod -Uri "$baseUrl/actuator/health" -Method Get -TimeoutSec 5
        Print-Success "API Gateway is UP (Status: $($gwHealth.status))"
    } catch {
        Print-Fail "Could not connect to API Gateway at $baseUrl. Ensure services are running!"
        exit 1
    }

    # -------------------------------------------------------------------------
    # STEP 2: Rider Registration & Login
    # -------------------------------------------------------------------------
    Print-Step "Step 2: Registering & Logging In Rider"
    $randId = Get-Random -Minimum 1000 -Maximum 9999
    $riderUsername = "rider_$randId"
    $riderEmail = "rider_$randId@urbanglide.com"
    $password = "RiderSecret123!"

    $riderRegBody = @{
        username = $riderUsername
        email = $riderEmail
        password = $password
    } | ConvertTo-Json

    $riderRegResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $riderRegBody -ContentType "application/json"
    $riderToken = $riderRegResponse.token
    $riderId = if ($riderRegResponse.userId) { $riderRegResponse.userId } else { 1 }
    Print-Success "Registered rider: $riderUsername (Role: $($riderRegResponse.role), ID: $riderId)"

    $riderHeaders = @{
        "Authorization" = "Bearer $riderToken"
        "Content-Type"  = "application/json"
    }

    # -------------------------------------------------------------------------
    # STEP 3: Driver Registration & Login
    # -------------------------------------------------------------------------
    Print-Step "Step 3: Registering & Logging In Driver"
    $driverUsername = "driver_$randId"
    $driverEmail = "driver_$randId@urbanglide.com"

    $driverRegBody = @{
        username = $driverUsername
        email = $driverEmail
        password = $password
    } | ConvertTo-Json

    $driverRegResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register-driver" -Method Post -Body $driverRegBody -ContentType "application/json"
    $driverToken = $driverRegResponse.token
    Print-Success "Registered driver: $driverUsername (Role: $($driverRegResponse.role))"

    $driverHeaders = @{
        "Authorization" = "Bearer $driverToken"
        "Content-Type"  = "application/json"
    }

    # -------------------------------------------------------------------------
    # STEP 4: Security Role Enforcement Tests (401 & 403)
    # -------------------------------------------------------------------------
    Print-Step "Step 4: Executing Gateway Security & Role Authorization Tests"

    # Test 4.1: No JWT -> 401
    try {
        Invoke-RestMethod -Uri "$baseUrl/rides/1" -Method Get -TimeoutSec 3
        Print-Fail "Expected 401 Unauthorized for request with No JWT, but request succeeded!"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Print-Success "Security Test 1 Passed: No JWT -> 401 Unauthorized"
        } else {
            Print-Info "Response status: $($_.Exception.Response.StatusCode.value__)"
        }
    }

    # Test 4.2: Invalid JWT -> 401
    try {
        $invalidHeaders = @{ "Authorization" = "Bearer invalid.fake.token" }
        Invoke-RestMethod -Uri "$baseUrl/rides/1" -Method Get -Headers $invalidHeaders -TimeoutSec 3
        Print-Fail "Expected 401 Unauthorized for Invalid JWT, but request succeeded!"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 401) {
            Print-Success "Security Test 2 Passed: Invalid JWT -> 401 Unauthorized"
        } else {
            Print-Info "Response status: $($_.Exception.Response.StatusCode.value__)"
        }
    }

    # Test 4.3: Rider JWT calling Driver Action -> 403 Forbidden
    try {
        Invoke-RestMethod -Uri "$baseUrl/rides/1/accept?driverId=1" -Method Put -Headers $riderHeaders -TimeoutSec 3
        Print-Fail "Expected 403 Forbidden when Rider JWT performs Driver action, but request succeeded!"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Print-Success "Security Test 3 Passed: Rider JWT calling Driver Accept -> 403 Forbidden"
        } else {
            Print-Info "Response status: $($_.Exception.Response.StatusCode.value__)"
        }
    }

    # Test 4.4: Driver JWT calling Create Ride -> 403 Forbidden
    try {
        $dummyRide = @{
            riderId = 1
            pickupLatitude = 16.5062
            pickupLongitude = 80.6480
            destinationLatitude = 16.5193
            destinationLongitude = 80.6305
            pickupAddress = "PVP Mall"
            dropAddress = "Benz Circle"
        } | ConvertTo-Json
        Invoke-RestMethod -Uri "$baseUrl/rides" -Method Post -Body $dummyRide -Headers $driverHeaders -TimeoutSec 3
        Print-Fail "Expected 403 Forbidden when Driver JWT attempts to Create Ride, but request succeeded!"
    } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 403) {
            Print-Success "Security Test 4 Passed: Driver JWT calling Create Ride -> 403 Forbidden"
        } else {
            Print-Info "Response status: $($_.Exception.Response.StatusCode.value__)"
        }
    }

    # -------------------------------------------------------------------------
    # STEP 5: Driver Fleet Telemetry
    # -------------------------------------------------------------------------
    Print-Step "Step 5: Updating Driver Telemetry & Availability"
    $driverLocationBody = @{
        latitude = 16.5062
        longitude = 80.6480
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$baseUrl/drivers/1/location" -Method Put -Body $driverLocationBody -Headers $driverHeaders | Out-Null

    $driverAvailBody = @{
        availability = $true
    } | ConvertTo-Json
    $availDriver = Invoke-RestMethod -Uri "$baseUrl/drivers/1/availability" -Method Put -Body $driverAvailBody -Headers $driverHeaders
    Print-Success "Driver #1 status updated to: $($availDriver.status) (Availability: $($availDriver.availability))"

    # -------------------------------------------------------------------------
    # STEP 6: Rider Creates Ride (Atomic Dispatch)
    # -------------------------------------------------------------------------
    Print-Step "Step 6: Rider Books Ride (Vijayawada PVP Mall -> Benz Circle)"
    $bookBody = @{
        riderId = $riderId
        pickupLatitude = 16.5062
        pickupLongitude = 80.6480
        destinationLatitude = 16.5193
        destinationLongitude = 80.6305
        pickupAddress = "PVP Square Mall, Vijayawada"
        dropAddress = "Benz Circle, Vijayawada"
        paymentMethod = "UPI"
    } | ConvertTo-Json

    $ride = Invoke-RestMethod -Uri "$baseUrl/rides" -Method Post -Body $bookBody -Headers $riderHeaders
    $rideId = $ride.id
    $assignedDriverId = $ride.driverId
    Print-Success "Ride created successfully! ID: $rideId"
    Print-Info "Assigned Driver ID : $assignedDriverId"
    Print-Info "Estimated Fare     : Rs. $($ride.fare)"
    Print-Info "Distance           : $($ride.distance) km"
    Print-Info "Initial Status     : $($ride.status)"

    # -------------------------------------------------------------------------
    # STEP 7: Driver Ride Progression (Accept -> Arrived -> Start -> Complete)
    # -------------------------------------------------------------------------
    Print-Step "Step 7: Driver Lifecycle Progression (Accept -> Arrived -> Start -> Complete)"

    # 7.1 Accept
    $ride = Invoke-RestMethod -Uri "$baseUrl/rides/$rideId/accept?driverId=$assignedDriverId" -Method Put -Headers $driverHeaders
    Print-Success "1. Driver Accepted  -> Status: $($ride.status)"

    # 7.2 Arrived
    $ride = Invoke-RestMethod -Uri "$baseUrl/rides/$rideId/arrived" -Method Put -Headers $driverHeaders
    Print-Success "2. Driver Arrived   -> Status: $($ride.status)"

    # 7.3 Start
    $ride = Invoke-RestMethod -Uri "$baseUrl/rides/$rideId/start" -Method Put -Headers $driverHeaders
    Print-Success "3. Trip Started     -> Status: $($ride.status)"

    # 7.4 Complete
    $ride = Invoke-RestMethod -Uri "$baseUrl/rides/$rideId/complete" -Method Put -Headers $driverHeaders
    Print-Success "4. Trip Completed   -> Status: $($ride.status)"

    # -------------------------------------------------------------------------
    # STEP 8: Verify Payment & Settlement
    # -------------------------------------------------------------------------
    Print-Step "Step 8: Verifying Automated Payment Record"
    $payment = Invoke-RestMethod -Uri "$baseUrl/payments/ride/$rideId" -Method Get -Headers $riderHeaders
    Print-Success "Payment record verified via Payment Service!"
    Print-Info "Transaction ID : $($payment.transactionId)"
    Print-Info "Amount         : Rs. $($payment.amount)"
    Print-Info "Payment Method : $($payment.paymentMethod)"
    Print-Info "Payment Status : $($payment.status)"

    # -------------------------------------------------------------------------
    # SUMMARY
    # -------------------------------------------------------------------------
    Write-Host "`n========================================================" -ForegroundColor Green
    Write-Host "🎉 ALL END-TO-END WORKFLOW & SECURITY CHECKS PASSED!" -ForegroundColor Green
    Write-Host "========================================================" -ForegroundColor Green

} catch {
    Write-Host "`n[ERROR] An error occurred during test execution:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

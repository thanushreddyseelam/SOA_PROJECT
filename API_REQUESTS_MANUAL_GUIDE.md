# UrbanGlide Microservices — Complete Manual API Request Guide

All requests are routed through the **API Gateway** on port **8080** (`http://localhost:8080`).

---

## 1. Authentication Service (`/auth`)

### 1.1 Register Rider
- **Method:** `POST`
- **URL:** `http://localhost:8080/auth/register`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "username": "rider_john",
    "email": "rider.john@example.com",
    "password": "rider123",
    "phoneNumber": "+15551234567"
  }
  ```
- **Expected Response:** `200 OK` or `201 Created`
  ```json
  {
    "userId": 1,
    "username": "rider_john",
    "email": "rider.john@example.com",
    "role": "RIDER"
  }
  ```

---

### 1.2 Login Rider
- **Method:** `POST`
- **URL:** `http://localhost:8080/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "username": "rider_john",
    "password": "rider123"
  }
  ```
- **Expected Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": 1,
    "username": "rider_john",
    "email": "rider.john@example.com",
    "role": "RIDER"
  }
  ```
  *(Copy this JWT token to use as `<RIDER_JWT_TOKEN>`)*

---

### 1.3 Register / Create Driver Profile in Fleet
- **Method:** `POST`
- **URL:** `http://localhost:8080/drivers`
- **Headers:**
  ```
  Authorization: Bearer <ADMIN_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "name": "Driver Dave",
    "phone": "+15559876543",
    "vehicleNumber": "DL-998877",
    "vehicleType": "SEDAN"
  }
  ```
- **Expected Response:** `201 Created` or `200 OK`
  ```json
  {
    "id": 1,
    "name": "Driver Dave",
    "phone": "+15559876543",
    "vehicleNumber": "DL-998877",
    "vehicleType": "SEDAN",
    "status": "OFFLINE"
  }
  ```

---

### 1.4 Login Driver
- **Method:** `POST`
- **URL:** `http://localhost:8080/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "username": "driver_dave",
    "password": "driver123"
  }
  ```
- **Expected Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": 2,
    "username": "driver_dave",
    "email": "driver.dave@example.com",
    "role": "DRIVER"
  }
  ```
  *(Copy this JWT token to use as `<DRIVER_JWT_TOKEN>`)*

---

### 1.5 Login Admin
- **Method:** `POST`
- **URL:** `http://localhost:8080/auth/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Expected Response:** `200 OK`
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiJ9...",
    "userId": 3,
    "username": "admin",
    "role": "ADMIN"
  }
  ```

---

## 2. Driver Service (`/drivers`)

### 2.1 Make Driver Available
- **Method:** `PUT`
- **URL:** `http://localhost:8080/drivers/1/status`
- **Headers:**
  ```
  Authorization: Bearer <DRIVER_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "status": "AVAILABLE"
  }
  ```
- **Expected Response:** `200 OK`
  ```json
  {
    "id": 1,
    "name": "Driver Dave",
    "status": "AVAILABLE"
  }
  ```

---

### 2.2 Update Driver Location
- **Method:** `PUT`
- **URL:** `http://localhost:8080/drivers/1/location`
- **Headers:**
  ```
  Authorization: Bearer <DRIVER_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "latitude": 37.7750,
    "longitude": -122.4190
  }
  ```
- **Expected Response:** `200 OK`

---

### 2.3 Get Available Drivers
- **Method:** `GET`
- **URL:** `http://localhost:8080/drivers/available`
- **Headers:**
  ```
  Authorization: Bearer <RIDER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK` returning JSON array of available drivers.

---

## 3. Rider Rides (`/rides`)

### 3.1 Create / Book a Ride
- **Method:** `POST`
- **URL:** `http://localhost:8080/rides`
- **Headers:**
  ```
  Authorization: Bearer <RIDER_JWT_TOKEN>
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "riderId": 1,
    "pickupLocation": "Market St & 4th St, San Francisco",
    "dropoffLocation": "Fisherman's Wharf, San Francisco",
    "pickupLatitude": 37.7749,
    "pickupLongitude": -122.4194,
    "dropoffLatitude": 37.8080,
    "dropoffLongitude": -122.4177,
    "vehicleType": "SEDAN",
    "paymentMethod": "CREDIT_CARD"
  }
  ```
- **Expected Response:** `200 OK` or `201 Created`
  ```json
  {
    "id": 1,
    "riderId": 1,
    "driverId": 1,
    "pickupLocation": "Market St & 4th St, San Francisco",
    "dropoffLocation": "Fisherman's Wharf, San Francisco",
    "status": "MATCHED",
    "fare": 24.50,
    "paymentMethod": "CREDIT_CARD"
  }
  ```

---

### 3.2 Get Ride Details
- **Method:** `GET`
- **URL:** `http://localhost:8080/rides/1`
- **Headers:**
  ```
  Authorization: Bearer <RIDER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK` returning current ride object.

---

## 4. Driver Ride Operations (Lifecycle)

### 4.1 Driver Accept Ride
- **Method:** `PUT`
- **URL:** `http://localhost:8080/rides/1/accept?driverId=1`
- **Headers:**
  ```
  Authorization: Bearer <DRIVER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK` with `"status": "ACCEPTED"`.

---

### 4.2 Driver Arrived
- **Method:** `PUT`
- **URL:** `http://localhost:8080/rides/1/arrive`
- **Headers:**
  ```
  Authorization: Bearer <DRIVER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK` with `"status": "ARRIVED"`.

---

### 4.3 Start Ride
- **Method:** `PUT`
- **URL:** `http://localhost:8080/rides/1/start`
- **Headers:**
  ```
  Authorization: Bearer <DRIVER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK` with `"status": "IN_PROGRESS"`.

---

### 4.4 Complete Ride
- **Method:** `PUT`
- **URL:** `http://localhost:8080/rides/1/complete`
- **Headers:**
  ```
  Authorization: Bearer <DRIVER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK` with `"status": "COMPLETED"`. Automatically creates payment transaction in Payment Service.

---

## 5. Payment Service (`/payments`)

### 5.1 Check Payment for Ride
- **Method:** `GET`
- **URL:** `http://localhost:8080/payments/ride/1`
- **Headers:**
  ```
  Authorization: Bearer <RIDER_JWT_TOKEN>
  ```
- **Expected Response:** `200 OK`
  ```json
  {
    "id": 1,
    "rideId": 1,
    "amount": 24.50,
    "paymentMethod": "CREDIT_CARD",
    "status": "COMPLETED"
  }
  ```

---

## 6. Security & Role-Based Access Control Tests

| # | Test Case | Method | URL | Headers | Expected Result |
|---|---|---|---|---|---|
| **6.1** | **No JWT Token** | `GET` | `http://localhost:8080/rides/1` | *(None)* | `401 Unauthorized` |
| **6.2** | **Invalid Token** | `GET` | `http://localhost:8080/rides/1` | `Authorization: Bearer invalid.token` | `401 Unauthorized` |
| **6.3** | **Rider Calling Driver Endpoint** | `PUT` | `http://localhost:8080/rides/1/accept?driverId=1` | `Authorization: Bearer <RIDER_JWT_TOKEN>` | `403 Forbidden` |
| **6.4** | **Driver Booking a Ride** | `POST` | `http://localhost:8080/rides` | `Authorization: Bearer <DRIVER_JWT_TOKEN>` | `403 Forbidden` |

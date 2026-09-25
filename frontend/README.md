# UrbanGlide — React.js Frontend & Mobility Orchestration Console

Modern React.js client interface for the **UrbanGlide Real-Time Urban Ride Dispatch & Mobility Orchestration System** (PS018).

---

## 🏛️ Architecture Overview

The frontend acts **strictly as the presentation layer** communicating exclusively with the backend via the **Spring Cloud API Gateway** on port `8080`.

```
React Frontend (:5173)
        ↓  (REST + Bearer JWT)
Spring Cloud API Gateway (:8080)
        ↓  (lb:// via Netflix Eureka :8761)
┌───────────────────────────────────────────────────────┐
│  • Auth Service (:8090)    -> urban_auth_db           │
│  • Driver Service (:8087)  -> urban_driver_db         │
│  • Ride Service (:8086)    -> urban_ride_db           │
│  • Payment Service (:8088) -> urban_payment_db        │
└───────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22.19.0)
- **Java**: JDK 17
- **MySQL**: 8.0 on port 3306 (`root` / `Thanush@752`)

---

### 2. Backend Startup Order

Start each backend microservice in separate terminal windows:

```powershell
# 1. Eureka Service Discovery (Port 8761)
cd "eureka-server"
mvn spring-boot:run

# 2. Auth Service (Port 8090)
cd "auth-service"
mvn spring-boot:run

# 3. Driver Service (Port 8087)
cd "driver-service"
mvn spring-boot:run

# 4. Payment Service (Port 8088)
cd "payment-service"
mvn spring-boot:run

# 5. Ride Service (Port 8086)
cd "ride-service"
mvn spring-boot:run

# 6. API Gateway (Port 8080)
cd "api-gateway"
mvn spring-boot:run
```

---

### 3. Frontend Startup

```powershell
cd "frontend"
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧭 Academic & Viva Demonstration Flow

1. **Sign In / Registration (`/login`, `/register`)**:
   - Register a new passenger or use the **Quick Demo Fill** (`thanush` / `Thanush@752`).
   - Receives HMAC-SHA256 JWT from `auth-service` and stores in `localStorage`.
   - Inspect token claims dynamically on the **Profile (`/profile`)** page.

2. **Book a Ride (`/book`)**:
   - Choose Vijayawada landmark presets (e.g. *PVP Square Mall* to *Benz Circle*).
   - Select payment method (`UPI`, `CARD`, `CASH`, `WALLET`).
   - Click **"Find a Ride"**: `Ride Service` calculates distance/fare and atomically reserves the nearest available driver via `Driver Service`.

3. **Ride Progression Tracking (`/rides/:id`)**:
   - Visual 7-state machine timeline:
     `REQUESTED ➔ DRIVER_ASSIGNED ➔ DRIVER_ACCEPTED ➔ DRIVER_ARRIVED ➔ TRIP_STARTED ➔ TRIP_COMPLETED ➔ PAID`.

4. **Driver Dispatch Console (`/driver`)**:
   - Switch active driver (e.g. *Driver #1: Raju*).
   - Toggle availability (`AVAILABLE` ↔ `OFFLINE`), ping GPS coordinates.
   - Execute trip lifecycle actions: **Accept Ride**, **Driver Arrived**, **Start Trip**, and **Complete Trip**.

5. **Automated Payment Processing (`/payments`)**:
   - Completing a trip automatically triggers `Payment Service` to deduct fare and record an audited transaction ID.
   - View digital payment receipt and test refund requests.

6. **System Architecture Dashboard (`/architecture`)**:
   - Live visual diagram of the 6 microservice nodes.
   - Probes live health statuses (🟢 **UP**) through the API Gateway.

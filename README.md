# 🚗 UrbanGlide — Real-Time Urban Ride Dispatch & Mobility Orchestration System

> **PS018** — A professional-grade ride-hailing backend platform built with **Spring Boot Microservices**, demonstrating SOA principles, JWT security, Eureka service discovery, API Gateway routing, and client-side load balancing.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Microservices](#microservices)
- [Database Design](#database-design)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Service Discovery](#service-discovery)
- [Inter-Service Communication](#inter-service-communication)
- [Load Balancing](#load-balancing)
- [Circuit Breaker](#circuit-breaker)
- [How to Run](#how-to-run)
- [Testing with Postman](#testing-with-postman)
- [Docker Deployment](#docker-deployment)
- [Future Enhancements](#future-enhancements)

---

## 🎯 Project Overview

**UrbanGlide Mobility** is a real-time ride-hailing backend platform that:

- ✅ **Matches drivers with riders** using the Haversine formula for nearest-driver search
- ✅ **Tracks ride status** through a full state machine (REQUESTED → PAID)
- ✅ **Handles payments securely** with JWT-protected endpoints and mock payment gateway
- ✅ **Supports real-time updates** via REST APIs
- ✅ **Ensures high availability** with Eureka service discovery and load balancing

---

## 🏗️ Architecture

```
                         ┌──────────────────────┐
                         │      Client          │
                         │ Web / Mobile / Postman│
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │     API Gateway      │
                         │      Port: 8080      │
                         │ JWT Validation       │
                         │ Routing + LB         │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┼────────────────┐
                    │               │                │
                    ▼               ▼                ▼
             ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
             │ Ride Service│ │Driver Service│ │Payment      │
             │   :8086     │ │  :8087/:8089 │ │Service :8088│
             │ Bookings    │ │ Fleet Mgmt   │ │ Payments    │
             │ State Machine│ │ GPS Tracking │ │ Fare Records│
             └──────┬──────┘ └──────┬──────┘ └──────▲──────┘
                    │               │               │
                    └─── OpenFeign ─┴───────────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    Eureka Server     │
                         │      Port: 8761      │
                         └──────────────────────┘

             ┌──────────────────┐
             │   Auth Service   │
             │     Port: 8090   │
             │ JWT Generation   │
             │ Login/Register   │
             └──────────────────┘
```

---

## 🛠️ Technology Stack

| Component | Technology |
|---|---|
| Language | Java 17 |
| Framework | Spring Boot 3.2.5 |
| Security | Spring Security + JWT (jjwt 0.12.5) |
| Service Discovery | Spring Cloud Netflix Eureka |
| API Gateway | Spring Cloud Gateway (Reactive/WebFlux) |
| Inter-Service Comm | OpenFeign + Spring Cloud LoadBalancer |
| Resilience | Resilience4j Circuit Breaker |
| ORM | Spring Data JPA + Hibernate |
| Database | H2 (dev) / MySQL 8.0 (prod) |
| Monitoring | Spring Boot Actuator |
| Build Tool | Maven |
| Containerization | Docker + Docker Compose |

---

## 🧩 Microservices

| Service | Port | Description |
|---|---|---|
| **Eureka Server** | 8761 | Service registry & discovery dashboard |
| **API Gateway** | 8080 | Central entry point, JWT validation, routing, load balancing |
| **Auth Service** | 8090 | User registration, login, JWT token generation |
| **Ride Service** | 8086 | Ride booking, state machine, driver matching, fare calculation |
| **Driver Service** | 8087/8089 | Driver CRUD, location tracking, availability management |
| **Payment Service** | 8088 | Payment processing, transaction records, refunds |

---

## 🗃️ Database Design

### Database-per-Service Pattern

Each microservice has its own isolated database:

| Database | Service | Tables |
|---|---|---|
| `urban_auth_db` | Auth Service | `users` |
| `urban_ride_db` | Ride Service | `rides` |
| `urban_driver_db` | Driver Service | `drivers` |
| `urban_payment_db` | Payment Service | `payments` |

### Ride Table
| Column | Type | Description |
|---|---|---|
| ride_id | BIGINT (PK) | Auto-generated |
| rider_id | BIGINT | User who booked |
| driver_id | BIGINT | Assigned driver |
| pickup_latitude | DOUBLE | Pickup GPS lat |
| pickup_longitude | DOUBLE | Pickup GPS lng |
| destination_latitude | DOUBLE | Drop GPS lat |
| destination_longitude | DOUBLE | Drop GPS lng |
| fare | DOUBLE | Calculated fare (₹) |
| distance | DOUBLE | Distance in km |
| status | VARCHAR | Ride state |
| created_at | TIMESTAMP | Booking time |

### Driver Table
| Column | Type | Description |
|---|---|---|
| driver_id | BIGINT (PK) | Auto-generated |
| name | VARCHAR | Driver name |
| phone | VARCHAR | Phone number |
| vehicle_number | VARCHAR (UNIQUE) | Vehicle plate |
| vehicle_type | VARCHAR | SEDAN/SUV/AUTO |
| latitude | DOUBLE | Current GPS lat |
| longitude | DOUBLE | Current GPS lng |
| availability | BOOLEAN | Available flag |
| status | VARCHAR | AVAILABLE/BUSY/OFFLINE |

### Payment Table
| Column | Type | Description |
|---|---|---|
| payment_id | BIGINT (PK) | Auto-generated |
| ride_id | BIGINT (UNIQUE) | One payment per ride |
| rider_id | BIGINT | Payer |
| amount | DOUBLE | Fare amount |
| payment_method | VARCHAR | UPI/CARD/CASH/WALLET |
| transaction_id | VARCHAR (UNIQUE) | Generated TXN ID |
| status | VARCHAR | PENDING/SUCCESS/FAILED/REFUNDED |
| created_at | TIMESTAMP | Payment time |

---

## 🔌 API Endpoints

### Auth Service (`:8090`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login → JWT token |
| GET | `/auth/validate` | Validate JWT token |

### Driver Service (`:8087`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/drivers` | Register driver |
| GET | `/drivers/{id}` | Get driver details |
| GET | `/drivers` | List all drivers |
| GET | `/drivers/available` | List available drivers |
| GET | `/drivers/nearest?latitude=&longitude=` | Find nearest driver |
| PUT | `/drivers/{id}/location` | Update GPS location |
| PUT | `/drivers/{id}/availability` | Toggle availability |
| PUT | `/drivers/{id}/status` | Update status |

### Ride Service (`:8086`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/rides` | Book a ride |
| GET | `/rides/{id}` | Get ride details |
| PUT | `/rides/{id}/accept` | Driver accepts |
| PUT | `/rides/{id}/arrived` | Driver arrived |
| PUT | `/rides/{id}/start` | Start trip |
| PUT | `/rides/{id}/complete` | Complete trip → auto-payment |
| PUT | `/rides/{id}/cancel` | Cancel ride |
| GET | `/rides/rider/{riderId}` | Rider's ride history |
| GET | `/rides/driver/{driverId}` | Driver's ride history |

### Payment Service (`:8088`)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/payments` | Process payment |
| GET | `/payments/{id}` | Get payment details |
| GET | `/payments/ride/{rideId}` | Get payment for ride |
| GET | `/payments/rider/{riderId}` | Rider's payment history |
| PUT | `/payments/{id}/refund` | Refund payment |

---

## 🔐 Authentication

### JWT Flow
```
1. POST /auth/register   → Create account
2. POST /auth/login      → Receive JWT token
3. Add header:           → Authorization: Bearer <JWT>
4. Access protected APIs → Gateway validates JWT
```

### Roles
- `RIDER` — Book rides, make payments
- `DRIVER` — Accept rides, update location
- `ADMIN` — Manage drivers, view system info

---

## 📡 Service Discovery

All services register with **Eureka Server** at `http://localhost:8761`.

- Dashboard: http://localhost:8761
- Services use logical names (e.g., `DRIVER-SERVICE`) instead of hardcoded URLs
- Eureka resolves service instances dynamically

---

## 🔗 Inter-Service Communication

Uses **OpenFeign** for declarative REST clients:

```
Ride Service ──OpenFeign──► Driver Service  (find nearest driver)
Ride Service ──OpenFeign──► Payment Service (process payment on trip complete)
```

Service names resolved via Eureka — **no hardcoded URLs**.

---

## ⚖️ Load Balancing

- **Driver Service** runs 2 instances (ports 8087 and 8089)
- API Gateway uses `lb://DRIVER-SERVICE` for client-side load balancing
- Eureka dashboard shows both instances registered
- Requests are distributed round-robin across instances

---

## 🛡️ Circuit Breaker

**Resilience4j** protects against cascading failures:

- If Driver Service is down → Ride is created with `REQUESTED` status (no driver assigned)
- If Payment Service is down → Ride moves to `PAYMENT_PENDING` status
- Circuit states: CLOSED → OPEN → HALF_OPEN

---

## 🚀 How to Run

### Prerequisites
- Java 17+
- Maven 3.8+
- (Optional) Docker & Docker Compose

### Start Services (in order)

```bash
# 1. Eureka Server
cd eureka-server && mvn spring-boot:run

# 2. Auth Service
cd auth-service && mvn spring-boot:run

# 3. Driver Service
cd driver-service && mvn spring-boot:run

# 4. Ride Service
cd ride-service && mvn spring-boot:run

# 5. Payment Service
cd payment-service && mvn spring-boot:run

# 6. API Gateway
cd api-gateway && mvn spring-boot:run
```

### Verify
- Eureka Dashboard: http://localhost:8761
- H2 Console (Auth): http://localhost:8090/h2-console
- Actuator Health: http://localhost:{port}/actuator/health

---

## 🖥️ Interactive Web Frontend Console

UrbanGlide features an executive **Single Page Application (SPA)** located in the `frontend/` directory:

```bash
# Simply double-click frontend/index.html, or serve via Python:
python -m http.server 3000 --directory frontend
```

### Features:
1. **Rider Portal**:
   - Live Leaflet OpenStreetMap focused on Vijayawada (`16.5062, 80.6480`).
   - Location presets (PVP Square Mall, Benz Circle, Railway Station, Bus Stand, Airport).
   - Real-time dynamic fare estimation (Base fare + Distance charge + Time charge).
   - Live 7-state animated ride state tracker (`REQUESTED` ➔ `DRIVER_ASSIGNED` ➔ `DRIVER_ACCEPTED` ➔ `DRIVER_ARRIVED` ➔ `TRIP_STARTED` ➔ `TRIP_COMPLETED` ➔ `PAID`).
   - Digital payment receipt with transaction ID and payment method.
2. **Driver Fleet Console**:
   - Real-time fleet roster with status pills (`AVAILABLE`, `BUSY`, `OFFLINE`).
   - Driver availability toggle.
3. **Microservices Ops Monitor**:
   - Auto-pinging health monitor for all 6 microservices.
   - Real-time API telemetry console streaming HTTP calls routed through API Gateway (`http://localhost:8080`) with latency.

---

## ⚡ 1-Click Automated E2E Test Suite

You can execute the entire user journey (Health ➔ Register ➔ Login ➔ Dispatch ➔ Book ➔ Accept ➔ Arrive ➔ Start ➔ Complete ➔ Settle Payment) in PowerShell:

```powershell
.\run-e2e-tests.ps1
```

---

## 🧪 Testing with Postman

### Complete End-to-End Flow

```
Step 1:  POST http://localhost:8080/auth/register    → Register rider
Step 2:  POST http://localhost:8080/auth/login        → Get JWT token
Step 3:  POST http://localhost:8080/drivers           → Add driver
Step 4:  PUT  http://localhost:8080/drivers/1/location → Set driver GPS
Step 5:  PUT  http://localhost:8080/drivers/1/availability → Driver available
Step 6:  POST http://localhost:8080/rides              → Book ride (auto-matches driver)
Step 7:  PUT  http://localhost:8080/rides/1/accept      → Driver accepts
Step 8:  PUT  http://localhost:8080/rides/1/arrived     → Driver arrived
Step 9:  PUT  http://localhost:8080/rides/1/start       → Trip starts
Step 10: PUT  http://localhost:8080/rides/1/complete    → Trip completes (auto-payment)
Step 11: GET  http://localhost:8080/payments/ride/1     → Verify payment
Step 12: GET  http://localhost:8080/rides/1             → Final ride status = PAID
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# View logs
docker-compose logs -f ride-service
```

---

## 📈 Ride State Machine

```
REQUESTED → DRIVER_ASSIGNED → DRIVER_ACCEPTED → DRIVER_ARRIVED → TRIP_STARTED → TRIP_COMPLETED → PAYMENT_PENDING → PAID

REQUESTED ────────► CANCELLED
DRIVER_ASSIGNED ──► CANCELLED
```

---

## 🔮 Future Enhancements

- WebSocket for real-time driver tracking
- Surge pricing during peak hours
- Rating system for drivers and riders
- Trip history and analytics dashboard
- SMS/Email notifications
- Prometheus + Grafana monitoring
- Kubernetes deployment

---

## 👨‍💻 Author

Built as part of **SOA Programming & Microservices** coursework.

**Project Code:** PS018

---

## 📄 License

This project is for academic purposes.

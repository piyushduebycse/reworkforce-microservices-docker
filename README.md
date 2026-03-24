# RevWorkforce — Cloud-Native HRM Platform

A production-grade **Human Resource Management System** built with **Spring Boot 3 microservices**, **Angular 17**, and **Spring Cloud** infrastructure. Features a fully modernized dark-themed UI, 9 independent backend services, 6 isolated MySQL databases, JWT authentication, and role-based access control.

---

## Table of Contents

1. [Features](#features)
2. [Architecture Overview](#architecture-overview)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Prerequisites](#prerequisites)
6. [Option A — Docker Setup (Recommended)](#option-a--docker-setup-recommended)
7. [Option B — Local Setup (Without Docker)](#option-b--local-setup-without-docker)
8. [Demo Credentials](#demo-credentials)
9. [All Service URLs](#all-service-urls)
10. [API Reference](#api-reference)
11. [Running Tests](#running-tests)
12. [Troubleshooting](#troubleshooting)
13. [Future Improvements](#future-improvements)

---

## Features

### For Employees
- Personalized dashboard — leave balances with progress bars, recent applications, active goals, upcoming holidays, announcements
- Apply for leave with date picker, leave type selection, balance preview, and reason
- View own leave history and application status
- Submit self-performance reviews with star rating and comments
- Create and track personal goals with progress updates (0–100%)
- Receive in-app notifications for leave approvals/rejections

### For Managers
- All employee features plus:
- Team Overview dashboard — team headcount, pending approvals count, upcoming holidays
- Approve or reject employee leave requests with comments
- View all team leave applications
- Provide star ratings and written feedback on employee self-reviews
- View team goals and their progress

### For Admins
- HR Dashboard with company-wide metrics (total employees, pending approvals, departments, upcoming holidays)
- Employee Management — add new employees with department/designation assignment, activate/deactivate accounts, filter by role/department/status/search
- Department Management — create, edit, activate/deactivate departments
- Leave Configuration — manage leave types, set default quotas per role, view and edit per-employee balances
- Holiday Management — add and manage company holidays with types (National, Regional, Optional, Company)
- Announcements — publish announcements targeted to all, employees, managers, or admins
- Reports — headcount by department, leave utilization, performance summary, goal completion rates

---

## Architecture Overview

```
                        ┌────────────────────────────────┐
                        │      Angular 17 Frontend        │
                        │      http://localhost:4200      │
                        │   Dark Theme · Inter Font       │
                        └──────────────┬─────────────────┘
                                       │ HTTP /api/**
                        ┌──────────────▼─────────────────┐
                        │       API Gateway (8080)         │
                        │  JWT Validation · Block /internal│
                        │  Circuit Breaker · Load Balance  │
                        └──┬────┬────┬────┬────┬──────────┘
                           │    │    │    │    │
              ┌────────────▼┐  ┌▼───┐│  ┌▼────▼──────────────┐
              │user-service │  │    ││  │  leave-service      │
              │    8081     │  │    ││  │      8082           │
              │Auth · Users │  │ CB ││  │ Applications·Quota  │
              └─────────────┘  │    ││  └────────────────────-┘
                               │    ││
              ┌────────────────▼┐   ││  ┌─────────────────────┐
              │performance-svc  │   ││  │employee-mgmt-svc    │
              │    8083         │   ││  │     8084            │
              │Reviews · Goals  │   ││  │Dept·Annc·Desig      │
              └─────────────────┘   ││  └─────────────────────┘
                                    ││
              ┌─────────────────┐   ││  ┌─────────────────────┐
              │reporting-svc    │   ││  │notification-svc     │
              │    8085         │   ││  │     8086            │
              │HR Analytics     │   ││  │In-App Alerts        │
              └─────────────────┘   ││  └─────────────────────┘
                                    ││
              ┌─────────────────────▼┐  ┌─────────────────────┐
              │   Config Server      │  │   Eureka Server     │
              │       8888           │  │       8761          │
              │ Centralized Config   │  │ Service Discovery   │
              └──────────────────────┘  └─────────────────────┘
```

### Key Architecture Patterns

| Pattern | Implementation |
|---------|---------------|
| **Service Discovery** | Netflix Eureka — all services self-register, no hardcoded URLs |
| **Centralized Config** | Spring Cloud Config Server — one YAML per service in `config-repo/` |
| **API Gateway** | Spring Cloud Gateway — single entry point with JWT filter |
| **Circuit Breaker** | Resilience4j on all gateway routes — returns friendly fallback on failure |
| **Inter-Service Calls** | OpenFeign with JWT header propagation via `RequestInterceptor` |
| **Database per Service** | 6 separate MySQL databases — no shared tables |
| **JWT Auth** | JJWT HS256 — 24h access token + 7d refresh token |
| **Role-Based Access** | Spring Security `@PreAuthorize` + Angular `roleGuard` on routes |
| **Block Internal Routes** | Gateway rejects any external call to `/api/internal/**` with 403 |

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Language | Java, TypeScript | Java 17, TS 5 |
| Backend Framework | Spring Boot | 3.2.3 |
| Cloud Infrastructure | Spring Cloud | 2023.0.0 |
| Service Discovery | Netflix Eureka | — |
| API Gateway | Spring Cloud Gateway (Reactive) | — |
| Circuit Breaker | Resilience4j | — |
| Inter-Service Comms | OpenFeign | — |
| Security | Spring Security + JJWT | 0.11.5 |
| ORM | Spring Data JPA + Hibernate | — |
| Database | MySQL | 8.0 |
| Frontend | Angular (Standalone Components) | 17 |
| UI Library | Angular Material | 17 |
| UI Font | Inter | 300–800 |
| Build Tool | Maven (Multi-module), npm | 3.9+, 9+ |
| Containerization | Docker + Docker Compose | — |

---

## Folder Structure

```
RevWorkforce/
├── README.md
├── .gitignore
│
├── .github/
│   ├── README.md                          # Interview-focused deep-dive guide
│   └── workflows/
│       └── ci-cd.yml                      # GitHub Actions CI/CD pipeline
│
├── backend/
│   ├── pom.xml                            # Parent POM — all 9 modules
│   ├── service-discovery/                 # Eureka Server (port 8761)
│   ├── config-server/                     # Spring Cloud Config Server (port 8888)
│   │   └── src/main/resources/config-repo/  # ← Per-service YAML configs
│   ├── api-gateway/                       # API Gateway (port 8080)
│   │   └── filter/
│   │       ├── JwtAuthenticationFilter    # Validates JWT, injects X-User-Id header
│   │       └── BlockInternalRoutesFilter  # Blocks /api/internal/** externally
│   ├── user-service/                      # Auth + User Management (port 8081)
│   ├── leave-service/                     # Leave Management (port 8082)
│   ├── performance-service/               # Reviews & Goals (port 8083)
│   ├── employee-management-service/       # Departments, Designations, Announcements (port 8084)
│   ├── reporting-service/                 # HR Analytics (port 8085)
│   └── notification-service/             # In-App Notifications (port 8086)
│
├── frontend/
│   └── revworkforce-ui/                   # Angular 17 SPA
│       ├── src/
│       │   ├── styles.scss                # Global dark theme + CSS custom properties
│       │   ├── index.html                 # Inter font import
│       │   └── app/
│       │       ├── core/
│       │       │   ├── guards/            # authGuard, roleGuard (functional)
│       │       │   ├── interceptors/      # auth.interceptor — auto-attaches JWT
│       │       │   ├── models/            # TypeScript interfaces
│       │       │   └── services/          # HTTP service wrappers
│       │       ├── features/
│       │       │   ├── auth/              # Login (split-panel dark), unauthorized
│       │       │   ├── employee-dashboard/
│       │       │   ├── manager-dashboard/
│       │       │   ├── admin-dashboard/
│       │       │   ├── leave/             # apply, list, balance, approval
│       │       │   ├── performance/       # review-list, review-form, goal-list
│       │       │   ├── admin/             # employee-mgmt (dept+desig+filters),
│       │       │   │                      # dept-mgmt, announcements, leave-balance-admin,
│       │       │   │                      # holiday-mgmt
│       │       │   ├── directory/
│       │       │   ├── profile/
│       │       │   └── notifications/
│       │       └── shared/
│       │           └── components/layout/ # Dark sidebar + topbar
│       ├── nginx.conf
│       └── Dockerfile
│
└── docker/
    ├── docker-compose.yml                 # Full-stack orchestration (10 containers)
    ├── init.sql                           # Creates 6 MySQL databases
    └── schema.sql                         # DDL for all tables + seed data
```

---

## Prerequisites

### For Docker Setup (Option A)

| Tool | Minimum Version | How to Check | Download |
|------|----------------|--------------|----------|
| Git | Any | `git --version` | https://git-scm.com |
| Docker Desktop | 4.0+ | `docker --version` | https://www.docker.com/products/docker-desktop |
| Docker Compose | 2.0+ | `docker compose version` | Included in Docker Desktop |

> **Docker Memory:** Go to **Docker Desktop → Settings → Resources → Memory** and set to **6 GB minimum** (8 GB recommended). Building 9 Spring Boot services requires it.

---

### For Local Setup (Option B)

| Tool | Minimum Version | How to Check | Download |
|------|----------------|--------------|----------|
| Git | Any | `git --version` | https://git-scm.com |
| Java JDK | 17 | `java -version` | https://adoptium.net (Temurin 17) |
| Maven | 3.9+ | `mvn -version` | https://maven.apache.org/download.cgi |
| Node.js | 18+ | `node -version` | https://nodejs.org |
| npm | 9+ | `npm -version` | Included with Node.js |
| MySQL | 8.0 | `mysql --version` | https://dev.mysql.com/downloads/mysql |

---

## Option A — Docker Setup (Recommended)

### Step 1 — Clone the repository

```bash
git clone https://github.com/piyushduebycse/reworkforce-microservices-docker.git
cd reworkforce-microservices-docker
```

### Step 2 — Increase Docker memory (one-time)

Docker Desktop → Settings → Resources → Memory → **6 GB minimum** → Apply & Restart

### Step 3 — Build and start all containers

```bash
cd docker
docker compose up --build -d
```

> **First time:** ~5–10 minutes (Maven downloads all dependencies inside Docker).
> **Subsequent runs:** `docker compose up -d` takes ~2–3 minutes.

### Step 4 — Watch startup progress

```bash
docker compose logs -f
```

Wait for all six service startup messages:
```
revworkforce-user-service        | Started UserServiceApplication in ...
revworkforce-leave-service       | Started LeaveServiceApplication in ...
revworkforce-performance-service | Started PerformanceServiceApplication in ...
revworkforce-employee-management | Started EmployeeManagementApplication in ...
revworkforce-reporting-service   | Started ReportingServiceApplication in ...
revworkforce-notification-service| Started NotificationServiceApplication in ...
```

### Step 5 — Verify and open

- Eureka Dashboard → **http://localhost:8761** (all 6 services should show as UP)
- Application → **http://localhost:4200**

### Useful Docker Commands

```bash
docker compose ps                          # Status of all containers
docker compose logs -f user-service        # Tail logs for a specific service
docker compose restart user-service        # Restart one service
docker compose down                        # Stop (data preserved)
docker compose down -v                     # Stop + delete all data (fresh start)
docker compose up --build user-service -d  # Rebuild single service
```

---

## Option B — Local Setup (Without Docker)

### Step 1 — Clone

```bash
git clone https://github.com/piyushduebycse/reworkforce-microservices-docker.git
cd reworkforce-microservices-docker
```

### Step 2 — Set up MySQL

**Set root password to `revworkforce@123`**, then create the 6 databases:

```bash
# Windows
mysql -u root -prevworkforce@123 < docker/init.sql

# macOS / Linux
mysql -u root -p'revworkforce@123' < docker/init.sql
```

### Step 3 — Build all backend JARs

```bash
cd backend
mvn clean package -DskipTests
```

### Step 4 — Start services in order

Open 9 terminals and start in this exact order:

```bash
# 1. Eureka — wait for http://localhost:8761
cd backend/service-discovery && mvn spring-boot:run

# 2. Config Server — wait for http://localhost:8888/user-service/default
cd backend/config-server && mvn spring-boot:run

# 3–8. Business services (separate terminals each)
cd backend/user-service                && mvn spring-boot:run -Dspring-boot.run.profiles=local
cd backend/leave-service               && mvn spring-boot:run -Dspring-boot.run.profiles=local
cd backend/performance-service         && mvn spring-boot:run -Dspring-boot.run.profiles=local
cd backend/employee-management-service && mvn spring-boot:run -Dspring-boot.run.profiles=local
cd backend/reporting-service           && mvn spring-boot:run -Dspring-boot.run.profiles=local
cd backend/notification-service        && mvn spring-boot:run -Dspring-boot.run.profiles=local

# 9. API Gateway — start last
cd backend/api-gateway && mvn spring-boot:run
```

### Step 5 — Start Angular frontend

```bash
cd frontend/revworkforce-ui
npm install
npm start
# Opens at http://localhost:4200
```

---

## Demo Credentials

Seeded automatically on first startup:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **ADMIN** | admin@revworkforce.com | Admin@123 | Full platform — employees, departments, leave config, reports |
| **MANAGER** | manager1@revworkforce.com | Manager@123 | Team overview, leave approvals, performance feedback |
| **MANAGER** | manager2@revworkforce.com | Manager@123 | Same as manager1 |
| **EMPLOYEE** | employee1@revworkforce.com | Employee@123 | Apply leave, self-review, goals |
| **EMPLOYEE** | employee2@revworkforce.com | Employee@123 | Same |
| **EMPLOYEE** | employee3@revworkforce.com | Employee@123 | Same |
| **EMPLOYEE** | employee4@revworkforce.com | Employee@123 | Reports to manager2 |
| **EMPLOYEE** | employee5@revworkforce.com | Employee@123 | Reports to manager2 |

> **Note:** The login page includes a **clickable demo accounts panel** — click any account to auto-fill credentials.

---

## All Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:4200 | Angular dark-theme UI |
| **API Gateway** | http://localhost:8080 | Single entry point for all API calls |
| **Eureka Dashboard** | http://localhost:8761 | View all registered services |
| **Config Server** | http://localhost:8888/user-service/default | View per-service config |
| User Service | http://localhost:8081/actuator/health | |
| Leave Service | http://localhost:8082/actuator/health | |
| Performance Service | http://localhost:8083/actuator/health | |
| Employee Mgmt Service | http://localhost:8084/actuator/health | |
| Reporting Service | http://localhost:8085/actuator/health | |
| Notification Service | http://localhost:8086/actuator/health | |

> All API calls go through **port 8080**. Never call individual service ports directly from the browser.

---

## API Reference

All endpoints through `http://localhost:8080`. Include `Authorization: Bearer <token>` on all protected routes.

### Authentication

```
POST /api/auth/login          Body: { "email": "...", "password": "..." }
                              Returns: { accessToken, refreshToken, userId, role, ... }
POST /api/auth/register       [ADMIN only] Register a new user
POST /api/auth/refresh        Body: { "refreshToken": "..." }  →  new accessToken
GET  /api/auth/me             Returns current user info from token
```

### Users

```
GET    /api/users                    [ADMIN] List all users (paginated)
GET    /api/users/directory          [All]   Employee directory
GET    /api/users/search?q=          [All]   Search users by name/email
GET    /api/users/by-role?role=      [ADMIN] Filter by EMPLOYEE / MANAGER / ADMIN
GET    /api/users/{id}               [All]   Get user by ID
PUT    /api/users/{id}               [ADMIN] Update user details
PUT    /api/users/{id}/activate      [ADMIN] Reactivate a deactivated user
DELETE /api/users/{id}               [ADMIN] Deactivate user (soft delete)
GET    /api/profiles/me              [All]   Get own profile
PUT    /api/profiles/me              [All]   Update own profile
```

### Leave Management

```
# Applications
POST /api/leaves/applications               [EMPLOYEE] Apply for leave
GET  /api/leaves/applications/me            [All]      My applications
GET  /api/leaves/applications/team          [MANAGER]  Team applications
GET  /api/leaves/applications/pending       [MANAGER]  Pending approvals
PUT  /api/leaves/applications/{id}/approve  [MANAGER]  Approve leave
PUT  /api/leaves/applications/{id}/reject   [MANAGER]  Reject leave
PUT  /api/leaves/applications/{id}/cancel   [EMPLOYEE] Cancel own leave

# Balances
GET  /api/leaves/balances/me                                          [All]   My balances
GET  /api/leaves/balances/user/{id}?year=                             [ADMIN] User balances
PUT  /api/leaves/balances/user/{id}?leaveTypeId=&totalDays=&year=     [ADMIN] Set balance
POST /api/leaves/balances/user/{id}/init?role=&year=                  [ADMIN] Init from quota
POST /api/leaves/balances/admin/initialize                            [ADMIN] Bulk initialize

# Leave Types & Quotas
GET    /api/leaves/types              [All]   All leave types
POST   /api/leaves/types              [ADMIN] Create leave type
PUT    /api/leaves/types/{id}         [ADMIN] Update leave type
GET    /api/leaves/quotas?year=       [ADMIN] Get all quotas
POST   /api/leaves/quotas             [ADMIN] Create/update quota
DELETE /api/leaves/quotas/{id}        [ADMIN] Delete quota

# Holidays
GET    /api/leaves/holidays           [All]   All holidays
GET    /api/leaves/holidays/upcoming  [All]   Upcoming holidays
POST   /api/leaves/holidays           [ADMIN] Add holiday
PUT    /api/leaves/holidays/{id}      [ADMIN] Update holiday
DELETE /api/leaves/holidays/{id}      [ADMIN] Delete holiday
```

### Performance

```
POST /api/performance/reviews               [EMPLOYEE/MANAGER] Submit self-review
GET  /api/performance/reviews/me            [All]     My reviews
GET  /api/performance/reviews/team          [MANAGER] Team reviews
PUT  /api/performance/reviews/{id}/feedback [MANAGER] Add rating + feedback

GET  /api/performance/goals/me              [All]     My goals
GET  /api/performance/goals/team            [MANAGER] Team goals
POST /api/performance/goals                 [All]     Create goal
PUT  /api/performance/goals/{id}/progress   [All]     Update progress (0–100)
PUT  /api/performance/goals/{id}/status     [All]     Update status
```

### Departments & Announcements

```
GET    /api/departments                     [All]   All departments
POST   /api/departments                     [ADMIN] Create department
PUT    /api/departments/{id}                [ADMIN] Update department
PUT    /api/departments/{id}/activate       [ADMIN] Activate
PUT    /api/departments/{id}/deactivate     [ADMIN] Deactivate
GET    /api/designations?departmentId=      [All]   Designations (optionally by dept)
GET    /api/announcements                   [All]   All active announcements
POST   /api/announcements                   [ADMIN] Publish announcement
PUT    /api/announcements/{id}              [ADMIN] Update announcement
DELETE /api/announcements/{id}              [ADMIN] Delete announcement
```

### Reports (Admin/Manager only)

```
GET /api/reports/dashboard             Overall HR metrics
GET /api/reports/headcount             Employee count by department
GET /api/reports/leave-utilization     Leave usage statistics
GET /api/reports/performance-summary   Average review scores
GET /api/reports/goal-completion       Goal completion rates
```

### Notifications

```
GET    /api/notifications/me           My notifications (paginated)
GET    /api/notifications/unread-count Number of unread
PUT    /api/notifications/{id}/read    Mark one as read
PUT    /api/notifications/read-all     Mark all as read
DELETE /api/notifications/{id}         Delete notification
```

---

## Running Tests

```bash
# All backend unit tests
cd backend
mvn test

# Specific service
cd backend/leave-service
mvn test

# Frontend unit tests
cd frontend/revworkforce-ui
npm test

# Frontend lint
npm run lint
```

---

## Troubleshooting

### Docker Issues

#### `port is already allocated` when running `docker compose up`

**Windows:**
```bash
netstat -ano | findstr :8080
taskkill /PID <pid> /F
```

**macOS/Linux:**
```bash
lsof -i :8080
kill -9 <pid>
```

Or change the host port in `docker/docker-compose.yml` (`"8090:8080"`).

---

#### Services restart in a loop / `Unable to connect to config server`

Start infrastructure first, then the rest:
```bash
docker compose up service-discovery config-server mysql -d
# Wait ~60s, then:
docker compose up -d
```

---

#### `Out of memory` / build killed mid-way

Docker Desktop → Settings → Resources → Memory → **8 GB**

---

#### Frontend shows blank page

```bash
docker compose logs frontend
docker compose up frontend --build -d
```

---

### Local Setup Issues

#### `Could not connect to config server`

Always start in order: MySQL → Eureka → Config Server → business services → API Gateway → frontend.

---

#### `Access denied for user 'root'@'localhost'`

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'revworkforce@123';
FLUSH PRIVILEGES;
```

---

#### `Unknown database 'revworkforce_users_db'`

```bash
mysql -u root -p'revworkforce@123' < docker/init.sql
```

---

#### Leave balance not found when applying for leave

Log in as Admin → **Leave Configuration** → **Employee Balances** tab → **Apply Quota to All**.

---

#### Performance reviews show no manager / `Employee #N` in team reviews

Log in as Admin → **Employee Management** → edit the employee and assign a manager. The review list resolves names from the user directory — if a user has no manager assigned, team reviews may show a fallback label.

---

#### Reporting dashboard shows all zeros

All 6 services must be registered in Eureka at **http://localhost:8761**. Refresh the dashboard after all show as `UP`.

---

## Future Improvements

### Backend

| Feature | Description |
|---------|-------------|
| **Kafka / RabbitMQ** | Replace synchronous Feign calls for notifications with async event-driven messaging |
| **Redis Caching** | Cache leave balances, department lists, and user lookups |
| **Distributed Tracing** | Add Zipkin or Jaeger to trace requests across services |
| **API Rate Limiting** | Per-user rate limiting at the gateway using Redis |
| **Refresh Token Rotation** | Invalidate old refresh tokens on use |
| **Email Notifications** | Send emails on leave events via Spring Mail + SMTP |
| **Payroll Module** | Calculate monthly payroll with leave deductions |
| **Attendance Tracking** | Clock-in/clock-out with overtime calculation |

### Frontend

| Feature | Description |
|---------|-------------|
| **Calendar View** | Visualize leave schedules in a monthly calendar |
| **Real-time Notifications** | Replace polling with WebSocket for instant push |
| **Export to PDF/Excel** | Export reports and leave history |
| **Profile Photo Upload** | Allow employees to upload profile pictures |
| **Multi-language (i18n)** | Support for multiple languages via Angular i18n |
| **Mobile App** | Companion React Native / Flutter app using the existing REST APIs |

### Infrastructure

| Feature | Description |
|---------|-------------|
| **Kubernetes (K8s)** | Replace Docker Compose with Helm charts for production |
| **AWS / GCP Deployment** | Deploy to EKS or GKE with RDS managed MySQL |
| **Monitoring Stack** | Prometheus + Grafana dashboards for service metrics |
| **Config via Git** | Move Config Server to a Git-backed repository |
| **SSL / HTTPS** | TLS termination at the gateway with Let's Encrypt |

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci-cd.yml`) runs on every push:

1. **backend-build-test** — `mvn clean test` across all 9 modules
2. **frontend-build-test** — `npm ci`, production build, unit tests
3. **docker-build** (main branch only) — `docker compose build` to validate all Dockerfiles

---

*Built with Spring Boot 3.2.3 · Spring Cloud 2023.0.0 · Angular 17 · MySQL 8.0 · Docker*

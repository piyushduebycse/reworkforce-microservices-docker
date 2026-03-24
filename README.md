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
   - [Step 1 — Clone the Repository](#step-1--clone-the-repository)
   - [Step 2 — Set Up MySQL](#step-2--set-up-mysql)
   - [Step 3 — Create Databases](#step-3--create-databases)
   - [Step 4 — Run the Schema](#step-4--run-the-schema)
   - [Step 5 — Build Backend JARs](#step-5--build-backend-jars)
   - [Step 6 — Start Services in Order](#step-6--start-services-in-order)
   - [Step 7 — Start the Frontend](#step-7--start-the-frontend)
   - [Step 8 — Verify Everything is Running](#step-8--verify-everything-is-running)
8. [Demo Credentials](#demo-credentials)
9. [All Service URLs](#all-service-urls)
10. [API Reference](#api-reference)
11. [Running Tests](#running-tests)
12. [Troubleshooting — Local Setup](#troubleshooting--local-setup)
13. [Troubleshooting — Docker Setup](#troubleshooting--docker-setup)
14. [Future Improvements](#future-improvements)

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
              └─────────────┘  │    ││  └─────────────────────┘
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
├── PROJECT_GUIDE.md                   # Full project explanation + 35 interview Q&As
├── .gitignore
│
├── .github/
│   ├── README.md                      # Interview-focused deep-dive guide
│   └── workflows/
│       └── ci-cd.yml                  # GitHub Actions CI/CD pipeline
│
├── backend/
│   ├── pom.xml                        # Parent POM — all 9 modules
│   ├── service-discovery/             # Eureka Server (port 8761)
│   ├── config-server/                 # Spring Cloud Config Server (port 8888)
│   │   └── src/main/resources/config-repo/  # ← Per-service YAML configs
│   ├── api-gateway/                   # API Gateway (port 8080)
│   ├── user-service/                  # Auth + User Management (port 8081)
│   ├── leave-service/                 # Leave Management (port 8082)
│   ├── performance-service/           # Reviews & Goals (port 8083)
│   ├── employee-management-service/   # Departments, Designations, Announcements (port 8084)
│   ├── reporting-service/             # HR Analytics (port 8085)
│   └── notification-service/         # In-App Notifications (port 8086)
│
├── frontend/
│   └── revworkforce-ui/               # Angular 17 SPA
│       ├── src/styles.scss            # Global dark theme + CSS custom properties
│       └── ...
│
└── docker/
    ├── docker-compose.yml             # Full-stack orchestration (10 containers)
    ├── init.sql                       # Creates 6 MySQL databases
    └── schema.sql                     # DDL for all tables + seed data
```

---

## Prerequisites

### For Docker Setup (Option A)

| Tool | Minimum Version | How to Check | Download |
|------|----------------|--------------|----------|
| Git | Any | `git --version` | https://git-scm.com |
| Docker Desktop | 4.0+ | `docker --version` | https://www.docker.com/products/docker-desktop |
| Docker Compose | 2.0+ | `docker compose version` | Included in Docker Desktop |

> **Docker Memory:** Go to **Docker Desktop → Settings → Resources → Memory** and set to **6 GB minimum** (8 GB recommended).

---

### For Local Setup (Option B)

| Tool | Minimum Version | How to Check | Download |
|------|----------------|--------------|----------|
| Git | Any | `git --version` | https://git-scm.com |
| Java JDK | **17 exactly** | `java -version` | https://adoptium.net (Temurin 17) |
| Maven | 3.9+ | `mvn -version` | https://maven.apache.org/download.cgi |
| Node.js | 18+ | `node -version` | https://nodejs.org |
| npm | 9+ | `npm -version` | Included with Node.js |
| MySQL | **8.0** | `mysql --version` | https://dev.mysql.com/downloads/mysql |

> **Important:** Java must be version **17**. Spring Boot 3 does not work with Java 11 or Java 8. Run `java -version` to confirm.

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

> Follow every step in order. Skipping or reordering steps is the most common cause of errors.

### Step 1 — Clone the Repository

```bash
git clone https://github.com/piyushduebycse/reworkforce-microservices-docker.git
cd reworkforce-microservices-docker
```

---

### Step 2 — Set Up MySQL

Make sure MySQL 8.0 is installed and running on port **3306**.

**Verify MySQL is running:**

```bash
# Windows
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p

# macOS / Linux
mysql -u root -p
```

If you can log in, MySQL is running. Type `exit` to quit.

**If MySQL is not in your PATH (Windows), add it:**

1. Search for **Environment Variables** in Windows Start menu
2. Edit `Path` under System Variables
3. Add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
4. Restart your terminal

After adding to PATH, you can use `mysql` directly:
```bash
mysql -u root -p
```

---

### Step 3 — Create Databases

Run `init.sql` to create the 6 required databases:

**Windows (full path):**
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < docker/init.sql
```

**Windows (if MySQL is in PATH):**
```bash
mysql -u root -p < docker/init.sql
```

**macOS / Linux:**
```bash
mysql -u root -p < docker/init.sql
```

Enter your MySQL root password when prompted.

**Verify the databases were created:**
```sql
mysql -u root -p
SHOW DATABASES;
```

You should see all 6:
```
revworkforce_users_db
revworkforce_leaves_db
revworkforce_performance_db
revworkforce_employee_mgmt_db
revworkforce_reporting_db
revworkforce_notifications_db
```

---

### Step 4 — Run the Schema

> **IMPORTANT — Read before running:**
>
> `schema.sql` creates all tables and inserts seed data.
> If you previously ran any Spring Boot service, JPA may have auto-created tables already — this can cause conflicts.
> Follow the correct procedure below to avoid errors.

#### Clean setup (first time, no services run yet)

```bash
# Windows (full path)
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < docker/schema.sql

# Windows (if MySQL is in PATH)
mysql -u root -p < docker/schema.sql

# macOS / Linux
mysql -u root -p < docker/schema.sql
```

#### If you already ran services before running schema.sql

JPA auto-creates tables from entity classes on startup. These tables may be missing columns that `schema.sql` expects (like `holiday_type`). Fix it by dropping and recreating all databases:

```bash
# Step 1 — Wipe and recreate all 6 databases
mysql -u root -p < docker/init.sql

# Step 2 — Now run schema (tables are empty, no conflicts)
mysql -u root -p < docker/schema.sql
```

#### If you get `ERROR 1054: Unknown column 'holiday_type'`

This means the `company_holidays` table was created by JPA without the `holiday_type` column. Two options:

**Option 1 — Quick fix (add the missing column):**
```sql
mysql -u root -p

USE revworkforce_leaves_db;
ALTER TABLE company_holidays ADD COLUMN holiday_type VARCHAR(50) DEFAULT 'NATIONAL';
exit
```
Then re-run schema.sql:
```bash
mysql -u root -p < docker/schema.sql
```

**Option 2 — Clean start (recommended):**
```bash
mysql -u root -p < docker/init.sql
mysql -u root -p < docker/schema.sql
```

---

### Step 5 — Build Backend JARs

Build all 9 Spring Boot services with one command:

```bash
cd backend
mvn clean package -DskipTests
```

> This downloads all Maven dependencies (~200MB first time). Subsequent builds are much faster.
>
> Expected output at the end:
> ```
> [INFO] BUILD SUCCESS
> [INFO] Total time: 2-5 minutes
> ```

**If `mvn` is not recognized:**
- Download Maven from https://maven.apache.org/download.cgi
- Extract and add the `bin` folder to your system PATH
- Or use the Maven wrapper if present: `./mvnw clean package -DskipTests`

---

### Step 6 — Start Services in Order

> **Critical:** Services must start in this exact order due to dependencies.
> Open a **separate terminal window** for each service and keep them all running.

#### Terminal 1 — Eureka (Service Discovery)

```bash
cd backend/service-discovery
mvn spring-boot:run
```

Wait until you see:
```
Started ServiceDiscoveryApplication in X seconds
```
Then open **http://localhost:8761** in your browser — you should see the Eureka dashboard.

---

#### Terminal 2 — Config Server

```bash
cd backend/config-server
mvn spring-boot:run
```

Wait until you see:
```
Started ConfigServerApplication in X seconds
```
Verify: open **http://localhost:8888/user-service/default** — should return JSON config.

---

#### Terminal 3 — User Service

```bash
cd backend/user-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Wait for:
```
Started UserServiceApplication in X seconds
```

---

#### Terminal 4 — Leave Service

```bash
cd backend/leave-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

#### Terminal 5 — Performance Service

```bash
cd backend/performance-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

#### Terminal 6 — Employee Management Service

```bash
cd backend/employee-management-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

#### Terminal 7 — Reporting Service

```bash
cd backend/reporting-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

#### Terminal 8 — Notification Service

```bash
cd backend/notification-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

---

#### Terminal 9 — API Gateway (start last)

```bash
cd backend/api-gateway
mvn spring-boot:run
```

Wait for:
```
Started ApiGatewayApplication in X seconds
```

---

### Step 7 — Start the Frontend

Open a new terminal:

```bash
cd frontend/revworkforce-ui
npm install
npm start
```

> `npm install` downloads ~1,200 packages (~300MB). Only needed the first time.
>
> The app will open at **http://localhost:4200**

---

### Step 8 — Verify Everything is Running

1. **Eureka Dashboard** → http://localhost:8761
   - Should show 6 services registered: USER-SERVICE, LEAVE-SERVICE, PERFORMANCE-SERVICE, EMPLOYEE-MANAGEMENT-SERVICE, REPORTING-SERVICE, NOTIFICATION-SERVICE

2. **API Gateway health** → http://localhost:8080/actuator/health
   - Should return `{"status":"UP"}`

3. **Frontend** → http://localhost:4200
   - Login with `admin@revworkforce.com` / `Admin@123`

---

## Demo Credentials

Seeded automatically on first startup (`-Dspring-boot.run.profiles=dev`):

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

> **Note:** The login page includes a **clickable demo accounts panel** — click any account to auto-fill credentials instantly.

---

## All Service URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:4200 | Angular dark-theme UI |
| **API Gateway** | http://localhost:8080 | Single entry point for all API calls |
| **Eureka Dashboard** | http://localhost:8761 | View all registered services |
| **Config Server** | http://localhost:8888/user-service/default | View per-service config |
| User Service | http://localhost:8081/actuator/health | Health check |
| Leave Service | http://localhost:8082/actuator/health | Health check |
| Performance Service | http://localhost:8083/actuator/health | Health check |
| Employee Mgmt Service | http://localhost:8084/actuator/health | Health check |
| Reporting Service | http://localhost:8085/actuator/health | Health check |
| Notification Service | http://localhost:8086/actuator/health | Health check |

> All API calls go through **port 8080** (gateway). Never call individual service ports directly from the browser.

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
POST /api/leaves/applications               [EMPLOYEE] Apply for leave
GET  /api/leaves/applications/me            [All]      My applications
GET  /api/leaves/applications/team          [MANAGER]  Team applications
GET  /api/leaves/applications/pending       [MANAGER]  Pending approvals
PUT  /api/leaves/applications/{id}/approve  [MANAGER]  Approve leave
PUT  /api/leaves/applications/{id}/reject   [MANAGER]  Reject leave
PUT  /api/leaves/applications/{id}/cancel   [EMPLOYEE] Cancel own leave

GET  /api/leaves/balances/me                [All]   My balances
GET  /api/leaves/types                      [All]   All leave types
GET  /api/leaves/holidays/upcoming          [All]   Upcoming holidays
```

### Performance

```
POST /api/performance/reviews               Submit self-review
GET  /api/performance/reviews/me            My reviews
GET  /api/performance/reviews/team          [MANAGER] Team reviews
PUT  /api/performance/reviews/{id}/feedback [MANAGER] Add rating + feedback

GET  /api/performance/goals/me              My goals
POST /api/performance/goals                 Create goal
PUT  /api/performance/goals/{id}/progress   Update progress (0–100)
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
GET    /api/notifications/me           My notifications
GET    /api/notifications/unread-count Number of unread
PUT    /api/notifications/{id}/read    Mark one as read
PUT    /api/notifications/read-all     Mark all as read
```

---

## Running Tests

```bash
# All backend unit tests
cd backend
mvn test

# Specific service only
cd backend/leave-service
mvn test

# Frontend unit tests
cd frontend/revworkforce-ui
npm test

# Frontend lint check
npm run lint
```

---

## Troubleshooting — Local Setup

### MySQL Issues

---

#### `mysql` command not found / not recognized

MySQL is not in your system PATH.

**Windows — use the full path:**
```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p
```

**Or add MySQL to PATH permanently:**
1. Open **Start → Search "Environment Variables"**
2. Click **Environment Variables**
3. Under **System Variables**, find `Path` → click **Edit**
4. Click **New** → add: `C:\Program Files\MySQL\MySQL Server 8.0\bin`
5. Click OK → restart your terminal

---

#### `Access denied for user 'root'@'localhost'`

Your MySQL root password is wrong or not set.

**Reset the root password:**
```sql
-- Open MySQL as root (try with no password first)
mysql -u root

-- If that works, set the password:
ALTER USER 'root'@'localhost' IDENTIFIED BY 'revworkforce@123';
FLUSH PRIVILEGES;
exit
```

**If you cannot log in at all (forgot root password):**

1. Stop MySQL service:
   - Windows: `net stop MySQL80` (in admin terminal)
   - macOS: `brew services stop mysql`
2. Start MySQL without auth: `mysqld --skip-grant-tables`
3. Connect: `mysql -u root`
4. Reset: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'revworkforce@123'; FLUSH PRIVILEGES;`
5. Restart MySQL normally

---

#### `Unknown database 'revworkforce_users_db'`

The databases haven't been created yet. Run `init.sql`:

```bash
mysql -u root -p < docker/init.sql
```

Verify:
```sql
mysql -u root -p
SHOW DATABASES;
```

---

#### `ERROR 1054 (42S22): Unknown column 'holiday_type' in field list`

This happens when Spring Boot services ran before `schema.sql` — JPA created the `company_holidays` table without the `holiday_type` column, and now `schema.sql` tries to insert data with that column.

**Fix — clean start (recommended):**
```bash
# Drop and recreate all 6 databases
mysql -u root -p < docker/init.sql

# Now run schema on fresh empty databases
mysql -u root -p < docker/schema.sql
```

**Fix — quick patch (add the missing column only):**
```sql
mysql -u root -p

USE revworkforce_leaves_db;
ALTER TABLE company_holidays ADD COLUMN holiday_type VARCHAR(50) DEFAULT 'NATIONAL';
exit
```
Then re-run:
```bash
mysql -u root -p < docker/schema.sql
```

---

#### `ERROR 1062: Duplicate entry` when running schema.sql

Some seed data rows already exist in the database. The schema uses `INSERT IGNORE` which should skip duplicates. If you still get errors, do a clean start:

```bash
mysql -u root -p < docker/init.sql
mysql -u root -p < docker/schema.sql
```

---

#### `Can't connect to MySQL server on 'localhost'` (from Spring Boot)

MySQL is not running.

**Windows — start MySQL:**
```bash
# In an Administrator terminal
net start MySQL80
```

**macOS:**
```bash
brew services start mysql
# or
sudo /usr/local/mysql/support-files/mysql.server start
```

**Linux:**
```bash
sudo systemctl start mysql
```

---

### Maven / Build Issues

---

#### `mvn` is not recognized

Maven is not installed or not in PATH.

**Install Maven:**
1. Download from https://maven.apache.org/download.cgi (binary zip)
2. Extract to e.g. `C:\Program Files\Apache\maven`
3. Add `C:\Program Files\Apache\maven\bin` to System PATH
4. Restart terminal → `mvn -version` should work

---

#### `java: error: release version 17 not supported` or `UnsupportedClassVersionError`

Wrong Java version. Spring Boot 3 requires Java 17.

**Check current version:**
```bash
java -version
```

**If wrong version — install Java 17:**
- Download Temurin 17: https://adoptium.net
- Install it
- Set `JAVA_HOME` to the Java 17 installation path
- Make sure `java -version` shows `17`

**Windows — set JAVA_HOME:**
1. Environment Variables → System Variables → New
2. Name: `JAVA_HOME`
3. Value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x-hotspot`
4. Edit `Path` → Add: `%JAVA_HOME%\bin`
5. Restart terminal

---

#### `BUILD FAILURE` — `Could not resolve dependencies`

Maven cannot download dependencies (no internet or proxy issue).

**Check internet connection, then:**
```bash
cd backend
mvn clean package -DskipTests -U
```
The `-U` flag forces Maven to re-download snapshots and check for updates.

**Behind a corporate proxy — add to `~/.m2/settings.xml`:**
```xml
<settings>
  <proxies>
    <proxy>
      <id>corporate</id>
      <active>true</active>
      <protocol>http</protocol>
      <host>your.proxy.host</host>
      <port>8080</port>
    </proxy>
  </proxies>
</settings>
```

---

#### `Port 8080 / 8081 / 8082... is already in use`

Another process is using that port.

**Windows — find and kill the process:**
```bash
# Find what is using port 8081
netstat -ano | findstr :8081

# Kill by PID (replace 12345 with the actual PID)
taskkill /PID 12345 /F
```

**macOS / Linux:**
```bash
lsof -i :8081
kill -9 <PID>
```

**Or — change the port in application config:**
```yaml
# backend/user-service/src/main/resources/application.yml
server:
  port: 8091   # Change to any free port
```

---

### Spring Boot Startup Issues

---

#### `Could not connect to config server` / `Connection refused` on startup

Config Server is not running or Eureka is not ready yet.

**Solution — always start in this exact order:**
1. MySQL (already running)
2. Eureka (`service-discovery`) — wait for port 8761 to respond
3. Config Server — wait for port 8888 to respond
4. All other services
5. API Gateway last

Wait at least **30–60 seconds** after Eureka starts before launching other services.

---

#### Service starts but immediately stops / crashes

Check the terminal for the error. Most common causes:

**Can't reach Config Server:**
```
Could not locate PropertySource, the config server may be down
```
→ Config Server is not running. Start it first and wait for it.

**Database connection refused:**
```
HikariPool-1 - Exception during pool initialization... Connection refused
```
→ MySQL is not running or wrong password. Start MySQL and verify credentials.

**Port already in use:**
```
Web server failed to start. Port 8081 was already in use.
```
→ Kill the process using that port (see above).

---

#### `Unable to find @SpringBootConfiguration` during `mvn test`

You're running `mvn test` from a parent directory that isn't a Spring Boot project.

```bash
# Run from the specific service directory
cd backend/user-service
mvn test
```

---

#### Services start but Eureka shows them as DOWN

Give services 30–60 seconds to register. Eureka has a heartbeat delay.

If a service shows DOWN after 2 minutes:
```bash
# Check its health endpoint
curl http://localhost:8081/actuator/health
```

If you get a response, it's fine — Eureka just hasn't updated yet.

---

### Frontend Issues

---

#### `npm install` fails with permission errors

**Windows:**
```bash
# Run terminal as Administrator, then:
npm install --force
```

**macOS / Linux:**
```bash
sudo npm install
```

---

#### `npm install` is very slow or hangs

Clear npm cache and retry:
```bash
npm cache clean --force
npm install
```

---

#### `Node.js version is not supported`

Check your Node version:
```bash
node -version
```

Must be **18 or higher**. Download from https://nodejs.org (LTS version).

---

#### Angular app loads but all API calls fail (Network Error / 0 status)

The API Gateway is not running. Make sure all 9 backend services are running first, especially the API Gateway on port 8080.

Check:
```bash
curl http://localhost:8080/actuator/health
```

If connection refused → start the gateway.

---

#### `ENOENT: no such file or directory, open 'package.json'`

You're in the wrong directory. Make sure you're inside `frontend/revworkforce-ui`:

```bash
cd frontend/revworkforce-ui
npm install
npm start
```

---

#### Login works but dashboard shows blank / no data

Services are running but leave balances haven't been initialized.

1. Login as **Admin** (`admin@revworkforce.com` / `Admin@123`)
2. Go to **Leave Configuration** → **Employee Balances** tab
3. Click **Apply Quota to All**

This initializes leave balances for all employees.

---

#### Performance reviews show `Team Member` instead of employee name

The employee has no manager assigned.

1. Login as **Admin**
2. Go to **Employee Management**
3. Edit each employee → assign a manager
4. Refresh the review list

---

#### Reporting dashboard shows all zeros

All 6 services must be registered in Eureka. Open **http://localhost:8761** — verify all appear as UP. If any service is missing, check its terminal for errors and restart it.

---

#### Frontend shows a blank white page

Open browser DevTools (F12) → Console tab. Check for errors.

Most common cause — Angular build error. Check the terminal running `npm start` for compilation errors.

---

## Troubleshooting — Docker Setup

---

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

Or change the host port in `docker/docker-compose.yml` (e.g., `"8090:8080"`).

---

#### Services restart in a loop / `Unable to connect to config server`

Start infrastructure containers first, then wait before starting the rest:

```bash
docker compose up service-discovery config-server mysql -d
# Wait 60 seconds, then:
docker compose up -d
```

---

#### `Out of memory` / build killed mid-way

Docker Desktop → Settings → Resources → Memory → **8 GB** → Apply & Restart

---

#### Frontend shows blank page (Docker)

```bash
docker compose logs frontend
docker compose up frontend --build -d
```

---

#### Want a completely fresh start (reset all data)

```bash
docker compose down -v    # Stops containers and deletes all volumes (database data wiped)
docker compose up --build -d
```

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

### Infrastructure

| Feature | Description |
|---------|-------------|
| **Kubernetes (K8s)** | Replace Docker Compose with Helm charts for production |
| **AWS / GCP Deployment** | Deploy to EKS or GKE with RDS managed MySQL |
| **Monitoring Stack** | Prometheus + Grafana dashboards for service metrics |
| **SSL / HTTPS** | TLS termination at the gateway with Let's Encrypt |

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci-cd.yml`) runs on every push:

1. **backend-build-test** — `mvn clean test` across all 9 modules
2. **frontend-build-test** — `npm ci`, production build, unit tests
3. **docker-build** (main branch only) — `docker compose build` to validate all Dockerfiles

---

*Built with Spring Boot 3.2.3 · Spring Cloud 2023.0.0 · Angular 17 · MySQL 8.0 · Docker*

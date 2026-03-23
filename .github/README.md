# RevWorkforce — Cloud-Native HRM Platform

A production-grade **Human Resource Management System** built with **Spring Boot 3 microservices**, **Angular 17**, and **Spring Cloud** infrastructure. Designed to demonstrate real-world enterprise architecture patterns.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Structure](#folder-structure)
4. [Database Schema](#database-schema)
5. [Setup & Running Guide](#setup--running-guide)
   - [Prerequisites](#prerequisites)
   - [Option A — Docker Compose (Recommended)](#option-a--docker-compose-recommended)
   - [Option B — Manual Local Run](#option-b--manual-local-run)
   - [Option C — Frontend Only (Mock)](#option-c--frontend-only-mock)
6. [API Reference](#api-reference)
7. [Demo Credentials](#demo-credentials)
8. [Interview Presentation Guide](#interview-presentation-guide)

---

## Architecture Overview

```
                          ┌─────────────────────────────────┐
                          │        Angular 17 Frontend       │
                          │       http://localhost:4200      │
                          └──────────────┬──────────────────┘
                                         │ HTTP /api/**
                          ┌──────────────▼──────────────────┐
                          │        API Gateway (8080)        │
                          │  JWT Filter · Rate Limit · CB    │
                          └──┬──────┬──────┬──────┬─────────┘
                             │      │      │      │
           ┌─────────────────▼─┐  ┌─▼──┐  │  ┌──▼──────────────────┐
           │  user-service 8081│  │    │  │  │  leave-service 8082  │
           │  Auth · Users     │  │ CB │  │  │  Applications·Balance│
           └─────────────────┬─┘  └────┘  │  └────────────┬─────────┘
                             │             │               │
              ┌──────────────▼─┐     ┌─────▼──────────────▼──┐
              │ performance-   │     │  employee-management- │
              │ service  8083  │     │  service  8084        │
              │ Reviews · Goals│     │  Dept · Desig · Annc  │
              └────────────────┘     └───────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
   ┌──────▼──────┐  ┌────────▼──────┐  ┌───────▼──────┐
   │ reporting-  │  │notification-  │  │Config Server │
   │ service 8085│  │service   8086 │  │port 8888     │
   │ HR Dashboard│  │Push Alerts    │  └──────────────┘
   └─────────────┘  └───────────────┘
                                         ┌─────────────┐
                                         │   Eureka    │
                                         │  port 8761  │
                                         └─────────────┘
```

### Key Patterns Used
| Pattern | Implementation |
|---------|---------------|
| **Service Discovery** | Netflix Eureka — all services self-register |
| **Centralized Config** | Spring Cloud Config Server (native/classpath profile) |
| **API Gateway** | Spring Cloud Gateway with JWT validation filter |
| **Circuit Breaker** | Resilience4j on all gateway routes with fallback |
| **Inter-Service Calls** | OpenFeign with JWT header propagation |
| **Database per Service** | 6 separate MySQL databases |
| **JWT Auth** | JJWT HS256, 24h access + 7d refresh tokens |
| **Role-Based Access** | Spring Security `@PreAuthorize` + Angular route guards |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | Java 17, TypeScript 5 |
| Backend Framework | Spring Boot 3.2.3 |
| Cloud Infrastructure | Spring Cloud 2023.0.0 |
| Service Discovery | Netflix Eureka |
| API Gateway | Spring Cloud Gateway (Reactive) |
| Inter-Service Comms | OpenFeign + Resilience4j |
| Security | Spring Security + JJWT 0.11.5 |
| ORM | Spring Data JPA + Hibernate |
| Database | MySQL 8.0 |
| Frontend | Angular 17 (Standalone Components) |
| UI Library | Angular Material |
| Build Tool | Maven (Multi-module), npm |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Folder Structure

```
RevWorkforce/
├── README.md
├── .github/
│   └── workflows/
│       └── ci-cd.yml                   # GitHub Actions — build, test, docker
│
├── backend/
│   ├── pom.xml                         # Parent POM — all 9 modules declared
│   │
│   ├── service-discovery/              # Eureka Server (port 8761)
│   │   ├── src/main/java/com/revworkforce/servicediscovery/
│   │   │   └── ServiceDiscoveryApplication.java
│   │   ├── src/main/resources/application.yml
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── config-server/                  # Spring Cloud Config Server (port 8888)
│   │   ├── src/main/java/com/revworkforce/configserver/
│   │   │   └── ConfigServerApplication.java
│   │   ├── src/main/resources/
│   │   │   ├── application.yml
│   │   │   └── config-repo/            # ← All service configs live here
│   │   │       ├── user-service.yml
│   │   │       ├── leave-service.yml
│   │   │       ├── performance-service.yml
│   │   │       ├── employee-management-service.yml
│   │   │       ├── reporting-service.yml
│   │   │       ├── notification-service.yml
│   │   │       └── api-gateway.yml
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── api-gateway/                    # API Gateway (port 8080)
│   │   ├── src/main/java/com/revworkforce/apigateway/
│   │   │   ├── ApiGatewayApplication.java
│   │   │   ├── filter/
│   │   │   │   ├── JwtAuthenticationFilter.java   # Validates JWT, injects headers
│   │   │   │   └── BlockInternalRoutesFilter.java # 403 for /api/internal/**
│   │   │   └── controller/
│   │   │       └── FallbackController.java        # Circuit breaker fallbacks
│   │   ├── src/main/resources/application.yml
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── user-service/                   # Auth + User Management (port 8081)
│   │   ├── src/main/java/com/revworkforce/userservice/
│   │   │   ├── UserServiceApplication.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java            # /api/auth/*
│   │   │   │   ├── UserController.java            # /api/users/*, /api/profiles/*
│   │   │   │   └── InternalUserController.java    # /api/internal/users/* (Feign)
│   │   │   ├── service/
│   │   │   │   ├── UserService.java
│   │   │   │   └── UserServiceImpl.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   └── Role.java (enum)
│   │   │   ├── dto/                               # Request/Response DTOs
│   │   │   ├── repository/
│   │   │   │   └── UserRepository.java
│   │   │   ├── security/
│   │   │   │   ├── JwtTokenProvider.java
│   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   └── SecurityConfig.java
│   │   │   ├── exception/
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── config/
│   │   │       └── DataInitializer.java           # @Profile("dev") seed data
│   │   ├── src/test/java/...
│   │   │   ├── service/UserServiceImplTest.java
│   │   │   └── controller/AuthControllerTest.java
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── leave-service/                  # Leave Management (port 8082)
│   │   ├── src/main/java/com/revworkforce/leaveservice/
│   │   │   ├── entity/                            # LeaveApplication, LeaveType,
│   │   │   │                                      # LeaveBalance, CompanyHoliday, LeaveQuota
│   │   │   ├── controller/
│   │   │   │   ├── LeaveController.java           # /api/leaves/*
│   │   │   │   ├── LeaveTypeController.java
│   │   │   │   ├── LeaveBalanceController.java
│   │   │   │   └── HolidayController.java
│   │   │   ├── feign/
│   │   │   │   ├── UserServiceClient.java         # Feign → user-service
│   │   │   │   └── NotificationServiceClient.java # Feign → notification-service
│   │   │   └── config/
│   │   │       └── FeignClientConfig.java         # JWT header forwarding
│   │   ├── src/test/.../LeaveServiceImplTest.java
│   │   ├── pom.xml
│   │   └── Dockerfile
│   │
│   ├── performance-service/            # Performance Reviews & Goals (port 8083)
│   │   ├── entity/                    # ReviewCycle, PerformanceReview, Goal
│   │   ├── controller/
│   │   │   ├── ReviewCycleController.java
│   │   │   ├── PerformanceReviewController.java
│   │   │   └── GoalController.java
│   │   ├── src/test/.../PerformanceServiceImplTest.java
│   │   └── ...
│   │
│   ├── employee-management-service/   # Dept, Designations, Announcements (port 8084)
│   │   ├── entity/                    # Department, Designation, Announcement
│   │   ├── controller/
│   │   │   ├── DepartmentController.java
│   │   │   ├── DesignationController.java
│   │   │   └── AnnouncementController.java
│   │   ├── feign/
│   │   │   └── UserServiceClient.java
│   │   ├── src/test/.../DepartmentControllerTest.java
│   │   └── ...
│   │
│   ├── reporting-service/             # HR Analytics Dashboard (port 8085)
│   │   ├── controller/
│   │   │   └── ReportController.java  # /api/reports/dashboard, /headcount, etc.
│   │   ├── feign/
│   │   │   ├── UserServiceClient.java
│   │   │   └── LeaveServiceClient.java
│   │   └── ...
│   │
│   └── notification-service/          # In-App Notifications (port 8086)
│       ├── entity/                    # Notification, NotificationType
│       ├── controller/
│       │   └── NotificationController.java  # /api/notifications/me
│       └── ...
│
├── frontend/
│   └── revworkforce-ui/               # Angular 17 Application
│       ├── angular.json
│       ├── package.json
│       ├── tsconfig.json
│       ├── nginx.conf                 # SPA routing + /api proxy
│       ├── Dockerfile                 # Node builder → nginx alpine
│       └── src/
│           ├── index.html
│           ├── main.ts
│           ├── styles.scss
│           ├── environments/
│           │   ├── environment.ts
│           │   └── environment.prod.ts
│           └── app/
│               ├── app.component.ts
│               ├── app.config.ts      # provideHttpClient, provideRouter
│               ├── app.routes.ts      # Lazy-loaded routes with guards
│               ├── core/
│               │   ├── guards/
│               │   │   ├── auth.guard.ts           # CanActivateFn
│               │   │   └── role.guard.ts           # role-based guard
│               │   ├── interceptors/
│               │   │   └── auth.interceptor.ts     # Attach Bearer token
│               │   ├── models/
│               │   │   ├── user.model.ts
│               │   │   ├── leave.model.ts
│               │   │   ├── performance.model.ts
│               │   │   └── notification.model.ts
│               │   └── services/
│               │       ├── auth.service.ts
│               │       ├── leave.service.ts
│               │       ├── performance.service.ts
│               │       ├── notification.service.ts
│               │       └── user.service.ts
│               ├── features/
│               │   ├── auth/
│               │   │   ├── login/login.component.ts
│               │   │   └── unauthorized/unauthorized.component.ts
│               │   ├── employee-dashboard/
│               │   ├── manager-dashboard/
│               │   ├── admin-dashboard/
│               │   ├── leave/
│               │   │   ├── leave-apply/
│               │   │   ├── leave-list/
│               │   │   ├── leave-balance/
│               │   │   └── leave-approval/
│               │   ├── performance/
│               │   │   ├── review-list/
│               │   │   ├── review-form/
│               │   │   └── goal-list/
│               │   ├── admin/
│               │   │   ├── employee-management/
│               │   │   ├── department-management/
│               │   │   └── announcements/
│               │   └── notifications/
│               │       └── notification-panel/
│               └── shared/
│                   └── components/
│                       └── layout/layout.component.ts  # Sidenav + topbar
│
└── docker/
    ├── docker-compose.yml             # Full stack orchestration
    ├── init.sql                       # Creates 6 MySQL databases
    └── schema.sql                     # Complete DDL for all tables + seed data
```

---

## Database Schema

Six isolated databases following the **Database-per-Service** pattern:

| Database | Service | Tables |
|----------|---------|--------|
| `revworkforce_users_db` | user-service | `users` |
| `revworkforce_leaves_db` | leave-service | `leave_types`, `leave_balances`, `leave_applications`, `company_holidays`, `leave_quotas` |
| `revworkforce_performance_db` | performance-service | `review_cycles`, `performance_reviews`, `goals` |
| `revworkforce_employee_mgmt_db` | employee-management-service | `departments`, `designations`, `announcements` |
| `revworkforce_reporting_db` | reporting-service | `report_snapshots` (aggregated via Feign) |
| `revworkforce_notifications_db` | notification-service | `notifications` |

> JPA `ddl-auto: update` creates tables automatically on first startup.
> Run `docker/schema.sql` for explicit table creation with indexes and seed data.

---

## Setup & Running Guide

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Docker Desktop | ≥ 4.x | `docker --version` |
| Docker Compose | ≥ 2.x | `docker compose version` |
| Java JDK | 17 | `java -version` |
| Maven | ≥ 3.9 | `mvn -version` |
| Node.js | ≥ 18 | `node -version` |
| npm | ≥ 9 | `npm -version` |
| MySQL | 8.0 (local only) | `mysql --version` |

---

### Option A — Docker Compose (Recommended)

> Starts all 10 containers: MySQL, Eureka, Config Server, API Gateway, 6 services, Angular (nginx)

**Step 1 — Build backend JARs**
```bash
cd E:\RevWorkforce\backend
mvn clean package -DskipTests
```

**Step 2 — Start the full stack**
```bash
cd E:\RevWorkforce\docker
docker compose up --build -d
```

**Step 3 — Watch startup order (takes ~2-3 minutes)**
```bash
docker compose logs -f
# Wait until you see: "Started UserServiceApplication", etc.
```

**Step 4 — Initialize schema and seed data**
```bash
# Apply full schema (optional — JPA auto-creates tables)
docker exec -i revworkforce-mysql mysql -uroot -proot < schema.sql
```

**Step 5 — Access the application**

| Service | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| API Gateway | http://localhost:8080 |
| Eureka Dashboard | http://localhost:8761 |
| Config Server | http://localhost:8888/user-service/default |
| User Service | http://localhost:8081 |
| Leave Service | http://localhost:8082 |
| Performance Service | http://localhost:8083 |
| Employee Mgmt Service | http://localhost:8084 |
| Reporting Service | http://localhost:8085 |
| Notification Service | http://localhost:8086 |

**Stop everything**
```bash
docker compose down
# To also remove volumes (reset DB):
docker compose down -v
```

---

### Option B — Manual Local Run

Run services in this exact order (startup dependency order):

**Step 1 — Start MySQL locally**
```bash
# Ensure MySQL 8 is running on port 3306
# Create databases:
mysql -u root -p < E:\RevWorkforce\docker\init.sql
mysql -u root -p < E:\RevWorkforce\docker\schema.sql
```

**Step 2 — Start Eureka Server**
```bash
cd E:\RevWorkforce\backend\service-discovery
mvn spring-boot:run
# Wait for: Started ServiceDiscoveryApplication on port 8761
```

**Step 3 — Start Config Server**
```bash
cd E:\RevWorkforce\backend\config-server
mvn spring-boot:run
# Wait for: Started ConfigServerApplication on port 8888
```

**Step 4 — Start Business Services** (open separate terminals)
```bash
# Terminal 1
cd E:\RevWorkforce\backend\user-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2
cd E:\RevWorkforce\backend\leave-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 3
cd E:\RevWorkforce\backend\performance-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 4
cd E:\RevWorkforce\backend\employee-management-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 5
cd E:\RevWorkforce\backend\reporting-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 6
cd E:\RevWorkforce\backend\notification-service
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Step 5 — Start API Gateway**
```bash
cd E:\RevWorkforce\backend\api-gateway
mvn spring-boot:run
```

**Step 6 — Start Angular Frontend**
```bash
cd E:\RevWorkforce\frontend\revworkforce-ui
npm install
npm start
# App runs on http://localhost:4200
```

---

### Option C — Frontend Only (Mock)

If backend is not running, the Angular app still loads — just API calls will fail with 0/504.
Use browser DevTools to inspect the JWT auth flow and routing logic.

---

## API Reference

### Authentication (`/api/auth`)
```
POST /api/auth/login              Body: { email, password }       → { token, refreshToken, user }
POST /api/auth/register           [ADMIN only]                    → { user }
POST /api/auth/refresh            Body: { refreshToken }          → { token }
POST /api/auth/logout             [Authenticated]
GET  /api/auth/me                 [Authenticated]                 → { user }
```

### Users (`/api/users`)
```
GET  /api/users                   [ADMIN] ?page=0&size=10         → Page<UserDto>
GET  /api/users/directory         [All]                           → List<UserSummaryDto>
GET  /api/users/search?query=     [All]                           → List<UserSummaryDto>
PUT  /api/users/{id}              [ADMIN/self]                    → UserDto
DELETE /api/users/{id}            [ADMIN]
```

### Leave Management (`/api/leaves`, `/api/leave-types`, `/api/leave-balances`)
```
POST /api/leaves                  Apply for leave
GET  /api/leaves/my               My leave history
GET  /api/leaves/pending          [MANAGER] Team pending approvals
PUT  /api/leaves/{id}/approve     [MANAGER]
PUT  /api/leaves/{id}/reject      [MANAGER]
PUT  /api/leaves/{id}/cancel      [EMPLOYEE — own only]
GET  /api/leave-balances/my       My current balances
GET  /api/leave-types             All active leave types
```

### Performance (`/api/reviews`, `/api/goals`, `/api/review-cycles`)
```
POST /api/reviews                 Submit self-review
GET  /api/reviews/my              My reviews
PUT  /api/reviews/{id}/feedback   [MANAGER] Add feedback + rating
GET  /api/goals/my                My goals
POST /api/goals                   Create goal
PUT  /api/goals/{id}/progress     Update progress (0-100)
PUT  /api/goals/{id}/status       Update status
```

### Reports (`/api/reports`) — ADMIN/MANAGER only
```
GET  /api/reports/dashboard       HR Dashboard summary
GET  /api/reports/headcount       Employee headcount by department
GET  /api/reports/leave-utilization  Leave usage statistics
GET  /api/reports/performance-summary  Review scores summary
GET  /api/reports/goal-completion  Goal completion rates
```

### Notifications (`/api/notifications`)
```
GET  /api/notifications/me        My notifications (paginated)
GET  /api/notifications/unread-count
PUT  /api/notifications/{id}/read
PUT  /api/notifications/read-all
DELETE /api/notifications/{id}
```

---

## Demo Credentials

Seeded automatically when running with `spring.profiles.active=dev`:

| Role | Email | Password | Features |
|------|-------|----------|---------|
| **ADMIN** | admin@revworkforce.com | Admin@123 | All features, user management, reports |
| **MANAGER** | manager1@revworkforce.com | Manager@123 | Approve leaves, add review feedback, view team |
| **MANAGER** | manager2@revworkforce.com | Manager@123 | Same as above |
| **EMPLOYEE** | emp1@revworkforce.com | Employee@123 | Apply leave, self-review, goals |
| **EMPLOYEE** | emp2@revworkforce.com | Employee@123 | Same as above |
| **EMPLOYEE** | emp3@revworkforce.com | Employee@123 | Same as above |

---

## Interview Presentation Guide

### How to Open (60 seconds)

> *"I built RevWorkforce — a production-grade cloud-native HRM platform that demonstrates real enterprise microservices patterns. It's not a tutorial project; it uses the same architectural decisions you'd make in an actual team at scale."*

Start by showing the **Eureka dashboard** at `http://localhost:8761` — all 6 services registered and healthy. This immediately proves the distributed system is live.

---

### Walking Through the Architecture (3-5 minutes)

**1. Show the folder structure** — point out:
- Multi-module Maven parent POM — single `mvn package` builds all 9 artifacts
- Each service is a self-contained Spring Boot app with its own DB, security config, and tests
- Config Server's `config-repo/` folder — one YAML per service, all in one place

**2. Open Eureka (`http://localhost:8761`)**
- "Every service registers itself. The gateway discovers them dynamically — no hardcoded URLs."

**3. Show Config Server (`http://localhost:8888/user-service/default`)**
- "Centralized config. Change a property once — all instances pick it up on refresh."

**4. Demo the JWT flow live:**
```bash
# Login as admin
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@revworkforce.com","password":"Admin@123"}'

# Copy the token, then:
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/users
```
- "The gateway validates the JWT and injects X-User-Id, X-User-Role headers — services trust those headers, no DB lookup needed."

**5. Try hitting an internal route:**
```bash
curl http://localhost:8080/api/internal/users/1
# Returns 403 — BlockInternalRoutesFilter at work
```

---

### Demonstrating the Frontend (2-3 minutes)

1. Go to `http://localhost:4200` → login as **admin**
2. Show the **Admin Dashboard** → HR metrics aggregated from multiple services
3. Logout → login as **employee**
4. Apply a leave request — show form validation, date picker, balance check
5. Logout → login as **manager**
6. Show **Pending Approvals** — approve the leave
7. Login back as employee → show the notification received

**Key talking points:**
- Angular 17 standalone components — no NgModules
- Functional route guards (`authGuard`, `roleGuard`) — try navigating to `/admin` as an employee
- HTTP interceptor auto-attaches JWT — no manual header setting anywhere in components

---

### Deep-Dive Topics (Be Ready For These)

**Q: Why separate databases per service?**
> "Each service owns its data — no shared tables, no shared connections. leave-service never queries the users table directly; it calls user-service's internal API via Feign. This means each service can scale independently and be deployed separately."

**Q: How does the leave approval update the balance?**
> "In LeaveServiceImpl.approveLeave(): validate status is PENDING, call UserServiceClient to verify the manager has authority, then deduct from LeaveBalance. If the employee later cancels an approved leave, the balance is restored. This is optimistic — no distributed transactions; eventual consistency via application logic."

**Q: How does JWT propagation between services work?**
> "FeignClientConfig implements RequestInterceptor. Before every Feign call, it reads the Bearer token from the current ServletRequestAttributes and adds it as the Authorization header. So when leave-service calls user-service internally, it passes the user's original token."

**Q: What happens if user-service is down and leave-service calls it?**
> "Resilience4j circuit breaker on the gateway. After a threshold of failures, the circuit opens and requests get routed to FallbackController which returns a 503 JSON with a friendly message instead of a 500 cascade failure."

**Q: How do you run tests?**
```bash
cd E:\RevWorkforce\backend
mvn test
# 7 test classes: UserServiceImplTest, AuthControllerTest,
# LeaveServiceImplTest, PerformanceServiceImplTest,
# DepartmentControllerTest, NotificationServiceImplTest,
# ReportControllerTest
```

**Q: How would you scale this to production?**
> "Replace Config Server's native profile with a Git-backed repo for audit history. Add Kafka for async notification events instead of synchronous Feign calls. Replace the single MySQL with RDS per service. Add distributed tracing with Zipkin/Jaeger. The architecture is already set up for this — the contracts between services are Feign interfaces, not direct DB calls."

---

### Closing Statement

> *"Every layer here maps to a real production concern — centralized config for operations, circuit breakers for resilience, JWT propagation for security, database isolation for independent deployability, and role-based guards for compliance. I can walk through any service end-to-end from the HTTP request to the DB write and back."*

---

## Running Tests

```bash
# All backend unit tests
cd E:\RevWorkforce\backend
mvn test

# Specific service tests
cd E:\RevWorkforce\backend\leave-service
mvn test

# Frontend unit tests
cd E:\RevWorkforce\frontend\revworkforce-ui
npm test

# Frontend lint
npm run lint
```

---

## CI/CD Pipeline

GitHub Actions (`.github/workflows/ci-cd.yml`) runs on every push:

1. **backend-build-test** — `mvn clean test` across all modules
2. **frontend-build-test** — `npm ci`, `npm run build -- --configuration production`, `npm test -- --watch=false`
3. **docker-build** (main branch only) — `docker compose build` to validate all Dockerfiles

---

*Built with Spring Boot 3.2.3 · Spring Cloud 2023.0.0 · Angular 17 · MySQL 8 · Docker*

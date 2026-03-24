# RevWorkforce — Complete Project Guide & Interview Preparation

A deep-dive reference document covering every layer of the RevWorkforce platform — architecture decisions, code walkthroughs, and 60+ interview questions with detailed answers.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Deep Dive](#2-architecture-deep-dive)
3. [Service-by-Service Breakdown](#3-service-by-service-breakdown)
4. [Security — JWT & Role-Based Access](#4-security--jwt--role-based-access)
5. [Inter-Service Communication](#5-inter-service-communication)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Database Design](#7-database-design)
8. [Docker & Deployment](#8-docker--deployment)
9. [Interview Questions & Answers](#9-interview-questions--answers)
   - [Microservices Architecture](#91-microservices-architecture)
   - [Spring Boot & Spring Cloud](#92-spring-boot--spring-cloud)
   - [Security & JWT](#93-security--jwt)
   - [Database & JPA](#94-database--jpa)
   - [Angular Frontend](#95-angular-frontend)
   - [Docker & DevOps](#96-docker--devops)
   - [System Design & Scalability](#97-system-design--scalability)
   - [Project-Specific Questions](#98-project-specific-questions)
10. [How to Demo in an Interview](#10-how-to-demo-in-an-interview)

---

## 1. Project Overview

**RevWorkforce** is a cloud-native Human Resource Management System (HRM) built to demonstrate real-world enterprise microservices architecture. It is **not** a tutorial CRUD app — every architectural choice reflects a production concern.

### What it does

| Role | Capabilities |
|------|-------------|
| **Employee** | Apply for leave, track balances, submit self-reviews, set and update goals, receive notifications |
| **Manager** | All employee features + approve/reject team leave, provide performance feedback on team reviews, view team dashboard |
| **Admin** | Full platform — employee onboarding, department management, leave policy configuration, holiday setup, announcements, HR analytics reports |

### What makes it production-grade

- **9 independent Spring Boot services** — each with its own database, security config, and tests
- **JWT propagated across services** via Feign `RequestInterceptor` — no session state anywhere
- **Resilience4j circuit breakers** — no cascade failures when a service is down
- **Centralized configuration** — Spring Cloud Config Server, one YAML per service
- **Service discovery** — Netflix Eureka, no hardcoded URLs
- **Dark-theme Angular 17 SPA** — standalone components, functional guards, HTTP interceptor
- **Docker Compose orchestration** — 10 containers, starts in dependency order

---

## 2. Architecture Deep Dive

### Request Flow (Login → Apply Leave → Manager Approves)

```
Browser (Angular)
     │
     │  POST /api/auth/login  {email, password}
     ▼
API Gateway (port 8080)
     │  Route: /api/auth/** → user-service (no auth required)
     ▼
user-service (port 8081)
     │  Validates credentials, generates JWT (HS256, 24h)
     │  Returns: { accessToken, refreshToken, userId, role, firstName, ... }
     ▼
Angular stores token in localStorage
     │  HTTP Interceptor auto-attaches: Authorization: Bearer <token>
     │
     │  POST /api/leaves/applications  {leaveTypeId, startDate, endDate, reason}
     ▼
API Gateway
     │  JwtAuthenticationFilter:
     │    - Parses JWT, validates signature + expiry
     │    - Injects X-User-Id: 3, X-User-Role: EMPLOYEE headers
     │    - Forwards to leave-service
     ▼
leave-service (port 8082)
     │  Reads X-User-Id header (trusts gateway — no JWT re-validation)
     │  Checks leave balance available
     │  Creates LeaveApplication (status=PENDING)
     │  Calls notification-service via Feign → creates notification for manager
     │  Returns 201 Created
     │
     │  (Manager logs in, sees Pending Approvals)
     │  PUT /api/leaves/applications/{id}/approve  {comment}
     ▼
leave-service
     │  Validates managerId from X-User-Id header
     │  Calls user-service via Feign to verify manager-employee relationship
     │  Updates application status → APPROVED
     │  Deducts leave balance
     │  Calls notification-service → notifies employee
     ▼
Angular (employee's next poll)
     │  GET /api/notifications/me → shows "Your leave was approved"
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Angular 17 Frontend                    │
│                   http://localhost:4200                  │
│   Dark Theme · Standalone Components · Functional Guards │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTPS /api/**  +  Bearer token
┌──────────────────────────▼──────────────────────────────┐
│                    API Gateway :8080                     │
│  ┌─────────────────────────────────────────────────────┐│
│  │ JwtAuthenticationFilter  →  injects X-User-* headers││
│  │ BlockInternalRoutesFilter → 403 for /internal/**    ││
│  │ Resilience4j CircuitBreaker → FallbackController   ││
│  └─────────────────────────────────────────────────────┘│
└───┬─────────┬──────────┬──────────┬──────────┬──────────┘
    │         │          │          │          │
┌───▼───┐ ┌──▼────┐ ┌───▼───┐ ┌───▼────┐ ┌───▼──────┐
│ user  │ │ leave │ │ perf  │ │ emp-   │ │ report   │
│ :8081 │ │ :8082 │ │ :8083 │ │ mgmt   │ │ :8085    │
│       │ │       │ │       │ │ :8084  │ │          │
│ MySQL │ │ MySQL │ │ MySQL │ │ MySQL  │ │ (Feign→) │
│ DB    │ │ DB    │ │ DB    │ │ DB     │ │          │
└───────┘ └──┬────┘ └───────┘ └────────┘ └──────────┘
             │ Feign
         ┌───▼───────┐      ┌──────────────┐
         │ notif-svc │      │ Config Server│
         │ :8086     │      │ :8888        │
         │ MySQL DB  │      │ Git/classpath│
         └───────────┘      └──────────────┘
                                           ┌──────────────┐
                                           │ Eureka :8761 │
                                           └──────────────┘
```

### Key Architecture Patterns

| Pattern | Where | Why |
|---------|-------|-----|
| **API Gateway** | `api-gateway` | Single entry point, JWT validation, routing |
| **Service Discovery** | `service-discovery` (Eureka) | Dynamic routing, no hardcoded URLs |
| **Centralized Config** | `config-server` | One place to change DB URLs, ports, secrets |
| **Circuit Breaker** | Resilience4j on gateway routes | Prevent cascade failures |
| **Database per Service** | 6 MySQL databases | Independent deployability, no shared schema |
| **JWT Stateless Auth** | `user-service` + gateway | No session storage, horizontally scalable |
| **Internal Route Blocking** | `BlockInternalRoutesFilter` | Feign-only endpoints never exposed externally |
| **Header Propagation** | `FeignClientConfig` `RequestInterceptor` | Auth context flows between services |
| **Soft Delete** | `active` flag on User, Department | Data retention, no FK constraint violations |

---

## 3. Service-by-Service Breakdown

### 3.1 service-discovery (Eureka, port 8761)

**What it does:** Acts as the service registry. Every other service registers itself on startup and sends heartbeats every 30 seconds. The gateway and Feign clients look up URLs here instead of using hardcoded addresses.

**Key config:**
```yaml
eureka:
  client:
    register-with-eureka: false   # Doesn't register itself
    fetch-registry: false
  server:
    wait-time-in-ms-when-sync-empty: 0  # No delay in dev mode
```

**Why it matters:** Without Eureka, if you move user-service to a different host, you'd have to update every service that calls it. With Eureka, services just look up `user-service` by name.

---

### 3.2 config-server (port 8888)

**What it does:** Serves centralized configuration to all other services on startup. Each service fetches its YAML from `config-repo/` before initializing beans.

**Startup dependency order:**
1. Eureka must be running first
2. Config Server registers with Eureka
3. All other services fetch config from Config Server, then register with Eureka

**Config files location:** `backend/config-server/src/main/resources/config-repo/`
- `user-service.yml` — DB URL, JWT secret, CORS origins
- `leave-service.yml` — DB URL, Feign URLs
- `api-gateway.yml` — Route definitions, circuit breaker config
- etc.

**Why it matters:** In production, you'd back this with a private Git repo. All your secrets, DB URLs, and environment-specific config are in one place, versioned, with an audit trail.

---

### 3.3 api-gateway (port 8080)

**What it does:** The single entry point. All HTTP traffic from the browser goes through here. It has three main responsibilities:

**A. JWT Validation (`JwtAuthenticationFilter`)**
```java
// Runs before every routed request
// 1. Reads Authorization header
// 2. Validates JWT signature (HS256) and expiry
// 3. Extracts userId, role, email from claims
// 4. Injects downstream headers:
exchange.getRequest().mutate()
    .header("X-User-Id", userId)
    .header("X-User-Role", role)
    .header("X-User-Email", email)
    .build();
```
Downstream services read `X-User-Id` and `X-User-Role` — they **never** re-validate the JWT. The gateway is the trust boundary.

**B. Internal Route Blocking (`BlockInternalRoutesFilter`)**
```java
// Any request to /api/internal/** from outside returns 403
// Feign calls between services also go through the gateway
// but at the network level they call each other directly (Eureka URL)
// This filter protects the gateway-exposed routes
```

**C. Circuit Breaker (Resilience4j)**
```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        slidingWindowSize: 10
        failureRateThreshold: 50
        waitDurationInOpenState: 10s
```
If user-service fails 5 out of 10 times, the circuit opens. New requests immediately go to `FallbackController` which returns a friendly 503 instead of timing out.

---

### 3.4 user-service (port 8081)

**What it does:** Authentication and user management. The only service that issues JWTs.

**Key classes:**
- `AuthController` — `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`
- `UserController` — `/api/users/**` (CRUD), `/api/profiles/me`
- `InternalUserController` — `/api/internal/users/**` (Feign-only, returns user details to other services)
- `JwtTokenProvider` — generates and validates tokens (JJWT 0.11.5)
- `DataInitializer` — seeds 8 demo users on first startup (`@Profile("dev")`)

**JWT generation:**
```java
String token = Jwts.builder()
    .setSubject(user.getId().toString())
    .claim("role", user.getRole().name())
    .claim("email", user.getEmail())
    .setIssuedAt(new Date())
    .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24h
    .signWith(getSignKey(), SignatureAlgorithm.HS256)
    .compact();
```

**Security config — public vs protected:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh").permitAll()
    .requestMatchers("/api/internal/**").hasRole("SYSTEM") // or IP-filtered
    .anyRequest().authenticated()
)
```

---

### 3.5 leave-service (port 8082)

**What it does:** The most complex business service. Manages leave applications, leave types, per-employee balances, quotas, and holidays.

**Entities:**
- `LeaveType` — Annual, Sick, Casual, etc. (configurable by admin)
- `LeaveBalance` — per employee, per leave type, per year (`totalDays`, `usedDays`, `remainingDays`)
- `LeaveApplication` — status: PENDING → APPROVED/REJECTED/CANCELLED
- `LeaveQuota` — default days per role per leave type (used for bulk initialization)
- `CompanyHoliday` — national/regional/optional/company holidays

**Apply leave flow:**
```
Employee submits → validate balance available → create PENDING application
Manager approves → deduct from balance → call notification-service (Feign)
Manager rejects → no balance change → notify employee
Employee cancels APPROVED → restore balance → notify manager
```

**Cross-service calls via Feign:**
- `UserServiceClient.getUserById(id)` — verify employee/manager relationship
- `NotificationServiceClient.createNotification(dto)` — push notification on status change

---

### 3.6 performance-service (port 8083)

**What it does:** Self-reviews, manager feedback, and personal goals.

**Entities:**
- `ReviewCycle` — quarterly/annual cycles (id, name, startDate, endDate)
- `PerformanceReview` — employeeId, reviewCycleId, selfRating, selfComments, managerRating, managerFeedback, status
- `Goal` — employeeId, title, description, targetDate, progress (0–100), status

**Review lifecycle:**
```
Employee submits self-review → status: SUBMITTED
Manager adds rating + feedback → status: REVIEWED
```

**Goal status values:** `IN_PROGRESS`, `COMPLETED`, `CANCELLED`

---

### 3.7 employee-management-service (port 8084)

**What it does:** Master data for employees — departments, designations, and announcements.

**Entities:**
- `Department` — id, name, description, active
- `Designation` — id, title, departmentId, level
- `Announcement` — id, title, content, targetRole (ALL/EMPLOYEE/MANAGER/ADMIN), active, createdAt

**Why separate from user-service?** Single Responsibility Principle. User-service owns identity (credentials, roles). Employee-management-service owns organizational structure. If you add a new department, you don't touch auth logic.

---

### 3.8 reporting-service (port 8085)

**What it does:** Aggregates data from multiple services to produce HR analytics. Has **no database of its own** — it calls other services via Feign and aggregates the responses.

**Reports available:**
- Headcount by department (calls user-service + employee-management-service)
- Leave utilization (calls leave-service)
- Performance summary — average ratings per department (calls performance-service)
- Goal completion rates (calls performance-service)

**Why a separate service?** Reports require joining data from multiple domains. Putting this logic in user-service or leave-service would violate Single Responsibility. A separate reporting service can be scaled independently and eventually replaced with a dedicated analytics DB.

---

### 3.9 notification-service (port 8086)

**What it does:** Stores and serves in-app notifications. Created by other services via Feign, consumed by the frontend via polling.

**Entity:**
```java
Notification {
    Long id;
    Long userId;
    String title;
    String message;
    NotificationType type;  // LEAVE_APPROVED, LEAVE_REJECTED, etc.
    Boolean read;
    LocalDateTime createdAt;
}
```

**Current implementation:** Other services call `POST /api/internal/notifications` via Feign. Frontend polls `GET /api/notifications/me` every 30 seconds.

**Production upgrade path:** Replace Feign calls with Kafka events. notification-service subscribes to `leave.approved`, `leave.rejected` topics and persists notifications asynchronously.

---

## 4. Security — JWT & Role-Based Access

### JWT Token Structure

```
Header:  { "alg": "HS256", "typ": "JWT" }
Payload: {
  "sub": "3",                    ← userId
  "role": "EMPLOYEE",
  "email": "emp1@revworkforce.com",
  "iat": 1711234567,
  "exp": 1711320967              ← 24 hours later
}
Signature: HMACSHA256(base64(header) + "." + base64(payload), secret)
```

### Security Layers

```
Layer 1 — Angular Route Guards
  authGuard: checks localStorage for valid token + not expired
  roleGuard: checks token role vs route's required roles
  → Unauthorized redirect to /auth/unauthorized

Layer 2 — HTTP Interceptor (auth.interceptor.ts)
  Auto-attaches: Authorization: Bearer <token>
  to every outgoing HTTP request

Layer 3 — API Gateway (JwtAuthenticationFilter)
  Validates signature, checks expiry
  403 if invalid, injects X-User-* headers if valid
  Public routes (/api/auth/**) bypass this filter

Layer 4 — Service-Level (Spring Security @PreAuthorize)
  @PreAuthorize("hasRole('ADMIN')")
  @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
  Reads from SecurityContext populated by gateway headers
```

### Refresh Token Flow

```
accessToken expires (24h) → Angular interceptor catches 401
→ Calls POST /api/auth/refresh with refreshToken (7d)
→ user-service issues new accessToken
→ Retry original request with new token
```

---

## 5. Inter-Service Communication

### OpenFeign Setup

Every service that calls another has a Feign client interface:

```java
// In leave-service
@FeignClient(name = "user-service")  // "user-service" matches Eureka app name
public interface UserServiceClient {
    @GetMapping("/api/internal/users/{id}")
    ApiResponse<UserDto> getUserById(@PathVariable Long id);
}
```

Eureka resolves `user-service` to the actual host:port at runtime. No hardcoded URLs.

### JWT Propagation Between Services

```java
// FeignClientConfig.java (in leave-service, performance-service, etc.)
@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attrs =
                (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                String authHeader = attrs.getRequest().getHeader("Authorization");
                if (authHeader != null) {
                    requestTemplate.header("Authorization", authHeader);
                }
            }
        };
    }
}
```

This means when employee applies for leave → leave-service calls user-service internally → it passes the employee's own JWT → user-service's `@PreAuthorize` sees the correct role.

### Circuit Breaker (Resilience4j)

```yaml
# In api-gateway.yml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/auth/**, /api/users/**
          filters:
            - name: CircuitBreaker
              args:
                name: userServiceCB
                fallbackUri: forward:/fallback/user-service
```

States: `CLOSED` (normal) → `OPEN` (after failure threshold) → `HALF-OPEN` (testing recovery)

---

## 6. Frontend Architecture

### Angular 17 Standalone Components

No `NgModule` anywhere. Every component is self-contained:

```typescript
@Component({
  selector: 'app-leave-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, ...],
  template: `...`,
  styles: [`...`]
})
export class LeaveApplyComponent implements OnInit { }
```

**Benefits:** Tree-shaking works at the component level. Lazy loading is simpler — just load the component file.

### Routing with Guards

```typescript
// app.routes.ts
export const routes: Routes = [
  { path: 'auth/login', loadComponent: () => import('./features/auth/login/login.component') },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'employee/dashboard', loadComponent: () => import('...'), canActivate: [roleGuard], data: { roles: ['EMPLOYEE', 'MANAGER'] } },
      { path: 'admin/employees', loadComponent: () => import('...'), canActivate: [roleGuard], data: { roles: ['ADMIN'] } },
    ]
  }
];
```

**Functional guards:**
```typescript
// auth.guard.ts
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return authService.isAuthenticated() ? true : router.createUrlTree(['/auth/login']);
};
```

### HTTP Interceptor

```typescript
// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).getToken();
  if (token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
```

Registered in `app.config.ts` via `provideHttpClient(withInterceptors([authInterceptor]))`.

### Dark Theme System

```scss
// styles.scss — CSS Custom Properties (Design Tokens)
:root {
  --bg-base: #080d1a;        // Deepest background (page)
  --bg-surface: #0e1425;     // Navigation, panels
  --bg-card: #111827;        // Cards, tables
  --bg-elevated: #1e293b;    // Hover states, elevated surfaces
  --primary: #818cf8;        // Indigo accent
  --primary-h: #6366f1;      // Hover primary
  --text-1: #f1f5f9;         // Primary text
  --text-2: #94a3b8;         // Secondary text
  --text-3: #64748b;         // Muted/hint text
  --border: rgba(255,255,255,0.07);  // Subtle borders
  --success: #34d399;        // Green
  --warning: #fbbf24;        // Amber
  --danger: #f87171;         // Red
}
```

Every component uses `var(--primary)`, `var(--bg-card)` etc. Angular Material dark theme overrides are in global `styles.scss` using `mat.define-dark-theme()`.

---

## 7. Database Design

### Six Isolated Databases

```sql
revworkforce_users_db        → user-service
revworkforce_leaves_db       → leave-service
revworkforce_performance_db  → performance-service
revworkforce_employee_mgmt_db → employee-management-service
revworkforce_reporting_db    → reporting-service (empty — Feign aggregates)
revworkforce_notifications_db → notification-service
```

### Key Table Relationships (within services)

**leave-service:**
```
leave_types (id, name, description, max_days, active)
    ↑ FK
leave_balances (id, user_id, leave_type_id, year, total_days, used_days)
    ↑ FK
leave_applications (id, user_id, leave_type_id, start_date, end_date,
                    number_of_days, status, reason, approved_by, comment)

leave_quotas (id, leave_type_id, role, year, default_days)
company_holidays (id, name, date, holiday_type, description)
```

**Note:** `user_id` in leave tables is just a Long — no foreign key constraint to `users` table in another DB. Referential integrity is enforced at the application layer via Feign calls.

### JPA Configuration

```java
@Entity
@Table(name = "leave_applications")
@Builder
@NoArgsConstructor @AllArgsConstructor
public class LeaveApplication {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;       // No @ManyToOne — different DB!

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leave_type_id")
    private LeaveType leaveType;

    @Enumerated(EnumType.STRING)
    private LeaveStatus status;  // PENDING, APPROVED, REJECTED, CANCELLED
}
```

`spring.jpa.hibernate.ddl-auto: update` — tables created automatically on first startup.

---

## 8. Docker & Deployment

### Container Architecture

```yaml
# docker-compose.yml — 10 containers
services:
  mysql:           image: mysql:8.0, port 3306, init.sql creates 6 databases
  service-discovery: depends_on: mysql, port 8761
  config-server:   depends_on: service-discovery, port 8888
  user-service:    depends_on: config-server, port 8081
  leave-service:   depends_on: config-server, port 8082
  performance-service: ...
  employee-management-service: ...
  reporting-service: ...
  notification-service: ...
  api-gateway:     depends_on: all above, port 8080
  frontend:        image: nginx:alpine, port 4200 → built Angular app
```

### Startup Dependency Order

```
mysql
  └─► service-discovery (Eureka)
        └─► config-server
              └─► [user, leave, performance, emp-mgmt, reporting, notification] services
                    └─► api-gateway
                          └─► frontend (nginx serves Angular, proxies /api to gateway)
```

`healthcheck` + `depends_on: condition: service_healthy` ensures correct ordering.

### Frontend Dockerfile

```dockerfile
# Stage 1: Build Angular
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# Stage 2: Serve with nginx
FROM nginx:alpine
COPY --from=builder /app/dist/revworkforce-ui /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

**nginx.conf key rule:**
```nginx
location /api/ {
    proxy_pass http://api-gateway:8080;  # Internal Docker network
}
location / {
    try_files $uri $uri/ /index.html;   # SPA routing
}
```

---

## 9. Interview Questions & Answers

---

### 9.1 Microservices Architecture

**Q1: What is microservices architecture and why did you choose it for this project?**

> Microservices architecture is an approach where an application is built as a collection of small, independently deployable services, each responsible for a specific business domain and owning its own data.
>
> I chose it for RevWorkforce because:
> 1. **Independent deployability** — if the leave-service needs a hotfix, I deploy only that service without touching auth or performance
> 2. **Independent scaling** — during a performance review period, performance-service can be scaled to 3 instances while leave-service stays at 1
> 3. **Technology isolation** — if I wanted to rewrite the notification-service in Node.js, I can, because the contract is just an HTTP API
> 4. **Fault isolation** — if reporting-service crashes (complex aggregation queries), it doesn't take down leave applications

---

**Q2: What are the tradeoffs of microservices vs monolith?**

> **Microservices advantages:**
> - Independent scaling, deployment, and failure isolation
> - Technology diversity per service
> - Smaller, focused codebases — easier for teams to own
>
> **Microservices disadvantages:**
> - Distributed system complexity — network latency, partial failures
> - No ACID transactions across services — need saga pattern or eventual consistency
> - Operational overhead — 10 containers to monitor vs 1 process
> - Inter-service calls add latency vs in-process method calls
>
> **When monolith is better:**
> - Early-stage startup with small team
> - Domain boundaries not yet clear
> - Simple deployment environment
>
> In RevWorkforce, the tradeoffs are justified because the domain boundaries are clean (auth, leave, performance, reporting are genuinely separate concerns), and the project demonstrates the patterns an interviewer wants to see.

---

**Q3: How do your services communicate? Why not REST everywhere?**

> Synchronous REST via OpenFeign for most inter-service calls. Feign gives me a type-safe Java interface — I write `userClient.getUserById(id)` instead of building HTTP requests manually.
>
> **Why not async messaging (Kafka/RabbitMQ)?**
> For current requirements, synchronous is simpler and sufficient. When leave-service needs a user's manager ID to validate an approval, it needs that answer now — async doesn't help.
>
> **Where async would make sense:**
> Notifications. Right now leave-service synchronously calls notification-service. If notification-service is slow, it slows down the approval response. With Kafka, leave-service publishes a `LeaveApprovedEvent` and returns immediately. notification-service consumes the event asynchronously. This is listed as a future improvement.

---

**Q4: How do you handle distributed transactions? What if leave-service updates the balance but notification-service fails?**

> This is the key challenge of microservices — no global ACID transactions.
>
> In RevWorkforce I use **application-level eventual consistency with compensating logic:**
> - Leave balance deduction and notification are separate operations
> - If notification-service fails, the balance is still deducted (correct state)
> - The notification is just best-effort — a missing "Your leave was approved" notification is an inconvenience, not a data integrity problem
>
> For data-critical scenarios (e.g., balance deduction must be atomic with status update), both happen inside the same `leave-service` transaction — same database, same JPA transaction.
>
> **Production-grade solution:** Outbox pattern — write the notification event to an `outbox` table in the same transaction as the leave approval. A separate poller picks up outbox events and publishes to Kafka. Guarantees at-least-once delivery.

---

**Q5: What is service discovery and why is it needed?**

> Service discovery solves the problem of "how does service A know where service B is?" In a containerized environment, services get dynamic IPs. If leave-service hardcodes `http://192.168.1.5:8081/api/users`, that breaks the moment user-service restarts on a different IP.
>
> **Netflix Eureka works in two parts:**
> 1. **Service registry** — every service on startup calls `POST /eureka/apps/{appName}` with its IP:port
> 2. **Client-side discovery** — Feign + Spring Cloud LoadBalancer queries Eureka for `user-service` instances and picks one (round-robin by default)
>
> In RevWorkforce, the Feign client uses `@FeignClient(name = "user-service")` — just the logical name. Eureka resolves it at runtime.

---

**Q6: What is a circuit breaker and why did you implement it?**

> A circuit breaker prevents cascade failures in distributed systems. Without it: if user-service is slow (say, taking 10s to respond), every request that depends on it holds a thread for 10s. Under load, thread pool exhausts → gateway becomes unresponsive → all services appear down.
>
> **Resilience4j circuit breaker states:**
> - **CLOSED** (normal operation) — requests flow through, failures tracked in sliding window
> - **OPEN** (after failure threshold exceeded) — requests immediately go to fallback, no calls to the failed service
> - **HALF-OPEN** (after wait duration) — a few probe requests let through; if they succeed, circuit closes again
>
> In RevWorkforce: `slidingWindowSize=10`, `failureRateThreshold=50%` — after 5 failures in 10 requests, circuit opens for 10 seconds. Requests during open state get a 503 with a friendly JSON message from `FallbackController`.

---

**Q7: What is the API Gateway pattern? What does your gateway do?**

> The API Gateway is a single entry point for all client requests. It handles cross-cutting concerns so individual services don't have to.
>
> **My gateway responsibilities:**
> 1. **JWT validation** — validates token once; downstream services trust the injected headers
> 2. **Routing** — `/api/auth/**` → user-service, `/api/leaves/**` → leave-service, etc.
> 3. **Circuit breaking** — Resilience4j per route
> 4. **Internal route blocking** — `BlockInternalRoutesFilter` returns 403 for any external call to `/api/internal/**`
> 5. **Load balancing** — Spring Cloud LoadBalancer picks from registered Eureka instances
>
> **Built on Spring Cloud Gateway (reactive)** — uses Netty + Project Reactor, non-blocking I/O. Better throughput than a servlet-based gateway under high concurrency.

---

### 9.2 Spring Boot & Spring Cloud

**Q8: What is Spring Boot and what does it give you over plain Spring?**

> Spring Boot is an opinionated wrapper around the Spring Framework that eliminates boilerplate configuration.
>
> **What it gives you:**
> - **Auto-configuration** — `@SpringBootApplication` scans your classpath and wires beans automatically. Add `spring-boot-starter-web` → Tomcat embedded server configured, DispatcherServlet registered, no web.xml needed
> - **Embedded server** — Tomcat/Netty bundled in the JAR. Deploy with `java -jar service.jar`, not by deploying a WAR to an app server
> - **Starter POMs** — `spring-boot-starter-data-jpa` brings in Hibernate, Spring Data, connection pool (HikariCP) — all compatible versions
> - **Actuator** — `/actuator/health`, `/actuator/info` for monitoring out of the box
> - **Externalized config** — `application.yml`, environment variables, Config Server — priority order handled automatically

---

**Q9: Explain Spring Cloud Config. How does it work in your project?**

> Spring Cloud Config Server serves configuration properties to client applications via HTTP.
>
> **How it works:**
> 1. Config Server starts, scans `config-repo/` folder (or a Git repo)
> 2. Finds `user-service.yml`, `leave-service.yml`, etc.
> 3. Exposes them at `GET /user-service/default`, `GET /leave-service/dev`, etc.
>
> **Client setup:**
> ```yaml
> # bootstrap.yml in user-service
> spring:
>   application:
>     name: user-service
>   config:
>     import: optional:configserver:http://config-server:8888
> ```
> On startup, user-service fetches its config from Config Server *before* creating any beans. DB URL, JWT secret, port — all come from Config Server.
>
> **Profile support:** `user-service-dev.yml` overrides `user-service.yml` when `spring.profiles.active=dev`.

---

**Q10: What is @PreAuthorize and how does it work in your project?**

> `@PreAuthorize` is a Spring Security annotation that evaluates a SpEL expression before a method executes. If the expression is false, Spring throws `AccessDeniedException` (→ 403).
>
> ```java
> @GetMapping
> @PreAuthorize("hasRole('ADMIN')")
> public ResponseEntity<Page<UserDto>> getAllUsers(...) { ... }
>
> @PutMapping("/{id}/approve")
> @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
> public ResponseEntity<?> approveLeave(...) { ... }
> ```
>
> **How it knows the role:** The API Gateway injects `X-User-Role: ADMIN` into the request headers. Each service has a `SecurityConfig` that reads this header and populates the `SecurityContext`:
> ```java
> UsernamePasswordAuthenticationToken auth =
>     new UsernamePasswordAuthenticationToken(userId, null, authorities);
> SecurityContextHolder.getContext().setAuthentication(auth);
> ```
> `@PreAuthorize` reads from `SecurityContextHolder` — it sees `ROLE_ADMIN`.

---

**Q11: What is Spring Data JPA? How do you use it?**

> Spring Data JPA is an abstraction layer over JPA/Hibernate that generates SQL queries from method names and reduces boilerplate DAO code.
>
> ```java
> public interface LeaveApplicationRepository extends JpaRepository<LeaveApplication, Long> {
>     // Spring generates: SELECT * FROM leave_applications WHERE user_id = ?
>     List<LeaveApplication> findByUserId(Long userId);
>
>     // SELECT * FROM leave_applications WHERE user_id = ? AND status = ?
>     List<LeaveApplication> findByUserIdAndStatus(Long userId, LeaveStatus status);
>
>     // Custom JPQL
>     @Query("SELECT la FROM LeaveApplication la WHERE la.status = 'PENDING' AND la.userId IN :employeeIds")
>     List<LeaveApplication> findPendingForTeam(@Param("employeeIds") List<Long> ids);
> }
> ```
>
> `JpaRepository` gives you `save()`, `findById()`, `findAll()`, `delete()`, `count()` for free. Spring generates the implementation at runtime — no SQL to write for common queries.

---

**Q12: Explain @Transactional. Where do you use it and why?**

> `@Transactional` marks a method as running within a database transaction. If any exception is thrown, the entire transaction rolls back. If it completes normally, changes are committed.
>
> ```java
> @Transactional
> public LeaveApplication approveLeave(Long applicationId, Long managerId, String comment) {
>     LeaveApplication app = repository.findById(applicationId).orElseThrow(...);
>     app.setStatus(APPROVED);
>     app.setApprovedBy(managerId);
>     app.setComment(comment);
>     repository.save(app);
>
>     // Deduct balance — same transaction
>     leaveBalanceService.deductBalance(app.getUserId(), app.getLeaveTypeId(), app.getNumberOfDays());
>
>     // This Feign call is OUTSIDE the transaction boundary
>     notificationClient.createNotification(...);
>
>     return app;
> }
> ```
>
> The save + balance deduction happen atomically. The Feign call to notification-service is network I/O — it happens after the commit, outside the transaction. If notification fails, the balance is still correctly deducted.

---

### 9.3 Security & JWT

**Q13: How does JWT authentication work? Walk me through a login.**

> 1. User sends `POST /api/auth/login` with `{email, password}`
> 2. Gateway routes to user-service (no JWT filter on this path — it's public)
> 3. user-service finds the user by email, compares BCrypt hash of provided password with stored hash
> 4. If match: generates JWT with `{sub: userId, role, email, iat, exp}` signed with HS256 and a secret key
> 5. Returns `{accessToken, refreshToken, userId, role, firstName, lastName}`
> 6. Angular stores both tokens in localStorage
> 7. On every subsequent request, the HTTP interceptor adds `Authorization: Bearer <accessToken>`
> 8. Gateway's `JwtAuthenticationFilter` parses and validates the token, injects headers
> 9. Downstream services read `X-User-Id` from headers — no DB lookup, no session

---

**Q14: What is BCrypt and why use it for passwords?**

> BCrypt is an adaptive password hashing function designed to be intentionally slow and computationally expensive, making brute-force attacks impractical.
>
> **Key properties:**
> - **Salted by default** — generates a random salt per password, so identical passwords have different hashes. Defeats rainbow table attacks.
> - **Cost factor** — a work factor (default 10 in Spring Security) controls how many iterations to run. Doubling the work factor doubles cracking time. You can increase it as hardware gets faster.
> - **One-way** — cannot be reversed. To verify, you hash the input and compare.
>
> ```java
> @Bean
> public PasswordEncoder passwordEncoder() {
>     return new BCryptPasswordEncoder(10);  // ~100ms per hash
> }
> ```
>
> **Why not MD5/SHA?** They're too fast — billions of attempts per second on GPU. BCrypt at cost 10 allows ~10 attempts/second per thread.

---

**Q15: What is the difference between access token and refresh token?**

> | | Access Token | Refresh Token |
> |--|--|--|
> | **Lifetime** | 24 hours (short) | 7 days (long) |
> | **Purpose** | Authenticate every API request | Get a new access token |
> | **Sent where** | Every request header | Only to `/api/auth/refresh` |
> | **If compromised** | Attacker has 24h max | Attacker can keep getting new access tokens |
>
> **Flow when access token expires:**
> ```
> API returns 401 Unauthorized
>   → Angular interceptor catches it
>   → Calls POST /api/auth/refresh with refreshToken
>   → user-service validates refreshToken, issues new accessToken
>   → Retry original request
> ```
>
> **Why not make access token last longer?** The shorter the lifetime, the smaller the window if a token is stolen (XSS, logging, etc.). You can't "revoke" a JWT without a token blacklist — expiry is the only defense.

---

**Q16: How do you prevent unauthorized access to admin endpoints from the frontend?**

> Two layers:
>
> **Layer 1 — Angular `roleGuard`:**
> ```typescript
> export const roleGuard: CanActivateFn = (route) => {
>   const user = inject(AuthService).getCurrentUser();
>   const requiredRoles: string[] = route.data['roles'];
>   if (requiredRoles.includes(user?.role)) return true;
>   return inject(Router).createUrlTree(['/auth/unauthorized']);
> };
> ```
> Prevents the UI from even showing admin routes to non-admins.
>
> **Layer 2 — Backend `@PreAuthorize`:**
> Even if someone bypasses the frontend guard (e.g., directly calling the API with a valid employee JWT), the `@PreAuthorize("hasRole('ADMIN')")` annotation on the controller method rejects the request with 403.
>
> Never rely solely on frontend security — the backend must enforce it independently.

---

### 9.4 Database & JPA

**Q17: Why did you use a separate database per service instead of one shared database?**

> The **Database-per-Service** pattern is fundamental to true microservices. Here's why:
>
> 1. **Independent deployability** — if leave-service and user-service share a DB, a schema migration in one can break the other. With separate DBs, each team/service owns its schema.
>
> 2. **Independent scaling** — performance-service might need a read replica for analytics queries. With a shared DB, you'd have to scale for the least-scalable service's needs.
>
> 3. **Technology choice** — if notification-service would benefit from a document DB (MongoDB), you can switch it without affecting others.
>
> 4. **Failure isolation** — if the reporting DB runs out of connections, it doesn't starve the leave or user DB.
>
> **The tradeoff:** You can't do `JOIN` across service boundaries. When leave-service needs a user's name, it calls user-service via Feign. This adds network latency and introduces eventual consistency. That's the price of the pattern.

---

**Q18: What is N+1 query problem and how did you avoid it?**

> The N+1 problem occurs when loading a list of N entities and then making 1 additional query per entity to load a related entity, resulting in N+1 total queries.
>
> **Example (bad):**
> ```java
> // 1 query to get all applications
> List<LeaveApplication> apps = repository.findByUserId(userId);
> // N queries — one per application to load the leave type
> apps.forEach(app -> System.out.println(app.getLeaveType().getName()));
> ```
>
> **How I avoid it in RevWorkforce:**
> - Use `fetch = FetchType.EAGER` only when you always need the related entity
> - Use `@EntityGraph` or JPQL `JOIN FETCH` for specific use cases
> - For cross-service data (user names in leave-service), build a `Map<Long, String>` once from a single Feign call rather than one call per record
>
> ```typescript
> // Angular: Employee Management
> // Instead of: getDesignationName(id) → HTTP call per row
> // We load all designations once, build a Map
> loadReferenceData() {
>   this.empService.getAllDesignations().subscribe(r =>
>     r.data.forEach(d => this.desigMap.set(d.id, d.title))
>   );
> }
> ```

---

**Q19: What is `ddl-auto: update` vs `ddl-auto: validate` vs `ddl-auto: create`?**

> | Value | Behavior | When to use |
> |-------|----------|-------------|
> | `create` | Drops and recreates all tables on startup | Development only — destroys all data |
> | `create-drop` | Create on startup, drop on shutdown | Integration tests |
> | `update` | Adds missing columns/tables, never drops | Development + staging |
> | `validate` | Checks schema matches entities, fails if not | Production (paired with Flyway/Liquibase) |
> | `none` | Does nothing | Production (you manage migrations) |
>
> In RevWorkforce I use `update` for development convenience — new entities or columns get created automatically. In production, you'd use `validate` with Flyway for versioned, auditable migrations.

---

### 9.5 Angular Frontend

**Q20: What are Angular standalone components and why use them?**

> Angular 17 standalone components don't belong to any `NgModule`. They declare their own dependencies in the `imports` array of `@Component`.
>
> ```typescript
> @Component({
>   selector: 'app-leave-apply',
>   standalone: true,
>   imports: [CommonModule, ReactiveFormsModule, MatCardModule],
>   template: `...`
> })
> ```
>
> **Benefits:**
> - **Simpler mental model** — each file is self-contained, no hunting for which module declares it
> - **Better tree-shaking** — bundler knows exactly which components are actually used
> - **Easier lazy loading** — `loadComponent: () => import('./leave-apply.component')` works directly
> - **No circular dependency issues** through NgModules
>
> Angular 17 made standalone the default. `NgModules` still work for backward compatibility.

---

**Q21: What is an HTTP Interceptor and what do you use it for?**

> An HTTP interceptor is a middleware that runs for every outgoing HTTP request (and/or incoming response). It's the Angular equivalent of an HTTP filter.
>
> **In RevWorkforce:**
> ```typescript
> // Automatically attaches JWT to every request
> export const authInterceptor: HttpInterceptorFn = (req, next) => {
>   const token = inject(AuthService).getToken();
>   const authReq = token
>     ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
>     : req;
>   return next(authReq);
> };
> ```
>
> **Other common uses:**
> - **Response interceptor** — catch 401 globally, trigger token refresh
> - **Loading indicator** — set a loading flag on request, unset on response
> - **Error handling** — transform error responses into user-friendly messages
> - **Request logging** — log all API calls in development

---

**Q22: What is the difference between `ReactiveFormsModule` and `FormsModule`?**

> | | Template-driven (`FormsModule`) | Reactive (`ReactiveFormsModule`) |
> |--|--|--|
> | Form logic lives in | HTML template (`ngModel`) | TypeScript component |
> | Validation | HTML attributes | `Validators` class |
> | Dynamic forms | Awkward | Native (`FormArray`) |
> | Testing | Requires DOM | Pure TypeScript unit tests |
> | Complexity | Simple forms | Complex, conditional forms |
>
> In RevWorkforce I use `ReactiveFormsModule` for the leave application form (conditional validation — end date must be after start date, number of days calculated dynamically) and `FormsModule` (`ngModel`) for simple filter inputs in the employee management page.

---

**Q23: What is lazy loading in Angular and why does it matter?**

> Lazy loading means a route's component is only downloaded when the user navigates to that route for the first time. It's not included in the initial bundle.
>
> ```typescript
> { path: 'admin/employees', loadComponent: () => import('./employee-management.component').then(m => m.EmployeeManagementComponent) }
> ```
>
> **Why it matters:**
> - Initial bundle is smaller → faster first load (critical for low-bandwidth)
> - An employee user never downloads admin components — they're never needed
> - Angular code-splits the bundle automatically per lazy-loaded component
>
> Without lazy loading: browser downloads all 20+ components upfront even for a logged-in employee who will only use 5 of them.

---

### 9.6 Docker & DevOps

**Q24: Explain Docker multi-stage builds. Why do you use them for the frontend?**

> Multi-stage builds use multiple `FROM` instructions in one Dockerfile. Each stage can copy artifacts from previous stages. The final image only contains what you explicitly copy.
>
> ```dockerfile
> # Stage 1: Build (Node 18 + all dev dependencies — ~900MB image)
> FROM node:18-alpine AS builder
> WORKDIR /app
> COPY package*.json ./
> RUN npm ci                    # Installs 1200+ packages
> COPY . .
> RUN npm run build             # Outputs 2MB of compiled JS/CSS to /app/dist
>
> # Stage 2: Serve (nginx alpine — ~25MB image)
> FROM nginx:alpine
> COPY --from=builder /app/dist/revworkforce-ui /usr/share/nginx/html
> COPY nginx.conf /etc/nginx/conf.d/default.conf
> # Node, npm, source code, node_modules — NONE of this is in the final image
> ```
>
> **Result:** Production image is ~27MB instead of ~900MB. Smaller attack surface, faster pull, less storage.

---

**Q25: What does `depends_on` in docker-compose do? Is it enough?**

> `depends_on` controls **container start order** — it starts container B after container A starts. But "started" means the process launched, not that the service is ready to accept connections.
>
> **The problem:** Eureka starts its JVM in 3 seconds, but takes 30 seconds to fully initialize. Config Server starts and immediately tries to register with Eureka — and fails.
>
> **The solution:** `depends_on` with `condition: service_healthy` + `healthcheck`:
> ```yaml
> service-discovery:
>   healthcheck:
>     test: ["CMD", "curl", "-f", "http://localhost:8761/actuator/health"]
>     interval: 10s
>     timeout: 5s
>     retries: 10
>
> config-server:
>   depends_on:
>     service-discovery:
>       condition: service_healthy  # Wait until Eureka health check passes
> ```
>
> Spring Boot services also use `spring.cloud.config.retry` to retry fetching config on startup failure.

---

**Q26: What is the difference between `docker compose down` and `docker compose down -v`?**

> `docker compose down` — stops and removes containers and networks. **Volumes are preserved.** Your MySQL data survives.
>
> `docker compose down -v` — stops containers, removes networks, AND **deletes named volumes**. MySQL data is wiped. Next `docker compose up` starts with empty databases.
>
> Use `-v` when you want a clean slate — e.g., after changing `init.sql` or `schema.sql`.

---

### 9.7 System Design & Scalability

**Q27: How would you scale RevWorkforce to handle 10,000 concurrent users?**

> Current bottlenecks and how to address them:
>
> **1. Single MySQL instance per service**
> - Add read replicas for each service DB
> - Application-level read/write splitting (write to primary, read from replica)
> - For leave balances: Redis cache with write-through (cache miss → DB, cache hit → fast)
>
> **2. Synchronous Feign calls block threads**
> - Replace notification calls with Kafka publish — fire and forget
> - leave-service publishes `LeaveApprovedEvent`, notification-service consumes it asynchronously
>
> **3. JWT validation on every request**
> - This is already O(1) — just a signature check, no DB lookup. This scales fine.
>
> **4. API Gateway single point**
> - Scale gateway to 3+ instances behind a load balancer (Nginx/AWS ALB)
> - Eureka supports multiple gateway instances
>
> **5. Config Server single point**
> - Move to Git-backed config + client-side caching (properties refreshed via `/actuator/refresh`, not re-fetched on every start)
>
> **Infrastructure:**
> - Move to Kubernetes (K8s) — horizontal pod autoscaling per service
> - MySQL → AWS RDS Aurora (auto-scaling read replicas)
> - Add Prometheus + Grafana for metrics, alerting on response time / error rate

---

**Q28: How would you implement real-time notifications instead of polling?**

> Current: Angular polls `GET /api/notifications/me` every 30 seconds.
>
> **WebSocket approach:**
> ```
> Browser ←── WebSocket connection ──► notification-service
> ```
> When leave is approved → notification-service pushes to the employee's WebSocket session immediately.
>
> **With Spring WebSocket + STOMP:**
> ```java
> // Server push to specific user
> messagingTemplate.convertAndSendToUser(userId.toString(), "/queue/notifications", notification);
> ```
> ```typescript
> // Angular
> const stompClient = new Client({ brokerURL: 'ws://localhost:8080/ws' });
> stompClient.subscribe(`/user/queue/notifications`, msg => {
>   this.notifications.push(JSON.parse(msg.body));
>   this.unreadCount++;
> });
> ```
>
> **Alternative — Server-Sent Events (SSE):**
> Simpler than WebSocket for one-way push. HTTP/2 makes it efficient. No library needed.

---

**Q29: What would you add to make this production-ready?**

> **Security:**
> - HTTPS/TLS termination at the gateway (Let's Encrypt or AWS ACM)
> - JWT secret in AWS Secrets Manager, not application config
> - Refresh token rotation (invalidate old token on use)
> - Rate limiting per user at the gateway (Redis-backed)
>
> **Observability:**
> - Distributed tracing with Zipkin or Jaeger — trace a request across 5 services with a single trace ID
> - Prometheus metrics + Grafana dashboards — error rates, response times, JVM memory
> - Centralized logging with ELK stack (Elasticsearch + Logstash + Kibana) — correlate logs by traceId
>
> **Reliability:**
> - Database connection pooling tuning (HikariCP min/max pool size)
> - Bulkhead pattern — limit concurrent calls to each downstream service
> - Retry with exponential backoff for transient Feign failures
> - Health checks and graceful shutdown (already have `/actuator/health`)
>
> **Operations:**
> - Kubernetes with HPA (Horizontal Pod Autoscaler)
> - Helm charts for deployment templating
> - CI/CD with automated staging deployment on merge to main
> - Database migrations with Flyway (versioned, auditable)

---

### 9.8 Project-Specific Questions

**Q30: Walk me through what happens when an employee applies for leave.**

> 1. Employee opens `/leave/apply` in Angular
> 2. `LeaveApplyComponent.ngOnInit()` calls `LeaveService.getLeaveTypes()` and `LeaveService.getMyBalances()` — populates the form dropdowns and shows available days
> 3. Employee fills in leave type, start date, end date, reason
> 4. Component calculates `numberOfDays` (subtracts weekends and holidays)
> 5. Form validates: start ≤ end, numberOfDays ≤ remainingDays, reason not empty
> 6. `POST /api/leaves/applications` with body `{leaveTypeId, startDate, endDate, reason}`
> 7. HTTP interceptor adds `Authorization: Bearer <token>`
> 8. API Gateway validates JWT, injects `X-User-Id: 3`, `X-User-Role: EMPLOYEE`, routes to leave-service
> 9. `LeaveController.applyLeave()` reads `X-User-Id` from header
> 10. Calls `LeaveServiceImpl.applyLeave()`:
>     - Finds employee's LeaveBalance for this type/year
>     - Validates `remainingDays >= numberOfDays`
>     - Creates `LeaveApplication` with status `PENDING`
>     - Saves to DB
>     - Calls `NotificationServiceClient.createNotification()` via Feign → notifies manager
> 11. Returns 201 Created with the application object
> 12. Angular shows a success snackbar, navigates to `/leave/list`

---

**Q31: How does the admin's employee management filter work?**

> The filter operates entirely **client-side** on pre-loaded data — no extra API calls per filter change.
>
> **Data loading:**
> ```typescript
> ngOnInit() {
>   // Load employees + reference data in parallel
>   forkJoin([
>     this.userService.getAllUsers(),
>     this.empService.getDepartments(),
>     this.empService.getAllDesignations()
>   ]).subscribe(([users, depts, desigs]) => {
>     this.allEmployees = users.data;
>     this.deptMap = new Map(depts.data.map(d => [d.id, d.name]));
>     this.desigMap = new Map(desigs.data.map(d => [d.id, d.title]));
>     this.applyFilters();
>   });
> }
> ```
>
> **Filter logic:**
> ```typescript
> applyFilters() {
>   this.filtered = this.allEmployees.filter(e => {
>     const q = this.searchQuery.toLowerCase();
>     const matchesSearch = !q || e.firstName.toLowerCase().includes(q)
>                              || e.email.toLowerCase().includes(q);
>     const matchesRole = !this.roleFilter || e.role === this.roleFilter;
>     const matchesDept = !this.deptFilter || e.departmentId === +this.deptFilter;
>     const matchesStatus = !this.statusFilter
>       || (this.statusFilter === 'active' ? e.active : !e.active);
>     return matchesSearch && matchesRole && matchesDept && matchesStatus;
>   });
> }
> ```
>
> Called on every `(input)` and `(change)` event. Instant response — no debounce needed for in-memory filtering.

---

**Q32: Why does admin not see leave sections on the dashboard?**

> Admin accounts don't have a manager or leave balance — they manage the system, not participate in leave workflows. Showing empty leave sections with "No leave applications yet" would be confusing and misleading.
>
> **Implementation:**
> ```typescript
> isAdmin = this.authService.getCurrentUser()?.role === 'ADMIN';
>
> loadData() {
>   if (!this.isAdmin) {
>     this.leaveService.getMyBalances().subscribe(...);
>     this.leaveService.getMyApplications().subscribe(...);
>   }
>   // Goals, holidays, announcements load for all roles
> }
> ```
>
> Template: `<ng-container *ngIf="!isAdmin">` wraps both leave sections.
>
> Two benefits:
> 1. No wasted API calls for data that won't be shown
> 2. Cleaner UI — admin dashboard immediately shows what's relevant

---

**Q33: How did you fix the "Employee #4" display in team reviews?**

> `PerformanceReview.employeeId` is a foreign key (a Long integer). The performance-service DB has no join to the users table — different database. So you can't query the name in SQL.
>
> **Solution:** Load the user directory once into a `Map<Long, {firstName, lastName}>`:
>
> ```typescript
> ngOnInit() {
>   if (this.isManagerOrAdmin) {
>     this.loadTeamReviews();
>     this.userService.getDirectory().subscribe({
>       next: r => (r.data || []).forEach((u: any) =>
>         this.userMap.set(u.id, { firstName: u.firstName, lastName: u.lastName })
>       )
>     });
>   }
> }
>
> getEmployeeName(id: number): string {
>   const u = this.userMap.get(id);
>   return u ? `${u.firstName} ${u.lastName}` : 'Team Member';
> }
> ```
>
> One API call for the whole directory (typically <50 users), O(1) lookup per review row. No N+1 HTTP calls.

---

**Q34: What tests did you write and what do they cover?**

> 7 test classes across 5 services:
>
> **user-service:**
> - `UserServiceImplTest` — unit tests for register (duplicate email), login (wrong password), update profile, deactivate user. Uses `@Mock UserRepository` with Mockito.
> - `AuthControllerTest` — MockMvc integration test for `/api/auth/login` endpoint — correct credentials → 200 + token, wrong password → 401.
>
> **leave-service:**
> - `LeaveServiceImplTest` — apply leave (success + insufficient balance), approve leave (status transition), cancel leave (balance restoration).
>
> **performance-service:**
> - `PerformanceServiceImplTest` — submit review, update goal progress (0–100 boundary), cancel goal.
>
> **employee-management-service:**
> - `DepartmentControllerTest` — MockMvc tests for create department, deactivate department.
>
> **notification-service:**
> - `NotificationServiceImplTest` — create notification, mark as read, mark all read, unread count.
>
> **reporting-service:**
> - `ReportControllerTest` — mocks all Feign clients, verifies aggregated dashboard response shape.
>
> **Running all tests:**
> ```bash
> cd backend && mvn test
> ```

---

**Q35: What would you do differently if starting this project today?**

> **Architecture:**
> - Start with an API-first approach — define OpenAPI specs for each service before writing code. Generate client DTOs from the spec.
> - Use Kafka from day one for notification events — the synchronous Feign call to notification-service is a smell
> - Add Flyway for database migrations — `ddl-auto: update` is fine for dev but doesn't give you rollback capability
>
> **Code:**
> - Add MapStruct for entity-to-DTO mapping — manual mapping code in services is tedious and error-prone
> - Use `@Validated` + custom constraint annotations for input validation — cleaner than in-service null checks
> - Add Spring Boot Actuator metrics with Micrometer from the start — retrofitting observability is painful
>
> **Testing:**
> - Add integration tests with `@SpringBootTest` + Testcontainers (real MySQL in Docker for tests)
> - Add contract tests between services (Spring Cloud Contract) — if leave-service changes its `/api/internal` response, catch it before deployment
>
> **Frontend:**
> - Use NgRx or a signals-based state management from the start for shared state (notifications, user profile)
> - Add E2E tests with Playwright covering the core user journeys (apply leave → approve → notification)

---

## 10. How to Demo in an Interview

### 5-Minute Demo Script

**Minute 1 — Show it's a real distributed system**
> Open http://localhost:8761 (Eureka Dashboard). Show 6 services registered as UP.
> *"Six independent Spring Boot services, all discovered dynamically. The gateway knows where each one is without any hardcoded URLs."*

**Minute 2 — Show the architecture in action**
> Open browser DevTools → Network tab. Login as admin. Show the JWT in the Authorization header on subsequent requests.
> *"JWT is validated once at the gateway. It injects X-User-Role and X-User-Id headers. Services downstream never touch the JWT."*

**Minute 3 — Demo the business flow**
> Login as employee → Apply for leave.
> Login as manager (different tab/incognito) → Go to Leave Approvals → Approve it.
> Back to employee tab → Notifications shows approval.
> *"This involves three services — leave-service, notification-service, and user-service — all communicating via Feign with JWT propagation."*

**Minute 4 — Show the code**
> Open `JwtAuthenticationFilter.java` — show header injection.
> Open `FeignClientConfig.java` — show `RequestInterceptor` for JWT propagation.
> Open `LeaveServiceImpl.approveLeave()` — show `@Transactional` + cross-service Feign call.
> *"The gateway is the security boundary. Services trust the headers it injects. Feign clients forward the token so the internal user-service call is also authorized."*

**Minute 5 — Answer "how would you scale this?"**
> *"The architecture is already designed for scale. Each service has its own DB — no shared schema to contend with. Circuit breakers prevent cascade failures. To scale leave-service to handle Black Friday leave submissions, I'd add a second instance — Eureka load balances automatically. To decouple notifications, I'd add Kafka — publish a LeaveApprovedEvent, return the response immediately, let notification-service consume at its own pace."*

---

### Key Talking Points to Memorize

| Topic | One-liner |
|-------|-----------|
| **Why microservices** | "Independent deployability and fault isolation — a reporting crash can't take down leave applications" |
| **JWT propagation** | "Gateway validates once, injects headers. Feign's RequestInterceptor forwards the token for service-to-service calls" |
| **Circuit breaker** | "After 50% failure rate, circuit opens for 10 seconds. Requests get a friendly 503 instead of a thread-exhaustion cascade" |
| **DB per service** | "No shared tables — referential integrity enforced via Feign calls, not SQL foreign keys. The price of independent deployability" |
| **Config Server** | "One YAML per service, served via HTTP. Change a connection string in one place and every instance picks it up on restart" |
| **Angular guards** | "authGuard checks token validity. roleGuard checks the role claim. Backend @PreAuthorize is the real enforcement — frontend is just UX" |
| **Soft delete** | "Users and departments have an `active` flag. Deactivating doesn't break historical leave records that reference the user ID" |
| **Notifications** | "Currently synchronous Feign — good enough, but the obvious improvement is Kafka for async, non-blocking delivery" |

---

*RevWorkforce — Built with Spring Boot 3.2.3 · Spring Cloud 2023.0.0 · Angular 17 · MySQL 8.0 · Docker*

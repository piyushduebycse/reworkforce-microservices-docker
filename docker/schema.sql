-- =============================================================================
-- RevWorkforce HRM Platform - Complete Database Schema
-- Run this AFTER init.sql (which creates the databases)
-- =============================================================================

-- =============================================================================
-- 1. revworkforce_users_db  (user-service, port 8081)
-- =============================================================================
USE revworkforce_users_db;

CREATE TABLE IF NOT EXISTS users (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    employee_id         VARCHAR(20)     NOT NULL UNIQUE,          -- e.g. EMP-001
    first_name          VARCHAR(100)    NOT NULL,
    last_name           VARCHAR(100)    NOT NULL,
    email               VARCHAR(255)    NOT NULL UNIQUE,
    password            VARCHAR(255)    NOT NULL,                 -- BCrypt hashed
    role                ENUM('EMPLOYEE','MANAGER','ADMIN') NOT NULL DEFAULT 'EMPLOYEE',
    manager_id          BIGINT,                                   -- FK → users.id (self-ref)
    department_id       BIGINT,                                   -- FK → employee_mgmt_db.departments.id
    designation_id      BIGINT,                                   -- FK → employee_mgmt_db.designations.id
    phone_number        VARCHAR(20),
    profile_picture_url VARCHAR(500),
    is_active           TINYINT(1)      NOT NULL DEFAULT 1,
    created_at          DATETIME        DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_users_email       (email),
    INDEX idx_users_employee_id (employee_id),
    INDEX idx_users_manager_id  (manager_id),
    INDEX idx_users_department  (department_id),
    INDEX idx_users_role        (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample data is seeded by DataInitializer when spring.profiles.active=dev
-- Admin: admin@revworkforce.com / Admin@123
-- Manager: manager1@revworkforce.com / Manager@123
-- Employees: emp1..emp5@revworkforce.com / Employee@123


-- =============================================================================
-- 2. revworkforce_leaves_db  (leave-service, port 8082)
-- =============================================================================
USE revworkforce_leaves_db;

CREATE TABLE IF NOT EXISTS leave_types (
    id          BIGINT          NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL UNIQUE,
    description VARCHAR(500),
    is_paid     TINYINT(1)      NOT NULL DEFAULT 1,
    is_active   TINYINT(1)      NOT NULL DEFAULT 1,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leave_balances (
    id             BIGINT  NOT NULL AUTO_INCREMENT,
    user_id        BIGINT  NOT NULL,
    leave_type_id  BIGINT  NOT NULL,
    total_days     INT     NOT NULL DEFAULT 0,
    used_days      INT     NOT NULL DEFAULT 0,
    year           INT     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_balance (user_id, leave_type_id, year),
    INDEX idx_lb_user       (user_id),
    INDEX idx_lb_leave_type (leave_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leave_applications (
    id               BIGINT      NOT NULL AUTO_INCREMENT,
    user_id          BIGINT      NOT NULL,
    manager_id       BIGINT,
    leave_type_id    BIGINT      NOT NULL,
    start_date       DATE        NOT NULL,
    end_date         DATE        NOT NULL,
    number_of_days   INT         NOT NULL DEFAULT 0,
    reason           TEXT,
    status           ENUM('PENDING','APPROVED','REJECTED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    manager_comment  VARCHAR(1000),
    applied_at       DATETIME    DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      DATETIME,
    PRIMARY KEY (id),
    INDEX idx_la_user     (user_id),
    INDEX idx_la_manager  (manager_id),
    INDEX idx_la_status   (status),
    INDEX idx_la_dates    (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS company_holidays (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    name         VARCHAR(200) NOT NULL,
    holiday_date DATE         NOT NULL UNIQUE,
    description  VARCHAR(500),
    is_recurring TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    INDEX idx_ch_date (holiday_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leave_quotas (
    id             BIGINT  NOT NULL AUTO_INCREMENT,
    leave_type_id  BIGINT  NOT NULL,
    role           ENUM('EMPLOYEE','MANAGER','ADMIN') NOT NULL,
    days_per_year  INT     NOT NULL DEFAULT 0,
    year           INT     NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_quota (leave_type_id, role, year),
    INDEX idx_lq_leave_type (leave_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed leave types
INSERT IGNORE INTO leave_types (name, description, is_paid, is_active) VALUES
    ('Annual Leave',    'Paid annual vacation leave',                  1, 1),
    ('Sick Leave',      'Medical/health related leave',                1, 1),
    ('Casual Leave',    'Short duration personal leave',               1, 1),
    ('Maternity Leave', 'Maternity leave for female employees',        1, 1),
    ('Unpaid Leave',    'Leave without pay when balance is exhausted', 0, 1);

-- Seed leave balances for all users (users 1-8) for current year
-- Leave type IDs: 1=Annual, 2=Sick, 3=Casual, 4=Maternity, 5=Unpaid
INSERT IGNORE INTO leave_balances (user_id, leave_type_id, total_days, used_days, year) VALUES
    (1,1,18,0,2026),(1,2,12,0,2026),(1,3,6,0,2026),
    (2,1,18,0,2026),(2,2,12,0,2026),(2,3,6,0,2026),
    (3,1,18,0,2026),(3,2,12,0,2026),(3,3,6,0,2026),
    (4,1,18,0,2026),(4,2,12,0,2026),(4,3,6,0,2026),
    (5,1,18,0,2026),(5,2,12,0,2026),(5,3,6,0,2026),
    (6,1,18,0,2026),(6,2,12,0,2026),(6,3,6,0,2026),
    (7,1,18,0,2026),(7,2,12,0,2026),(7,3,6,0,2026),
    (8,1,18,0,2026),(8,2,12,0,2026),(8,3,6,0,2026);

-- Seed company holidays
INSERT IGNORE INTO company_holidays (name, holiday_date, description, holiday_type, is_recurring) VALUES
    ('New Year Day',          '2025-01-01', 'New Year celebration',       'NATIONAL', 1),
    ('Republic Day',          '2025-01-26', 'National holiday',           'NATIONAL', 1),
    ('Holi',                  '2025-03-14', 'Festival of Colors',         'NATIONAL', 1),
    ('Good Friday',           '2025-04-18', 'Good Friday',                'NATIONAL', 0),
    ('Independence Day',      '2025-08-15', 'National Independence Day',  'NATIONAL', 1),
    ('Gandhi Jayanti',        '2025-10-02', 'Birthday of Mahatma Gandhi', 'NATIONAL', 1),
    ('Diwali',                '2025-10-20', 'Festival of Lights',         'NATIONAL', 1),
    ('Christmas Day',         '2025-12-25', 'Christmas celebration',      'NATIONAL', 1),
    -- 2026 holidays
    ('Holi',                  '2026-03-24', 'Festival of Colors',         'NATIONAL', 1),
    ('Good Friday',           '2026-04-03', 'Good Friday',                'NATIONAL', 0),
    ('Eid ul-Fitr',           '2026-04-01', 'Eid ul-Fitr',                'NATIONAL', 0),
    ('Dr. Ambedkar Jayanti',  '2026-04-14', 'National holiday',           'NATIONAL', 1),
    ('Ram Navami',            '2026-04-26', 'Hindu festival',             'NATIONAL', 0),
    ('Maharashtra Day',       '2026-05-01', 'Maharashtra Day',            'REGIONAL', 1),
    ('Independence Day',      '2026-08-15', 'National Independence Day',  'NATIONAL', 1),
    ('Ganesh Chaturthi',      '2026-08-27', 'Festival',                   'NATIONAL', 0),
    ('Gandhi Jayanti',        '2026-10-02', 'Birthday of Mahatma Gandhi', 'NATIONAL', 1),
    ('Dussehra',              '2026-10-20', 'Festival',                   'NATIONAL', 0),
    ('Diwali',                '2026-11-08', 'Festival of Lights',         'NATIONAL', 1),
    ('Diwali Holiday',        '2026-11-09', 'Diwali company holiday',     'COMPANY',  0),
    ('Christmas Day',         '2026-12-25', 'Christmas celebration',      'NATIONAL', 1),
    ('New Year Eve',          '2026-12-31', 'Company holiday',            'COMPANY',  0);


-- =============================================================================
-- 3. revworkforce_performance_db  (performance-service, port 8083)
-- =============================================================================
USE revworkforce_performance_db;

CREATE TABLE IF NOT EXISTS review_cycles (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    name        VARCHAR(200) NOT NULL,
    start_date  DATE,
    end_date    DATE,
    is_active   TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    INDEX idx_rc_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS performance_reviews (
    id               BIGINT  NOT NULL AUTO_INCREMENT,
    employee_id      BIGINT  NOT NULL,
    manager_id       BIGINT,
    review_cycle_id  BIGINT,
    self_rating      INT     CHECK (self_rating BETWEEN 1 AND 5),
    manager_rating   INT     CHECK (manager_rating BETWEEN 1 AND 5),
    self_comments    TEXT,
    manager_feedback TEXT,
    status           ENUM('DRAFT','SUBMITTED','REVIEWED','CLOSED') NOT NULL DEFAULT 'DRAFT',
    submitted_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at      DATETIME,
    PRIMARY KEY (id),
    INDEX idx_pr_employee (employee_id),
    INDEX idx_pr_manager  (manager_id),
    INDEX idx_pr_cycle    (review_cycle_id),
    INDEX idx_pr_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS goals (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    employee_id      BIGINT       NOT NULL,
    manager_id       BIGINT,
    title            VARCHAR(500) NOT NULL,
    description      TEXT,
    target_date      DATE,
    status           ENUM('PENDING','IN_PROGRESS','COMPLETED','CANCELLED') NOT NULL DEFAULT 'PENDING',
    progress         INT          NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
    review_cycle_id  BIGINT,
    created_at       DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_goals_employee (employee_id),
    INDEX idx_goals_status   (status),
    INDEX idx_goals_cycle    (review_cycle_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed a sample review cycle
INSERT IGNORE INTO review_cycles (id, name, start_date, end_date, is_active) VALUES
    (1, 'Q1 2025 Review Cycle', '2025-01-01', '2025-03-31', 0),
    (2, 'Q2 2025 Review Cycle', '2025-04-01', '2025-06-30', 0),
    (3, 'Q3 2025 Review Cycle', '2025-07-01', '2025-09-30', 0),
    (4, 'Q4 2025 Review Cycle', '2025-10-01', '2025-12-31', 1);


-- =============================================================================
-- 4. revworkforce_employee_mgmt_db  (employee-management-service, port 8084)
-- =============================================================================
USE revworkforce_employee_mgmt_db;

CREATE TABLE IF NOT EXISTS departments (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    name             VARCHAR(200) NOT NULL UNIQUE,
    description      VARCHAR(500),
    head_employee_id BIGINT,
    is_active        TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    INDEX idx_dept_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS designations (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    name          VARCHAR(200) NOT NULL,
    level         VARCHAR(100),
    department_id BIGINT,
    is_active     TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (id),
    INDEX idx_desig_dept   (department_id),
    INDEX idx_desig_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS announcements (
    id           BIGINT       NOT NULL AUTO_INCREMENT,
    title        VARCHAR(500) NOT NULL,
    content      TEXT,
    posted_by_id BIGINT,
    target_role  VARCHAR(50),              -- NULL = all roles
    is_active    TINYINT(1)   NOT NULL DEFAULT 1,
    created_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    expires_at   DATETIME,
    PRIMARY KEY (id),
    INDEX idx_ann_active      (is_active),
    INDEX idx_ann_target_role (target_role),
    INDEX idx_ann_expires     (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed departments
INSERT IGNORE INTO departments (name, description, is_active) VALUES
    ('Engineering',        'Software development and architecture', 1),
    ('Human Resources',    'HR, recruitment and employee welfare',  1),
    ('Finance',            'Accounts, payroll and budgeting',       1),
    ('Marketing',          'Brand, growth and communications',      1),
    ('Operations',         'Infrastructure and operations',         1);

-- Seed designations
INSERT IGNORE INTO designations (name, level, department_id) VALUES
    ('Software Engineer',        'L1', 1),
    ('Senior Software Engineer', 'L2', 1),
    ('Engineering Manager',      'L3', 1),
    ('HR Executive',             'L1', 2),
    ('HR Manager',               'L2', 2),
    ('Finance Analyst',          'L1', 3),
    ('Marketing Specialist',     'L1', 4),
    ('Operations Lead',          'L2', 5);

-- Seed welcome announcement
INSERT IGNORE INTO announcements (title, content, posted_by_id, target_role, is_active)
VALUES ('Welcome to RevWorkforce!',
        'We are excited to launch our new HRM platform. Please explore all features and reach out to HR for any queries.',
        1, NULL, 1);


-- =============================================================================
-- 5. revworkforce_reporting_db  (reporting-service, port 8085)
-- =============================================================================
USE revworkforce_reporting_db;

-- Reporting service aggregates data from other services via Feign.
-- No persistent entities are stored here — all data is fetched on-demand.
-- This DB is intentionally empty but must exist for the JPA DataSource to connect.

-- Optional: cached snapshot table for heavy dashboard queries
CREATE TABLE IF NOT EXISTS report_snapshots (
    id             BIGINT       NOT NULL AUTO_INCREMENT,
    report_type    VARCHAR(100) NOT NULL,
    generated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP,
    generated_by   BIGINT,
    snapshot_json  LONGTEXT,
    PRIMARY KEY (id),
    INDEX idx_rs_type (report_type),
    INDEX idx_rs_date (generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =============================================================================
-- 6. revworkforce_notifications_db  (notification-service, port 8086)
-- =============================================================================
USE revworkforce_notifications_db;

CREATE TABLE IF NOT EXISTS notifications (
    id                BIGINT       NOT NULL AUTO_INCREMENT,
    recipient_user_id BIGINT       NOT NULL,
    title             VARCHAR(500) NOT NULL,
    message           TEXT,
    type              ENUM(
                        'LEAVE_APPROVED',
                        'LEAVE_REJECTED',
                        'LEAVE_APPLIED',
                        'PERFORMANCE_FEEDBACK',
                        'GOAL_UPDATED',
                        'ANNOUNCEMENT',
                        'LOW_LEAVE_BALANCE',
                        'GENERAL'
                      ) NOT NULL DEFAULT 'GENERAL',
    reference_id      BIGINT,
    reference_type    VARCHAR(100),
    is_read           TINYINT(1)   NOT NULL DEFAULT 0,
    created_at        DATETIME     DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_notif_recipient (recipient_user_id),
    INDEX idx_notif_is_read   (is_read),
    INDEX idx_notif_type      (type),
    INDEX idx_notif_created   (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

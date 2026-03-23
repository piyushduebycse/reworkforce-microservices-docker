-- RevWorkforce Database Initialization
CREATE DATABASE IF NOT EXISTS revworkforce_users_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS revworkforce_leaves_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS revworkforce_performance_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS revworkforce_employee_mgmt_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS revworkforce_reporting_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS revworkforce_notifications_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges
GRANT ALL PRIVILEGES ON revworkforce_users_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON revworkforce_leaves_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON revworkforce_performance_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON revworkforce_employee_mgmt_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON revworkforce_reporting_db.* TO 'root'@'%';
GRANT ALL PRIVILEGES ON revworkforce_notifications_db.* TO 'root'@'%';
FLUSH PRIVILEGES;

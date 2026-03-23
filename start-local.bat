@echo off
setlocal
SET MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.4\bin
SET BACKEND=E:\RevWorkforce\backend
SET FRONTEND=E:\RevWorkforce\frontend\revworkforce-ui

echo === RevWorkforce Local Startup ===

:: Start MySQL if not running
echo [1/3] Checking MySQL...
"%MYSQL_BIN%\mysqladmin.exe" -u root -prevworkforce@123 ping >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting MySQL...
    start "MySQL" /B "%MYSQL_BIN%\mysqld.exe" --datadir="C:/ProgramData/MySQL/data" --port=3306
    timeout /t 8 /nobreak >nul
    echo MySQL started.
) else (
    echo MySQL already running.
)

echo [2/3] Starting backend services...

start "config-server"    cmd /k "java -jar %BACKEND%\config-server\target\config-server-1.0.0.jar"
timeout /t 12 /nobreak >nul

start "service-discovery" cmd /k "java -jar %BACKEND%\service-discovery\target\service-discovery-1.0.0.jar"
timeout /t 15 /nobreak >nul

start "api-gateway"       cmd /k "java -jar %BACKEND%\api-gateway\target\api-gateway-1.0.0.jar"
start "user-service"      cmd /k "java -jar %BACKEND%\user-service\target\user-service-1.0.0.jar"
start "leave-service"     cmd /k "java -jar %BACKEND%\leave-service\target\leave-service-1.0.0.jar"
start "performance-svc"   cmd /k "java -jar %BACKEND%\performance-service\target\performance-service-1.0.0.jar"
start "employee-mgmt"     cmd /k "java -jar %BACKEND%\employee-management-service\target\employee-management-service-1.0.0.jar"
start "reporting-svc"     cmd /k "java -jar %BACKEND%\reporting-service\target\reporting-service-1.0.0.jar"
start "notification-svc"  cmd /k "java -jar %BACKEND%\notification-service\target\notification-service-1.0.0.jar"

echo [3/3] Starting Angular frontend...
start "frontend"          cmd /k "cd /d %FRONTEND% && npm start"

echo.
echo ============================================
echo  All services starting!
echo  Wait ~90 seconds then open:
echo  http://localhost:4200
echo  Login: admin@revworkforce.com / Admin@123
echo ============================================
pause

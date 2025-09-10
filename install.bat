@echo off
echo Installing POS System...
echo.

echo Step 1: Installing root dependencies...
call npm install
if errorlevel 1 (
    echo Failed to install root dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Installing backend dependencies...
cd backend
call npm install
if errorlevel 1 (
    echo Failed to install backend dependencies
    pause
    exit /b 1
)

echo.
echo Step 3: Installing frontend dependencies...
cd ..\frontend
call npm install
if errorlevel 1 (
    echo Failed to install frontend dependencies
    pause
    exit /b 1
)

echo.
echo Step 4: Initializing database...
cd ..\backend
call npm run init-db
if errorlevel 1 (
    echo Failed to initialize database
    pause
    exit /b 1
)

cd ..
echo.
echo ========================================
echo POS System installation completed!
echo ========================================
echo.
echo To start the system:
echo   npm run dev
echo.
echo Default login credentials:
echo   Admin: admin / admin123
echo   Cashier: cashier / cashier123
echo.
echo Access the system at: http://localhost:3000
echo.
pause

@echo off
echo ========================================================
echo   WARNING: This will completely WIPE the OpenSearch database!
echo ========================================================
echo.
set /p "confirm=Are you sure you want to clear the database? (Y/N): "
if /I "%confirm%" neq "Y" (
    echo Operation cancelled.
    pause
    exit /b
)

echo.
echo Stopping services and removing database volumes...
docker-compose down -v

echo.
echo Database cleared successfully! 
echo Run .\start.bat to start fresh.
pause

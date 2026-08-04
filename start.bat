@echo off
echo Starting Log Management System...
docker-compose up -d --build
echo System is running!
echo Frontend: http://localhost:80
echo Backend API: http://localhost:8000
echo OpenSearch: http://localhost:9200
pause

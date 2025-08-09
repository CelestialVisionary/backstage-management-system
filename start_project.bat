@echo off
 echo Starting MongoDB service...
 start "MongoDB" "C:\Program Files\MongoDB\Server\8.0\bin\mongod.exe" --dbpath="C:\Program Files\MongoDB\Server\8.0\data"
 
 echo Waiting for MongoDB to start...
 timeout /t 5 /nobreak >nul
 
 echo Initializing roles...
 cd backend
 node initRoles.js
 
 echo Starting backend server...
 start "Backend Server" node server.js
 
 echo Starting frontend server...
 cd ../frontend
 start "Frontend Server" npm run dev
 
 echo Project started successfully!
 echo Backend API docs: http://localhost:5000/api-docs
 echo Frontend app: http://localhost:8000
 pause
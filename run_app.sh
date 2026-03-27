#!/bin/bash

# Kill any existing processes (optional, but good for restart)
pkill -f "uvicorn"
pkill -f "vite"

echo "🚀 Starting Intelligent Document Assistant (React + FastAPI)..."

# Start Backend
echo "Starting Backend..."
cd backend
../.venv/bin/uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Start Frontend
echo "Starting Frontend..."
cd frontend
npm run dev -- --host &
FRONTEND_PID=$!
cd ..

echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"

echo "✅ App is running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"

# Wait for processes
wait $BACKEND_PID $FRONTEND_PID

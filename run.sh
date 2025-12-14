#!/bin/bash
echo "Starting Lifelink Patient Management System..."
echo ""

# Kill any existing node processes on port 5000
kill $(lsof -t -i :5000) 2>/dev/null || true

sleep 1

# Start backend in background
echo "[1/2] Starting backend server on port 5000..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend in background
echo "[2/2] Starting frontend server on port 5173..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 4

echo ""
echo "========================================"
echo "Lifelink Patient Management is running!"
echo "========================================"
echo ""
echo "Frontend: http://localhost:5173"
echo "Backend API: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the servers."
echo ""

# Open browser (macOS)
open http://localhost:5173 2>/dev/null || xdg-open http://localhost:5173 2>/dev/null || echo "Please open http://localhost:5173 in your browser"

# Wait for interrupt
wait

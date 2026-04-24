#!/usr/bin/env bash
# NanoForge — Quick Start Script
set -e

echo "🔥 NanoForge — AI Outcome Delivery on Arc"
echo "=========================================="

# Backend
echo ""
echo "▶ Starting backend..."
cd "$(dirname "$0")/backend"
if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  source .venv/bin/activate
  pip install -e ".[dev]" -q
else
  source .venv/bin/activate
fi

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "⚠️  Created .env from .env.example — fill in contract addresses and keys"
fi

uvicorn app.main:app --reload --port 8000 &
BACKEND_PID=$!
echo "✅ Backend running at http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"

# Frontend
echo ""
echo "▶ Starting frontend..."
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
  npm install -q
fi

npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend running at http://localhost:5173"

echo ""
echo "=========================================="
echo "NanoForge is running!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:8000"
echo "  API docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop"

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM
wait

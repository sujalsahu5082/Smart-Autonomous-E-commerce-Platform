#!/bin/bash
# Smart E-Commerce dev launcher (macOS/Linux). Mirrors start.bat for Windows.
set -e
cd "$(dirname "$0")"

echo "==================================================="
echo "        Starting Smart E-Commerce Platform          "
echo "==================================================="

if [ ! -d "frontend/node_modules" ]; then
  echo "[setup] Installing frontend dependencies..."
  (cd frontend && npm install)
fi

if [ ! -d "backend/.venv" ]; then
  echo "[setup] Creating backend virtual environment..."
  (cd backend && uv sync --python 3.12)
fi

trap 'kill 0' EXIT

echo "[backend] Starting API on http://localhost:8000 ..."
(cd backend && uv run uvicorn app.main:app --reload --port 8000) &
echo "[frontend] Starting Vite on http://localhost:3000 ..."
(cd frontend && npm run dev)

wait

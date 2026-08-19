#!/bin/bash
set -e

echo "Running migrations..."
alembic upgrade head 2>/dev/null || echo "No migrations to run"

echo "Starting server..."
PORT=${PORT:-8000}
exec uvicorn app.main:app --host 0.0.0.0 --port $PORT

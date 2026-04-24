#!/bin/sh
set -e
# Railway inyecta PORT; el probe del edge y uvicorn deben coincidir.
export PORT="${PORT:-8000}"
exec python -m uvicorn app.main:app --host 0.0.0.0 --port "$PORT"

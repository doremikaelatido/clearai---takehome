# Deployment Guide

## Frontend — Vercel
1. Connect repository to Vercel.
2. Build command: `npm run build`.
3. Output directory: `dist`.
4. Set `VITE_API_BASE_URL` environment variable to backend URL.

## Backend — Render
1. Create a Web Service on Render and connect the repo.
2. Build command: `pip install -r requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
4. Set environment variables: `SECRET_KEY`, `DATABASE_URL` (use managed Postgres for production).

## Production Considerations
- Use managed databases and secret managers.
- Run tests as part of CI and validate roundtrip conversions.
- Configure autoscaling and health checks for backend.

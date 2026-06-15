# Fullstack app

## Monorepo structure
- `client/` - React + Vite frontend
- `server/` - Node.js + Express + TypeScript backend

## Quick start
### 1) Install dependencies
From repo root:
- `cd client && npm install`
- `cd server && npm install`

### 2) Configure env
Backend requires env vars used in `server/src/config/config.ts`.

### 3) Run
- Backend: `cd server && npm run dev`
- Frontend (optional for dev): `cd client && npm run dev`

## Production builds
- Frontend production assets are built with `client npm run build`
- Backend serves the built frontend from `client/dist` (see `server/src/public-middleware.ts`)

This avoids module-script MIME-type issues in production.


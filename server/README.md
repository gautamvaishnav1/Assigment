# @server (Backend)

## Tech
- Node.js + Express
- TypeScript

## Prerequisites
- Node.js
- MongoDB (env: `MONGO_URI`)
- ImageKit credentials (envs listed in `src/config/config.ts`)

## Environment variables
See `server/src/config/config.ts`.

## Scripts
From `server/`:
- `npm run dev` - start server with nodemon
- `npm run build` - compile TypeScript to `dist/`
- `npm start` - run compiled server

## Build output
- `server/dist/server.js`

## Notes
- This backend also serves the built React frontend from `client/dist` via `src/public-middleware.ts`.


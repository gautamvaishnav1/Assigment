# @client (Frontend)

## Tech
- React (TypeScript)
- Vite

## Prerequisites
- Node.js

## Scripts
From `client/`:
- `npm run dev` - start Vite dev server
- `npm run build` - typecheck + build `dist/`
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## Build output
- `client/dist/*`

## Notes
- Production build is served by the backend (`server/src/public-middleware.ts`) so module script MIME types work correctly.


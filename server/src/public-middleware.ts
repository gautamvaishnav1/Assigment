import path from 'node:path';
import express from 'express';

/**
 * Serves the built React app from ../client/dist
 * and falls back to index.html for SPA routes.
 */
export function registerPublicMiddleware(app: express.Express) {
  const distDir = path.resolve(__dirname, '../../client/dist');
  const indexHtml = path.join(distDir, 'index.html');

  app.use(express.static(distDir, { index: false }));

  // For any non-API route, return the SPA entry.
  app.get('*', (req, res, next) => {
    const url = req.originalUrl || req.url;

    // Let API routes (and their 404s) be handled by routers.
    if (url.startsWith('/api/')) return next();

    res.sendFile(indexHtml, (err) => {
      if (err) next(err);
    });
  });
}


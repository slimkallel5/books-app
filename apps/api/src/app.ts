import express from 'express';
import cors from 'cors';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import { notFoundHandler } from './middleware/validate.js';
import { rateLimit } from './middleware/rate-limit.js';
import { booksRouter } from './modules/books/books.routes.js';
import { categoriesRouter } from './modules/categories/categories.routes.js';
import { i18nRouter } from './modules/i18n/i18n.routes.js';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { listFeatured } from './modules/books/books.repo.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.corsOrigins.includes('*') ? true : env.corsOrigins,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '1mb' }));
  if (!env.isTest) app.use(pinoHttp({ quietReqLogger: true }));

  app.get('/health', (_req, res) => res.json({ status: 'ok', uptime: process.uptime() }));

  const api = express.Router();
  api.get('/featured', async (_req, res, next) => {
    try {
      res.json({ items: await listFeatured() });
    } catch (err) {
      next(err);
    }
  });
  api.use('/books', booksRouter);
  api.use('/categories', categoriesRouter);
  api.use('/i18n', i18nRouter);
  api.use('/orders', rateLimit({ windowMs: 60_000, max: 30, keyPrefix: 'orders' }), ordersRouter);
  api.use('/auth', rateLimit({ windowMs: 60_000, max: 20, keyPrefix: 'auth' }), authRouter);

  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

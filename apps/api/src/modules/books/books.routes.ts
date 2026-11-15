import { Router } from 'express';
import { bookListQuerySchema, bookUpsertSchema } from '@maktaba/shared';
import { requireAdmin, requireAuth } from '../../middleware/auth.js';
import { validate, validatedQuery } from '../../middleware/validate.js';
import { notFound } from '../../lib/errors.js';
import * as repo from './books.repo.js';

export const booksRouter = Router();

/** GET /books — search, filter by level, sort and paginate. */
booksRouter.get('/', validate(bookListQuerySchema, 'query'), async (req, res, next) => {
  try {
    const params = validatedQuery<ReturnType<typeof bookListQuerySchema.parse>>(req);
    const { items, total } = await repo.listBooks(params);
    res.json({
      items,
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / params.limit)),
    });
  } catch (err) {
    next(err);
  }
});

/** GET /books/:idOrSlug — single book with its reader pages. */
booksRouter.get('/:idOrSlug', async (req, res, next) => {
  try {
    const book = await repo.getBookBySlugOrId(req.params.idOrSlug);
    if (!book) throw notFound('Book not found');
    res.json(book);
  } catch (err) {
    next(err);
  }
});

/** Admin: create a book. */
booksRouter.post('/', requireAuth, requireAdmin, validate(bookUpsertSchema), async (req, res, next) => {
  try {
    const book = await repo.createBook(req.body);
    res.status(201).json(book);
  } catch (err) {
    next(err);
  }
});

/** Admin: update a book. */
booksRouter.put(
  '/:id',
  requireAuth,
  requireAdmin,
  validate(bookUpsertSchema),
  async (req, res, next) => {
    try {
      const book = await repo.updateBook(Number(req.params.id), req.body);
      if (!book) throw notFound('Book not found');
      res.json(book);
    } catch (err) {
      next(err);
    }
  },
);

/** Admin: delete a book. */
booksRouter.delete('/:id', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const ok = await repo.deleteBook(Number(req.params.id));
    if (!ok) throw notFound('Book not found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

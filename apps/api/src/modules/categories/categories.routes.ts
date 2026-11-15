import { Router } from 'express';
import { LOCALES, type Locale } from '@maktaba/shared';
import { query } from '../../db/pool.js';

export const categoriesRouter = Router();

/** GET /categories?locale=en — levels with localised labels. */
categoriesRouter.get('/', async (req, res, next) => {
  try {
    const requested = String(req.query.locale ?? 'en');
    const locale: Locale = (LOCALES as readonly string[]).includes(requested)
      ? (requested as Locale)
      : 'en';

    const rows = await query<{ slug: string; label: string; sort_order: number }>(
      `SELECT c.slug, coalesce(ct.label, c.slug) AS label, c.sort_order
         FROM categories c
         LEFT JOIN category_translations ct ON ct.category_id = c.id AND ct.locale = $1
        ORDER BY c.sort_order`,
      [locale],
    );
    res.json(rows.rows.map((r) => ({ slug: r.slug, label: r.label, sortOrder: r.sort_order })));
  } catch (err) {
    next(err);
  }
});

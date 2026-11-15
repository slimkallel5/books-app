import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
import { BOOKS, BOOK_PAGES, CATEGORIES, CATEGORY_TRANSLATIONS, COUPONS } from './seed-data.js';
import { pool, withTransaction } from './pool.js';
import { migrate } from './migrate.js';

export async function seed(): Promise<void> {
  await migrate();

  await withTransaction(async (client) => {
    for (const cat of CATEGORIES) {
      await client.query(
        `INSERT INTO categories (slug, sort_order) VALUES ($1, $2)
         ON CONFLICT (slug) DO UPDATE SET sort_order = EXCLUDED.sort_order`,
        [cat.slug, cat.sortOrder],
      );
    }

    for (const t of CATEGORY_TRANSLATIONS) {
      await client.query(
        `INSERT INTO category_translations (category_id, locale, label)
         SELECT id, $2, $3 FROM categories WHERE slug = $1
         ON CONFLICT (category_id, locale) DO UPDATE SET label = EXCLUDED.label`,
        [t.slug, t.locale, t.label],
      );
    }

    for (const book of BOOKS) {
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO books
           (slug, title, level, color, price_millimes, discount_pct, spine_w, spine_h,
            description, is_featured, stock)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
         ON CONFLICT (slug) DO UPDATE SET
           title = EXCLUDED.title, level = EXCLUDED.level, color = EXCLUDED.color,
           price_millimes = EXCLUDED.price_millimes, discount_pct = EXCLUDED.discount_pct,
           spine_w = EXCLUDED.spine_w, spine_h = EXCLUDED.spine_h,
           description = EXCLUDED.description, is_featured = EXCLUDED.is_featured,
           updated_at = now()
         RETURNING id`,
        [
          book.slug,
          book.title,
          book.level,
          book.color,
          book.priceMillimes,
          book.discountPct,
          book.spineW,
          book.spineH,
          book.description,
          book.isFeatured,
          100,
        ],
      );
      const bookId = rows[0]!.id;

      const pages = BOOK_PAGES.filter((p) => p.slug === book.slug);
      for (const page of pages) {
        await client.query(
          `INSERT INTO book_pages (book_id, spread_index, page_index, title, body, locale)
           VALUES ($1,$2,$3,$4,$5,'en')
           ON CONFLICT (book_id, locale, spread_index, page_index)
           DO UPDATE SET title = EXCLUDED.title, body = EXCLUDED.body`,
          [bookId, page.spreadIndex, page.pageIndex, page.title, page.body],
        );
      }
    }

    for (const c of COUPONS) {
      await client.query(
        `INSERT INTO coupons (code, pct, active) VALUES ($1,$2,$3)
         ON CONFLICT (code) DO UPDATE SET pct = EXCLUDED.pct, active = EXCLUDED.active`,
        [c.code, c.pct, c.active],
      );
    }

    const hash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1,$2,$3,'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
      [env.ADMIN_EMAIL, hash, 'Maktaba Admin'],
    );
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log(`Seeded ${BOOKS.length} books, ${CATEGORIES.length} categories and the admin user.`);
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

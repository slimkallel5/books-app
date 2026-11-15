import { pool } from './pool.js';
import { migrate } from './migrate.js';

/** Drop every application table so `db:reset` gives a clean slate. */
export async function resetSchema(): Promise<void> {
  await pool.query(`
    DROP TABLE IF EXISTS
      refresh_tokens, order_items, orders, book_pages, book_translations,
      books, category_translations, categories, coupons, users, schema_migrations
    CASCADE
  `);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  resetSchema()
    .then(migrate)
    .then(() => {
      console.log('Database reset and migrated.');
      return pool.end();
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

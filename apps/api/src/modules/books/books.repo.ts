import type { Book, BookDetail, BookListQuery, BookPage } from '@maktaba/shared';
import { applyDiscount } from '@maktaba/shared';
import { query } from '../../db/pool.js';

interface BookRow {
  id: number;
  slug: string;
  title: string;
  level: string;
  color: string;
  price_millimes: number;
  discount_pct: number;
  spine_w: number;
  spine_h: number;
  cover_url: string | null;
  description: string;
  is_featured: boolean;
  stock: number;
  created_at: Date;
  updated_at: Date;
}

interface PageRow {
  id: number;
  book_id: number;
  spread_index: number;
  page_index: number;
  title: string;
  body: string;
}

function toBook(row: BookRow): Book {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    level: row.level as Book['level'],
    color: row.color,
    priceMillimes: row.price_millimes,
    discountPct: row.discount_pct,
    finalPriceMillimes: applyDiscount(row.price_millimes, row.discount_pct),
    spineW: row.spine_w,
    spineH: row.spine_h,
    coverUrl: row.cover_url,
    description: row.description,
    isFeatured: row.is_featured,
    stock: row.stock,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function toPage(row: PageRow): BookPage {
  return {
    id: row.id,
    bookId: row.book_id,
    spreadIndex: row.spread_index,
    pageIndex: row.page_index,
    title: row.title,
    body: row.body,
  };
}

const COLUMNS = `id, slug, title, level, color, price_millimes, discount_pct, spine_w,
  spine_h, cover_url, description, is_featured, stock, created_at, updated_at`;

export interface ListResult {
  items: Book[];
  total: number;
}

export async function listBooks(params: BookListQuery): Promise<ListResult> {
  const where: string[] = [];
  const values: unknown[] = [];

  if (params.level && params.level !== 'all') {
    values.push(params.level);
    where.push(`level = $${values.length}`);
  }
  if (params.q) {
    values.push(`%${params.q.toLowerCase()}%`);
    where.push(`lower(title) LIKE $${values.length}`);
  }
  if (params.featured) {
    where.push('is_featured = true');
  }

  // Sort by the price the customer actually pays, i.e. after any discount.
  const effectivePrice = 'round(price_millimes * (100 - discount_pct) / 100.0)';
  const orderBy =
    params.sort === 'price_asc'
      ? `${effectivePrice} ASC`
      : params.sort === 'price_desc'
        ? `${effectivePrice} DESC`
        : 'id ASC';

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (params.page - 1) * params.limit;

  const countResult = await query<{ count: string }>(
    `SELECT count(*)::int AS count FROM books ${whereSql}`,
    values,
  );
  const total = Number(countResult.rows[0]?.count ?? 0);

  const rows = await query<BookRow>(
    `SELECT ${COLUMNS} FROM books ${whereSql} ORDER BY ${orderBy} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
    [...values, params.limit, offset],
  );

  return { items: rows.rows.map(toBook), total };
}

export async function getBookBySlugOrId(idOrSlug: string): Promise<BookDetail | null> {
  const numeric = /^\d+$/.test(idOrSlug);
  const rows = await query<BookRow>(
    `SELECT ${COLUMNS} FROM books WHERE ${numeric ? 'id = $1' : 'slug = $1'} LIMIT 1`,
    [numeric ? Number(idOrSlug) : idOrSlug],
  );
  const row = rows.rows[0];
  if (!row) return null;
  const pages = await query<PageRow>(
    `SELECT id, book_id, spread_index, page_index, title, body
       FROM book_pages WHERE book_id = $1 AND locale = 'en'
      ORDER BY spread_index, page_index`,
    [row.id],
  );
  return { ...toBook(row), pages: pages.rows.map(toPage) };
}

export async function getBookById(id: number): Promise<Book | null> {
  const rows = await query<BookRow>(`SELECT ${COLUMNS} FROM books WHERE id = $1`, [id]);
  return rows.rows[0] ? toBook(rows.rows[0]) : null;
}

export async function listFeatured(): Promise<Book[]> {
  // Preserve the template's hand-picked strip order: indices 10, 0, 8, 4.
  const rows = await query<BookRow>(`SELECT ${COLUMNS} FROM books WHERE is_featured = true`);
  const order = ['maths-6', 'maths-1', 'maths-5', 'maths-3'];
  return rows.rows
    .map(toBook)
    .sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));
}

export async function listBooksByIds(ids: number[]): Promise<Book[]> {
  if (ids.length === 0) return [];
  const rows = await query<BookRow>(`SELECT ${COLUMNS} FROM books WHERE id = ANY($1::int[])`, [ids]);
  return rows.rows.map(toBook);
}

export async function createBook(input: Record<string, unknown>): Promise<Book> {
  const rows = await query<BookRow>(
    `INSERT INTO books
       (slug, title, level, color, price_millimes, discount_pct, spine_w, spine_h,
        cover_url, description, is_featured, stock)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING ${COLUMNS}`,
    [
      input.slug,
      input.title,
      input.level,
      input.color,
      input.priceMillimes,
      input.discountPct,
      input.spineW,
      input.spineH,
      input.coverUrl ?? null,
      input.description,
      input.isFeatured,
      input.stock,
    ],
  );
  return toBook(rows.rows[0]!);
}

export async function updateBook(id: number, input: Record<string, unknown>): Promise<Book | null> {
  const rows = await query<BookRow>(
    `UPDATE books SET
       slug = $2, title = $3, level = $4, color = $5, price_millimes = $6,
       discount_pct = $7, spine_w = $8, spine_h = $9, cover_url = $10,
       description = $11, is_featured = $12, stock = $13, updated_at = now()
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [
      id,
      input.slug,
      input.title,
      input.level,
      input.color,
      input.priceMillimes,
      input.discountPct,
      input.spineW,
      input.spineH,
      input.coverUrl ?? null,
      input.description,
      input.isFeatured,
      input.stock,
    ],
  );
  return rows.rows[0] ? toBook(rows.rows[0]) : null;
}

export async function deleteBook(id: number): Promise<boolean> {
  const res = await query('DELETE FROM books WHERE id = $1', [id]);
  return (res.rowCount ?? 0) > 0;
}

export { toBook, toPage };

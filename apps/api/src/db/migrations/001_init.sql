-- Maktaba initial schema.
-- Money is stored as integer millimes (1 TND = 1000 millimes).

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'admin',
  locale        TEXT NOT NULL DEFAULT 'en',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categories (
  id         SERIAL PRIMARY KEY,
  slug       TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS category_translations (
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,
  label       TEXT NOT NULL,
  PRIMARY KEY (category_id, locale)
);

CREATE TABLE IF NOT EXISTS books (
  id            SERIAL PRIMARY KEY,
  slug          TEXT NOT NULL UNIQUE,
  title         TEXT NOT NULL,
  level         TEXT NOT NULL REFERENCES categories(slug),
  color         TEXT NOT NULL,
  price_millimes INTEGER NOT NULL CHECK (price_millimes >= 0),
  discount_pct  INTEGER NOT NULL DEFAULT 0 CHECK (discount_pct BETWEEN 0 AND 90),
  spine_w       INTEGER NOT NULL DEFAULT 30,
  spine_h       INTEGER NOT NULL DEFAULT 130,
  cover_url     TEXT,
  description   TEXT NOT NULL DEFAULT '',
  is_featured   BOOLEAN NOT NULL DEFAULT false,
  stock         INTEGER NOT NULL DEFAULT 100 CHECK (stock >= 0),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS books_level_idx ON books(level);
CREATE INDEX IF NOT EXISTS books_featured_idx ON books(is_featured);

CREATE TABLE IF NOT EXISTS book_translations (
  book_id     INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  locale      TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (book_id, locale)
);

CREATE TABLE IF NOT EXISTS book_pages (
  id           SERIAL PRIMARY KEY,
  book_id      INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  spread_index INTEGER NOT NULL,
  page_index   INTEGER NOT NULL,
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  locale       TEXT NOT NULL DEFAULT 'en',
  UNIQUE (book_id, locale, spread_index, page_index)
);
CREATE INDEX IF NOT EXISTS book_pages_book_idx ON book_pages(book_id, locale);

CREATE TABLE IF NOT EXISTS orders (
  id                SERIAL PRIMARY KEY,
  order_no          TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  phone             TEXT NOT NULL,
  city              TEXT NOT NULL,
  address           TEXT NOT NULL,
  locale            TEXT NOT NULL DEFAULT 'en',
  subtotal_millimes INTEGER NOT NULL,
  discount_millimes INTEGER NOT NULL DEFAULT 0,
  total_millimes    INTEGER NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS orders_order_no_idx ON orders(order_no);
CREATE INDEX IF NOT EXISTS orders_created_idx ON orders(created_at DESC);

CREATE TABLE IF NOT EXISTS order_items (
  id                 SERIAL PRIMARY KEY,
  order_id           INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  book_id            INTEGER NOT NULL REFERENCES books(id),
  title_snapshot     TEXT NOT NULL,
  color_snapshot     TEXT NOT NULL,
  qty                INTEGER NOT NULL CHECK (qty > 0),
  unit_price_millimes INTEGER NOT NULL,
  line_total_millimes INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items(order_id);

CREATE TABLE IF NOT EXISTS coupons (
  code       TEXT PRIMARY KEY,
  pct        INTEGER NOT NULL CHECK (pct BETWEEN 1 AND 90),
  active     BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens(user_id);

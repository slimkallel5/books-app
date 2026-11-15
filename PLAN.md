# Maktaba – Digital Library · End‑to‑End Build Plan

## 1. What the attached template gives us (extracted inventory)

**File:** `Maktaba – The Digital Library (1).html` — a single‑file, dependency‑free SPA (vanilla JS, ~134 lines, no build step). It is the **design source of truth** for look, feel, animation and component set.

### 1.1 Design tokens (must be reused verbatim)
- Palette (CSS vars): `--bg #f7f1e3`, `--bg2 #efe4cb`, `--ink #2b2118`, `--mut #7a6a58`, `--card #fffaf0`, `--acc #c2542d` (terracotta), `--gold #c99a3b`, `--wood #c9a26b`, `--wood2 #a97f4a`, `--line #e3d6b8`.
- Dark theme: prefers‑color‑scheme + explicit `[data-theme="dark"]` (bg `#1f1a14`, card `#2d251b`, ink `#f3e9d6`…).
- Fonts: **Fraunces** (display/headings, logo, book pages), **Inter** (UI), **Cairo** (Arabic / RTL). Google Fonts.
- Radii: pills (999px) for buttons, 18px cards, book covers 2px/10px.
- Layout: fluid `5vw` gutters, `clamp()` typography, `auto-fill minmax(210px,1fr)` grids.
- Safe‑area insets (`env(safe-area-inset-*)`) for mobile notches.

### 1.2 Components / features (the "site components")
| # | Component | Behaviour to preserve |
|---|-----------|----------------------|
| 1 | **Sticky header** | Logo `Mak<b>t</b>aba`, language `<select>` (EN/FR/AR), cart button with live count badge |
| 2 | **Hero** | Two‑column grid; radial‑gradient spotlight following the pointer (`--mx/--my`); headline with `<em>` accent |
| 3 | **3D shelf room** | CSS `perspective` + `preserve-3d`; rows of decorative book spines (`--w/--h/--c`); room tilts with pointer (`--ry/--rx`); book spines flip out on hover/focus (`translateZ(46px) rotateY(-52deg)`) |
| 4 | **Tooltip** (`#tip`) | Follows cursor over spines; shows title, level, price, "click to browse this level" |
| 5 | **Spine → catalogue animation** | FLIP‑style flying clone morphs from spine into the first grid card (`Web Animations API`) |
| 6 | **Featured section** | "Best sellers & offers": 4 cards, discount tag (−15%) with struck‑through old price |
| 7 | **Catalogue** | Search input + level filter + sort; responsive card grid; empty state |
| 8 | **Book cards** | `mini` cover (spine highlight gradient), title, level, price, Add‑to‑cart |
| 9 | **Add‑to‑cart animation** | Flying element from card/spine to the cart button + `bump` keyframe on the button |
| 10 | **Cart drawer** | Line items with qty +/−, running total, Checkout, empty state |
| 11 | **Checkout overlay** | Form (name, phone, city, address) → order summary → success screen with random order # |
| 12 | **3D page‑turn reader** | Perspective book, 4 spreads, cover/back cover, prev/next, drag/swipe, arrow keys, Esc; staggered page flip with `z-index` bookkeeping |
| 13 | **i18n** | Full EN/FR/AR dictionary; `dir=rtl` switch; `localStorage` persistence |
| 14 | **Cart persistence** | `localStorage` |
| 15 | **Motion safety** | `prefers-reduced-motion` respected by all animations |
| 16 | **Footer** | Dark inverted block, tagline, "Demo store" note |

### 1.3 Data currently hardcoded (becomes the seed dataset)
- `BOOKS`: 12 items generated as `Maths/Language` grades 1–6 with per‑grade colour, price `9 + g*1.5 + (odd?2:0) DT`, spine `w/h`, and 4 sample pages.
- Levels: `all, g1…g6`; sorts: featured / price asc / price desc.
- Currency: **DT** (Tunisian dinar), 1 decimal.

### 1.4 Gaps the template has (what the real product must add)
- No backend, no persistence beyond localStorage, no auth, no real catalogue, no admin, no real payments, only 4 placeholder pages per book, no error/loading states, no accessibility audit, not installable on mobile.

---

## 2. Target architecture

Monorepo (npm workspaces) — one repo, shared types, single command to run everything.

```
books-app/
├─ package.json                 # workspaces: apps/*, packages/*
├─ PLAN.md
├─ apps/
│  ├─ api/                      # Node + Express + TypeScript (backend)
│  │  ├─ src/
│  │  │  ├─ server.ts           # app bootstrap
│  │  │  ├─ config/env.ts
│  │  │  ├─ db/                 # schema, migrations, seed
│  │  │  ├─ modules/            # books, categories, cart?, orders, auth, content, i18n
│  │  │  │  ├─ books/{routes,controller,service,repo,schema}.ts
│  │  │  │  ├─ orders/…
│  │  │  │  └─ auth/…
│  │  │  ├─ middleware/         # validate, error, auth, rateLimit
│  │  │  └─ lib/                # jwt, password, pagination
│  │  └─ tests/                 # vitest + supertest (real DB, no mocks)
│  ├─ web/                      # React + TypeScript + Vite (responsive website)
│  └─ mobile/                   # Expo (React Native) app
├─ packages/
│  ├─ ui-tokens/                # palette, fonts, spacing, radii → CSS vars + RN theme
│  └─ shared/                   # zod schemas + TS types shared by api/web/mobile
```

**Why:** web and mobile share tokens, types and validation; the backend is the single source of truth; the web app reproduces the template 1:1 while mobile re‑imagines the same components with native primitives.

---

## 3. Frontend website (apps/web)

**Stack:** React 18 + TypeScript + Vite, React Router, TanStack Query (server state), Zustand (cart/i18n UI state), react‑hook‑form + zod, framer‑motion (for the FLIP/fly animations and page‑turn where CSS 3D is awkward in React), i18next (EN/FR/AR + RTL).

**Approach:** port the template's CSS 1:1 into a global stylesheet built from `ui-tokens` (same variable names → identical look), then rebuild each component in React with the same class names where possible so the visuals and animations are byte‑for‑byte compatible. Every animation is re‑implemented and gated behind `prefers-reduced-motion`.

**Components to build (mirrors §1.2):**
`Header`, `LangSwitch`, `CartButton`, `Hero` (pointer spotlight), `ShelfRoom` (3D room + spines + tooltip + FLIP‑to‑catalogue), `FeaturedGrid`, `Catalogue` (`SearchBar`, `LevelFilter`, `SortSelect`, `BookGrid`, `BookCard`), `CartDrawer`, `CheckoutOverlay` (+success), `BookReader` (3D page‑turn, swipe/keyboard), `Footer`, plus `Toast`, `Skeleton`, `EmptyState`, `ErrorBoundary`.

**Responsiveness:** mobile‑first; breakpoints ~480/768/1024/1280; hero collapses to 1 column, shelf room scales, grids reflow, drawer becomes full‑screen sheet on mobile; safe‑area insets; touch swipe for the reader.

**Non‑functional:** accessible (semantic landmarks, focus rings, ARIA on dialogs, keyboard nav), SEO (per‑route meta via react‑helmet), dark mode toggle persisted, code‑splitting per route, image lazy‑loading, lighthouse target ≥95.

---

## 4. Mobile app (apps/mobile)

**Stack:** Expo SDK (managed workflow) + React Native + TypeScript + Expo Router (file‑based routing) + TanStack Query + Zustand + i18next.

**Screen parity:** Home (hero + horizontal shelves), Catalogue (search/filter/sort + list), Book detail, Reader (gesture‑driven page‑turn using Reanimated + Gesture Handler), Cart, Checkout, Orders, Settings (language, theme).
**Native‑specific:** haptics on add‑to‑cart, `expo-secure-store` for tokens, pull‑to‑refresh, share sheet, push notifications (order status) — later phase.
**Shared logic:** the same API client, zod schemas, tokens and i18n dictionaries from `packages/*`. 3D CSS effects are translated to Reanimated transforms (tilt, flip, fly‑to‑cart) so it *feels* like the site without copying web‑only CSS.

---

## 5. Backend (apps/api) — designed from the template

The template implies this domain model; the API is designed around it.

**Endpoints (REST, base `/api/v1` unless noted)**

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| GET | `/health` | liveness (`{ status, uptime }`) | public |
| GET | `/featured` | "Best sellers & offers" — 4 featured books with computed discount | public |
| GET | `/books` | list; `?q&level&sort&page&limit` (search/filter/sort). Sorts on the **discounted** price. Returns `{ items, page, limit, total, totalPages }` | public |
| GET | `/books/:idOrSlug` | single book incl. its reader pages | public |
| POST | `/books` | create a book | admin |
| PUT | `/books/:id` | update a book | admin |
| DELETE | `/books/:id` | delete a book | admin |
| GET | `/categories` | levels `g1…g6` + labels per locale | public |
| GET | `/i18n/:locale` | UI strings (`en`/`fr`/`ar`) so web & mobile stay in sync | public |
| POST | `/orders` | place an order (validates stock, optional `couponCode`, computes totals in millimes) → returns order incl. `orderNo` (e.g. `MK-…`) | public |
| GET | `/orders` | order list for the admin dashboard | admin |
| GET | `/orders/:orderNo` | single order detail | admin |
| POST | `/auth/login` | admin sign‑in → `{ token, user }` | public |
| GET | `/auth/me` | current user from the bearer token | bearer |

Rate limits: `/orders` 30 req/min, `/auth` 20 req/min.

**Deferred (documented, not in first delivery):** customer accounts/`register`/`refresh`, server‑side carts (the cart is persisted client‑side in `localStorage`/AsyncStorage and posted with the order), and a dedicated `/coupons/validate` endpoint (coupons are validated inside `POST /orders`).

**Cross‑cutting:** zod request validation, central error handler with typed error codes (`{ error: { code, message, details } }`), pagination envelope, rate limiting, CORS config, request logging (pino), seed script that imports the 12 template books.

**Security:** bcrypt password hashing, JWT access tokens, role‑based access (`admin`), input validation on every write route, no secrets in repo (`.env.example` only).

---

## 6. Database

Default: **PostgreSQL** (production‑grade, matches the "real product" goal). SQLite supported as a zero‑setup dev fallback via the same ORM/query layer (Kysely or Prisma) so `DATABASE_URL` alone decides.

**Schema (initial):**
- `users(id, email, password_hash, name, role, locale, created_at)`
- `categories(id, slug /* g1..g6 */, sort_order)`
- `category_translations(category_id, locale, label)`
- `books(id, slug, title, level_slug→categories, color, price_cents, spine_w, spine_h, cover_url, description, is_featured, discount_pct, stock, created_at, updated_at)`
- `book_translations(book_id, locale, title, description)`
- `book_pages(id, book_id, spread_index, page_index, title, body, locale)`
- `carts(id, user_id?, created_at)` · `cart_items(id, cart_id, book_id, qty, unit_price_cents)`
- `orders(id, order_no, user_id?, name, phone, city, address, subtotal_cents, discount_cents, total_cents, status, created_at)`
- `order_items(id, order_id, book_id, title_snapshot, qty, unit_price_cents)`
- `coupons(code, pct, active, expires_at)`
- `i18n_messages(locale, key, value)` (or JSON files per locale)

Money stored as **integer cents** (DT has 3 decimals — use a `money` helper; template shows 1 decimal for display only). Migrations + seed script; indexes on `books.slug`, `books.level`, `orders.order_no`, unique `users.email`.

---

## 7. Milestones (execution order)

- **M0 — Scaffold & tokens** (monorepo, TS config, lint/format, `packages/ui-tokens`, `packages/shared`, CI).
- **M1 — Backend core** (DB schema + migrations + seed of the 12 books, books/categories/featured/i18n endpoints, error handling, Swagger, tests).
- **M2 — Web shell** (port template CSS 1:1; Header, Hero, Footer, routing, tokens, dark mode, i18n).
- **M3 — Web catalogue** (shelf room + tooltip + FLIP animation, featured, catalogue with search/filter/sort, book cards) wired to the API.
- **M4 — Web commerce** (cart drawer, fly‑to‑cart, checkout, success, orders — persisted server‑side).
- **M5 — Web reader** (3D page‑turn with swipe/keyboard/drag, real page content from API).
- **M6 — Mobile app** (Expo Router, home/catalogue/detail/reader/cart/checkout, shared client & tokens, haptics).
- **M7 — Auth & admin** (accounts, order history, admin catalogue management).
- **M8 — Hardening** (a11y audit, perf, responsive QA across devices, E2E with Playwright + Detox, docs, deploy configs).

Each milestone ends with: build passes, tests pass, and a manual check that the web UI still matches the template visually.

---

## 8. Verification strategy
- **API:** Vitest + Supertest against a real (test) DB — no mocks; seed → query → order round‑trip.
- **Web:** Vitest + React Testing Library for components/logic; **Playwright** E2E covering hero animation, spine→catalogue, add‑to‑cart, checkout, reader page‑turn, i18n/RTL, responsive viewports.
- **Mobile:** Jest + React Native Testing Library; Detox smoke flow.
- **Visual parity:** side‑by‑side screenshots of template vs. built site at 375/768/1440 widths + dark mode.

---

## 9. Decisions I need from you before coding

1. **Database** — PostgreSQL (recommended, needs Docker/local PG) **or** SQLite (zero‑setup, file‑based)? *I can start with SQLite and keep PG a one‑line switch.*
2. **Accounts/auth** — include customer login + order history, or keep guest checkout only for v1?
3. **Payments** — real provider later (Stripe/local gateway) or demo checkout only for now?
4. **Scope of first delivery** — full end‑to‑end (web + mobile + API) as above, or start with **API + responsive web** and do mobile in a second pass?

Reply with your choices (or just "proceed with defaults": SQLite, guest checkout v1, demo payments, full scope) and I'll start with **M0/M1**.

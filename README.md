# Maktaba – The Digital Library

A full-stack digital library: a **responsive web app**, an **Expo React Native mobile app**,
and a **Node/Express + PostgreSQL REST API**. The look, components and animations are a
faithful implementation of the provided HTML template `Maktaba – The Digital Library (1).html`.

- **Web** — React + TypeScript + Vite. Reuses the template's CSS design tokens verbatim
  (palette, fonts, radii, fluid gutters) including the 3D shelf room, spine→catalogue FLIP
  animation, hover tooltip, add-to-cart fly animation, 3D page-turn reader and cart drawer.
- **Mobile** — Expo (Expo Router) sharing the same API client, zod schemas, i18n dictionaries
  and design tokens, with Reanimated translations of the web motion.
- **API** — Express + TypeScript (ESM) over PostgreSQL, with zod validation, JWT auth for the
  admin area, rate limiting, and a seed script that imports the 12 template books.

See [`PLAN.md`](./PLAN.md) for the full extraction of the template and the end-to-end build plan.

## Repository layout

```
books-app/
├─ apps/
│  ├─ api/        Express + TS REST API, migrations, seed, Vitest tests
│  ├─ web/        React + Vite responsive web app
│  └─ mobile/     Expo React Native app (Expo Router)
├─ packages/
│  ├─ shared/     zod schemas, domain types, i18n dictionaries, money helpers
│  └─ ui-tokens/  design tokens shared by web and mobile
├─ eslint.config.mjs
└─ PLAN.md
```

## Requirements

- Node.js >= 20
- PostgreSQL 14+

## Getting started

```bash
# 1. Install all workspaces
npm install

# 2. Configure environment
cp .env.example .env          # then edit DATABASE_URL / JWT_SECRET as needed

# 3. Create the database schema and seed the 12 template books
npm run db:migrate
npm run db:seed

# 4. Run the API (http://localhost:4000)
npm run dev:api

# 5. In another terminal, run the web app (http://localhost:5173)
npm run dev:web

# Optional: run the mobile app (Expo)
npm run mobile
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string for the app database |
| `TEST_DATABASE_URL` | PostgreSQL database used by the API tests |
| `PORT` | API port (default `4000`) |
| `CORS_ORIGINS` | Comma-separated allowed origins (web + Expo dev ports) |
| `JWT_SECRET`, `JWT_ACCESS_TTL` | Admin token signing / lifetime |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Seeded admin credentials |
| `VITE_API_URL` | Base URL the web app calls (default `/api/v1`) |

## Money

All amounts are stored and transported as **integer millimes** (1 TND = 1000 millimes) to
avoid floating-point rounding. Display formatting (`formatMoney`) is shared across web and mobile.

## API surface

Base path `/api/v1` (plus `/health`).

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/health` | public | liveness |
| GET | `/featured` | public | "Best sellers & offers" |
| GET | `/books` | public | `?q&level&sort&page&limit`; sorts on discounted price |
| GET | `/books/:idOrSlug` | public | book + reader pages |
| POST | `/books` | admin | create |
| PUT | `/books/:id` | admin | update |
| DELETE | `/books/:id` | admin | delete |
| GET | `/categories` | public | levels `g1…g6` + locale labels |
| GET | `/i18n/:locale` | public | UI strings (`en`/`fr`/`ar`) |
| POST | `/orders` | public | place order; optional `couponCode` |
| GET | `/orders` | admin | order list |
| GET | `/orders/:orderNo` | admin | order detail |
| POST | `/auth/login` | public | returns `{ token, user }` |
| GET | `/auth/me` | bearer | current user |

Coupons seeded: `MAKTABA15` (15%), `WELCOME10` (10%). Admin credentials default to
`admin@maktaba.local` / `admin12345` (see `.env`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run db:migrate` / `db:seed` / `db:reset` | database lifecycle |
| `npm run dev:api` / `dev:web` / `mobile` | run each app in dev |
| `npm run build` | build shared → api → web |
| `npm run typecheck` | TypeScript across api, web, shared |
| `npm run lint` | ESLint across `apps` and `packages` |
| `npm test` | API (Vitest + Supertest) and web (Vitest + Testing Library) |
| `npm run check` | typecheck + lint + test |

## Testing

- **API** — Vitest + Supertest against a real PostgreSQL test database (`TEST_DATABASE_URL`);
  no mocks. Covers featured, book listing/filtering/sorting/pagination, book detail, orders
  (stock + coupon maths), and auth.
- **Web** — Vitest + Testing Library covering the cart store and `BookCard` interactions.

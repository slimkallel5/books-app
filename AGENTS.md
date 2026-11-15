# AGENTS.md

Repository knowledge for **Maktaba – The Digital Library** (`/workspace/project/books-app`).

## What this is
Full-stack digital library: responsive **web** (React+Vite), **Expo** mobile app, and an
Express+TypeScript REST **API** over PostgreSQL. The web UI replicates the design tokens,
components and animations of the source template `Maktaba – The Digital Library (1).html`.

## Layout
- `apps/api` — Express + TS (ESM; tsconfig `module: ESNext`, `moduleResolution: Bundler`).
  Routers: `/featured`, `/auth`, `/books`, `/categories`, `/i18n`, `/orders` under `/api/v1`
  (plus `/health`). `src/app.ts` exports `createApp()`.
- `apps/web` — React + TS + Vite. Pages: Home, Admin, AdminLogin. Components under `src/components`.
- `apps/mobile` — Expo Router app.
- `packages/shared` — zod schemas, domain types, i18n dictionaries (`MESSAGES`), `formatMoney`, constants.
- `packages/ui-tokens` — design tokens shared by web and mobile.

## Key conventions
- **Money is stored as integer millimes** (1 TND = 1000 millimes). Format with `formatMoney`.
- Book listing `sort=price_asc|price_desc` sorts on the **discounted** final price
  (`round(price_millimes * (100 - discount_pct) / 100.0)`), matching the API's `finalPriceMillimes`.
- Auth login returns `{ token, user }` (not `accessToken`). Admin-only routes require `requireAuth` + `requireAdmin`.
- Order list items expose `name` and `totalMillimes` (not `customerName`/`totalDisplay`).
- Seed: categories `g1`–`g6`; book slugs `maths-1`…`maths-6`, `language-1`…`language-6`;
  coupons `MAKTABA15` (15%), `WELCOME10` (10%); `FEATURED_INDICES = [10,0,8,4]`.
- Env loaded by `apps/api/src/config/env.ts` from the repo-root `.env` (path `../../../../.env`).
- DB helpers: `db/migrate.ts` (schema_migrations), `db/reset.ts` (`resetSchema()`), `db/seed.ts`, `db/seed-data.ts`.

## Commands
- `npm run db:migrate` / `db:seed` / `db:reset`
- `npm run dev:api` (port 4000), `npm run dev:web` (port 5173), `npm run mobile` (Expo)
- `npm run build` (shared → api → web)
- `npm run typecheck` — api uses `tsconfig.test.json` (includes `tests/`); build uses `tsconfig.json` (`rootDir: src`).
- `npm run lint` — ESLint flat config at repo root (`eslint.config.mjs`).
- `npm test` — api (Vitest+Supertest, real test DB via `TEST_DATABASE_URL`) and web (Vitest + Testing Library).
- `npm run check` — typecheck + lint + test.

## Notes
- API tests hit a real PostgreSQL database (`TEST_DATABASE_URL`, e.g. `maktaba_test`); no mocks.
- `apps/api/tests/setup.ts` seeds/uses the test DB; `vitest.config.ts` loads it.

/**
 * Domain constants shared by API, web and mobile.
 */

export const LOCALES = ['en', 'fr', 'ar'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Narrows an arbitrary value (e.g. a persisted one) to a supported locale. */
export const isLocale = (value: unknown): value is Locale =>
  typeof value === 'string' && (LOCALES as readonly string[]).includes(value);

/** Book levels. `all` is a filter-only pseudo level. */
export const LEVELS = ['g1', 'g2', 'g3', 'g4', 'g5', 'g6'] as const;
export type Level = (typeof LEVELS)[number];
export type LevelFilter = Level | 'all';

export const SORTS = ['featured', 'price_asc', 'price_desc'] as const;
export type Sort = (typeof SORTS)[number];

export const ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const USER_ROLES = ['admin'] as const;
export type UserRole = (typeof USER_ROLES)[number];

/** The six spine/cover colours used by the original template, keyed by grade. */
export const LEVEL_COLORS: Record<Level, string> = {
  g1: '#c2542d',
  g2: '#2f6f8f',
  g3: '#5b8c5a',
  g4: '#c99a3b',
  g5: '#7a4e8a',
  g6: '#b84a62',
};

/** Currency code + display symbol (Tunisian dinar, as in the template). */
export const CURRENCY = { code: 'TND', symbol: 'DT', decimals: 3, displayDecimals: 1 } as const;

export const PAGINATION = { defaultLimit: 12, maxLimit: 60 } as const;

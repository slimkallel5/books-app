import { CURRENCY } from './constants';

/**
 * Prices are stored as integers in the smallest currency unit (millimes for TND)
 * to avoid floating point drift. The template renders one decimal place, e.g. `10.5 DT`.
 */
export type Millimes = number;

const PER_UNIT = 10 ** CURRENCY.decimals;

export function toMillimes(amount: number): Millimes {
  return Math.round(amount * PER_UNIT);
}

export function fromMillimes(millimes: Millimes): number {
  return millimes / PER_UNIT;
}

/** Format a millimes amount the same way the template does: `10.5 DT`. */
export function formatMoney(millimes: Millimes, symbol = CURRENCY.symbol): string {
  return `${fromMillimes(millimes).toFixed(CURRENCY.displayDecimals)} ${symbol}`;
}

export function applyDiscount(millimes: Millimes, discountPct: number): Millimes {
  return Math.round(millimes * (1 - discountPct / 100));
}

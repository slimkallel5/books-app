/**
 * Seed data. The 12 books reproduce exactly what the original template generated:
 *   title = ("Maths " | "Language ") + grade, level = g<grade>,
 *   colour = LEVEL_COLORS[grade], price = 9 + grade*1.5 + (odd?2:0) TND,
 *   spine w = 26 + (i*7 % 5)*5, h = 120 + (i*11 % 6)*8.
 */
import { LEVEL_COLORS, toMillimes, type Level } from '@maktaba/shared';

export interface SeedBook {
  slug: string;
  title: string;
  level: Level;
  color: string;
  priceMillimes: number;
  discountPct: number;
  spineW: number;
  spineH: number;
  isFeatured: boolean;
  description: string;
}

const GRADE_LABELS: Record<number, { en: string; fr: string; ar: string }> = {
  1: { en: 'Primary grade 1', fr: 'Primaire – année 1', ar: 'الابتدائي – السنة 1' },
  2: { en: 'Primary grade 2', fr: 'Primaire – année 2', ar: 'الابتدائي – السنة 2' },
  3: { en: 'Preparatory grade 3', fr: 'Préparatoire – année 3', ar: 'الإعدادي – السنة 3' },
  4: { en: 'Preparatory grade 4', fr: 'Préparatoire – année 4', ar: 'الإعدادي – السنة 4' },
  5: { en: 'Secondary grade 5', fr: 'Secondaire – année 5', ar: 'الثانوي – السنة 5' },
  6: { en: 'Exam prep grade 6', fr: 'Examens – année 6', ar: 'تحضير الامتحانات – السنة 6' },
};

export const CATEGORIES = [
  { slug: 'g1', sortOrder: 1 },
  { slug: 'g2', sortOrder: 2 },
  { slug: 'g3', sortOrder: 3 },
  { slug: 'g4', sortOrder: 4 },
  { slug: 'g5', sortOrder: 5 },
  { slug: 'g6', sortOrder: 6 },
];

export const CATEGORY_TRANSLATIONS = CATEGORIES.flatMap((c) => {
  const grade = Number(c.slug.slice(1));
  const labels = GRADE_LABELS[grade]!;
  return (['en', 'fr', 'ar'] as const).map((locale) => ({
    slug: c.slug,
    locale,
    label: labels[locale],
  }));
});

/** Indices the template used for its featured strip: [10, 0, 8, 4], first one on offer. */
const FEATURED_INDICES = [10, 0, 8, 4];

export const BOOKS: SeedBook[] = Array.from({ length: 12 }, (_, i) => {
  const grade = (i >> 1) + 1;
  const isMaths = (i & 1) === 0;
  const title = `${isMaths ? 'Maths ' : 'Language '}${grade}`;
  const level = `g${grade}` as Level;
  const price = 9 + grade * 1.5 + (isMaths ? 0 : 2);
  const isFeatured = FEATURED_INDICES.includes(i);
  // The template discounts the 1st and 3rd featured cards (indices 10 and 8).
  const discountPct = i === 10 || i === 8 ? 15 : 0;
  return {
    slug: `${isMaths ? 'maths' : 'language'}-${grade}`,
    title,
    level,
    color: LEVEL_COLORS[level],
    priceMillimes: toMillimes(price),
    discountPct,
    spineW: 26 + ((i * 7) % 5) * 5,
    spineH: 120 + ((i * 11) % 6) * 8,
    isFeatured,
    description: `A ${isMaths ? 'mathematics' : 'language'} book for ${
      GRADE_LABELS[grade]!.en.toLowerCase()
    }, carefully structured for classroom and home study.`,
  };
});

/** Four sample spreads per book, matching the template's placeholder pages. */
export const BOOK_PAGES = BOOKS.flatMap((book) =>
  ['Chapter 1 — Getting started', 'Chapter 2 — Core ideas', 'Chapter 3 — Practice', 'Chapter 4 — Review'].map(
    (title, k) => ({
      slug: book.slug,
      spreadIndex: k,
      pageIndex: 0,
      title,
      body: `Sample content for “${book.title}”. Replace this text and the cover with your real book pages later. Page ${k + 1}.`,
    }),
  ),
);

export const COUPONS = [
  { code: 'MAKTABA15', pct: 15, active: true },
  { code: 'WELCOME10', pct: 10, active: true },
];

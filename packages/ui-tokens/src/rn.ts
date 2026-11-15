/**
 * The same palette as `tokens.css`, exposed as plain objects for React Native.
 * Keeping the two in sync is what makes the mobile app match the website.
 */
export const palette = {
  bg: '#f7f1e3',
  bg2: '#efe4cb',
  ink: '#2b2118',
  mut: '#7a6a58',
  card: '#fffaf0',
  acc: '#c2542d',
  gold: '#c99a3b',
  wood: '#c9a26b',
  wood2: '#a97f4a',
  line: '#e3d6b8',
  page: '#fbf6e8',
  pageInk: '#2b2118',
} as const;

export type Theme = Record<keyof typeof palette, string>;

export const darkPalette: Theme = {
  ...palette,
  bg: '#1f1a14',
  bg2: '#2a231a',
  ink: '#f3e9d6',
  mut: '#b5a58e',
  card: '#2d251b',
  line: '#43372a',
};

/** The six spine/cover colours, keyed by grade — identical to the web tokens. */
export const levelColors: Record<string, string> = {
  g1: '#c2542d',
  g2: '#2f6f8f',
  g3: '#5b8c5a',
  g4: '#c99a3b',
  g5: '#7a4e8a',
  g6: '#b84a62',
};

export const radius = { pill: 999, card: 18, cover: 10 } as const;
export const space = (n: number) => n * 4;

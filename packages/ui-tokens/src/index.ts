/**
 * Design tokens for React Native (Expo). Mirrors packages/ui-tokens/src/tokens.css
 * so the mobile app shares the exact palette, fonts and radii of the website.
 */

export const palette = {
  light: {
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
  },
  dark: {
    bg: '#1f1a14',
    bg2: '#2a231a',
    ink: '#f3e9d6',
    mut: '#b5a58e',
    card: '#2d251b',
    acc: '#c2542d',
    gold: '#c99a3b',
    wood: '#c9a26b',
    wood2: '#a97f4a',
    line: '#43372a',
  },
} as const;

export type ThemeName = keyof typeof palette;
export type Theme = (typeof palette)['light'];

export const fonts = {
  display: 'Fraunces',
  ui: 'Inter',
  arabic: 'Cairo',
} as const;

export const radius = { pill: 999, card: 18, book: 6 } as const;

export const spacing = (v: number) => v * 4;

export const levelColors: Record<string, string> = {
  g1: '#c2542d',
  g2: '#2f6f8f',
  g3: '#5b8c5a',
  g4: '#c99a3b',
  g5: '#7a4e8a',
  g6: '#b84a62',
};

/** Decorative spine colours used to fill the 3D shelf, from the original template. */
export const spinePalette = [
  '#d9c7a3',
  '#b9c9b5',
  '#c9b0a0',
  '#a9b8c9',
  '#d4b483',
  '#9fb0a0',
  '#c7a9b3',
];

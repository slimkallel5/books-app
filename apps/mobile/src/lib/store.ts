import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Book, Locale } from '@maktaba/shared';
import { DEFAULT_LOCALE, isLocale } from '@maktaba/shared';

export interface CartLine {
  bookId: number;
  qty: number;
  title: string;
  color: string;
  unitPriceMillimes: number;
}

interface CartState {
  lines: CartLine[];
  add: (book: Book, qty?: number) => void;
  increment: (bookId: number) => void;
  decrement: (bookId: number) => void;
  remove: (bookId: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (book, qty = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => l.bookId === book.id);
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.bookId === book.id ? { ...l, qty: l.qty + qty } : l,
              ),
            };
          }
          return {
            lines: [
              ...state.lines,
              {
                bookId: book.id,
                qty,
                title: book.title,
                color: book.color,
                unitPriceMillimes: book.finalPriceMillimes,
              },
            ],
          };
        }),
      increment: (bookId) =>
        set((s) => ({
          lines: s.lines.map((l) => (l.bookId === bookId ? { ...l, qty: l.qty + 1 } : l)),
        })),
      decrement: (bookId) =>
        set((s) => ({
          lines: s.lines
            .map((l) => (l.bookId === bookId ? { ...l, qty: l.qty - 1 } : l))
            .filter((l) => l.qty > 0),
        })),
      remove: (bookId) => set((s) => ({ lines: s.lines.filter((l) => l.bookId !== bookId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: 'maktaba-cart', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

export const cartCount = (lines: CartLine[]) => lines.reduce((sum, l) => sum + l.qty, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.qty * l.unitPriceMillimes, 0);

interface UiState {
  locale: Locale;
  theme: 'light' | 'dark' | 'system';
  setLocale: (locale: Locale) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      theme: 'system',
      setLocale: (locale) => set({ locale: isLocale(locale) ? locale : DEFAULT_LOCALE }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'maktaba-ui',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ locale: s.locale, theme: s.theme }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<UiState>;
        return {
          ...current,
          ...saved,
          locale: isLocale(saved.locale) ? saved.locale : DEFAULT_LOCALE,
        };
      },
    },
  ),
);

interface AuthState {
  token: string | null;
  user: { id: number; email: string; name: string } | null;
  setAuth: (token: string, user: { id: number; email: string; name: string }) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'maktaba-auth', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

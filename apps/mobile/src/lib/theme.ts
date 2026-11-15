import { useColorScheme } from 'react-native';
import { darkPalette, palette, type Theme } from '@maktaba/ui-tokens/rn';
import { useUi } from './store';

/** Resolves the active palette from the user preference + the system setting. */
export function useTheme(): Theme {
  const preference = useUi((s) => s.theme);
  const system = useColorScheme();
  const dark = preference === 'dark' || (preference === 'system' && system === 'dark');
  return dark ? (darkPalette as Theme) : palette;
}

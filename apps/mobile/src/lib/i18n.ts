import { useMemo } from 'react';
import {
  DEFAULT_LOCALE,
  MESSAGES,
  isLocale,
  levelLabel,
  type Locale,
  type Messages,
} from '@maktaba/shared';
import { useUi } from './store';

export interface I18n {
  locale: Locale;
  isRtl: boolean;
  t: (key: keyof Messages) => string;
  level: (level: string) => string;
}

/** Same dictionaries as the web app, so wording stays identical across platforms. */
export function useI18n(): I18n {
  const stored = useUi((s) => s.locale);
  const locale: Locale = isLocale(stored) ? stored : DEFAULT_LOCALE;

  return useMemo(
    () => ({
      locale,
      isRtl: locale === 'ar',
      t: (key) => MESSAGES[locale][key],
      level: (lvl) => levelLabel(lvl, locale),
    }),
    [locale],
  );
}

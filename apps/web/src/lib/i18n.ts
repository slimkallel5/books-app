import { useEffect } from 'react';
import { DEFAULT_LOCALE, MESSAGES, isLocale, levelLabel, type Locale, type Messages } from '@maktaba/shared';
import { useUi } from './store';

export interface I18n {
  locale: Locale;
  dir: 'ltr' | 'rtl';
  t: (key: keyof Messages) => string;
  level: (level: string) => string;
}

/**
 * Lightweight i18n bound to the persisted locale. Mirrors the template's
 * behaviour: sets `lang` and `dir` on <html> so Arabic flips to RTL.
 */
export function useI18n(): I18n {
  const stored = useUi((s) => s.locale);
  const locale: Locale = isLocale(stored) ? stored : DEFAULT_LOCALE;
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return {
    locale,
    dir,
    t: (key) => MESSAGES[locale][key],
    level: (lvl) => levelLabel(lvl, locale),
  };
}

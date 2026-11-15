import { Link } from 'react-router-dom';
import { LOCALES, type Locale } from '@maktaba/shared';
import { useI18n } from '../lib/i18n';
import { useCart, useUi, cartCount } from '../lib/store';

/** Sticky header: logo, language switch, theme toggle and the live cart button. */
export function Header({ cartButtonRef }: { cartButtonRef?: React.RefObject<HTMLButtonElement> }) {
  const { t, locale } = useI18n();
  const setLocale = useUi((s) => s.setLocale);
  const theme = useUi((s) => s.theme);
  const setTheme = useUi((s) => s.setTheme);
  const toggleCart = useUi((s) => s.toggleCart);
  const lines = useCart((s) => s.lines);
  const count = cartCount(lines);

  const cycleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark');
  };

  return (
    <header>
      <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
        Mak<b>t</b>aba
      </Link>

      <button
        className="ghost"
        onClick={cycleTheme}
        aria-label={`Theme: ${theme}`}
        title={`Theme: ${theme}`}
      >
        {theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🌗'}
      </button>

      <label className="sr-only" htmlFor="lang">
        Language
      </label>
      <select
        id="lang"
        className="ghost"
        value={locale}
        onChange={(e) => setLocale(e.target.value as Locale)}
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {l.toUpperCase()}
          </option>
        ))}
      </select>

      <button
        className="ghost"
        id="cb"
        ref={cartButtonRef}
        onClick={() => toggleCart(true)}
        aria-label={`${t('cart')} (${count})`}
      >
        🛒 {t('cart')} ({count})
      </button>
    </header>
  );
}

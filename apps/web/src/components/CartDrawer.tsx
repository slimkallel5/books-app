import { useEffect, useRef } from 'react';
import { formatMoney } from '@maktaba/shared';
import { useI18n } from '../lib/i18n';
import { useCart, useUi, cartSubtotal } from '../lib/store';

interface Props {
  onCheckout: () => void;
}

/** Slide-in cart, equivalent to the template's `#dr` drawer. */
export function CartDrawer({ onCheckout }: Props) {
  const { t } = useI18n();
  const open = useUi((s) => s.cartOpen);
  const toggleCart = useUi((s) => s.toggleCart);
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const closeRef = useRef<HTMLButtonElement>(null);
  const total = cartSubtotal(lines);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleCart(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, toggleCart]);

  return (
    <aside
      className={`dr${open ? ' on' : ''}`}
      id="dr"
      role="dialog"
      aria-modal="true"
      aria-label={t('cart')}
      aria-hidden={!open}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0 }}>{t('cart')}</h2>
        <button className="ghost" ref={closeRef} onClick={() => toggleCart(false)} aria-label={t('cl')}>
          ✕
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="empty">{t('emp')}</div>
      ) : (
        <>
          {lines.map((line) => (
            <div className="it" key={line.bookId}>
              <div className="mini" style={{ ['--c' as string]: line.color }} aria-hidden="true" />
              <div>
                <b>{line.title}</b>
                <br />
                <span className="price">{formatMoney(line.unitPriceMillimes)}</span>
              </div>
              <div className="q">
                <button onClick={() => decrement(line.bookId)} aria-label="−">
                  −
                </button>
                <span aria-live="polite">{line.qty}</span>
                <button onClick={() => increment(line.bookId)} aria-label="+">
                  +
                </button>
              </div>
            </div>
          ))}
          <h3>
            {t('tot')}: {formatMoney(total)}
          </h3>
          <button className="btn" data-co onClick={onCheckout}>
            {t('co')}
          </button>
        </>
      )}
    </aside>
  );
}

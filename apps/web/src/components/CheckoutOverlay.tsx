import { useEffect, useRef, useState } from 'react';
import { formatMoney, type Order } from '@maktaba/shared';
import { api, ApiError } from '../lib/api';
import { useI18n } from '../lib/i18n';
import { useCart, useUi, cartSubtotal } from '../lib/store';

interface Props {
  open: boolean;
  onClose: () => void;
}

/** Checkout overlay: form → order confirmation, replacing the template's demo flow. */
export function CheckoutOverlay({ open, onClose }: Props) {
  const { t, locale } = useI18n();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const toggleCart = useUi((s) => s.toggleCart);

  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '', couponCode: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<(Order & { totalDisplay: string }) | null>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  const subtotal = cartSubtotal(lines);

  useEffect(() => {
    if (!open) return;
    setError(null);
    firstFieldRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lines.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const created = await api.createOrder({
        ...form,
        couponCode: form.couponCode || undefined,
        locale,
        items: lines.map((l) => ({ bookId: l.bookId, qty: l.qty })),
      });
      setOrder(created);
      clear();
      toggleCart(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className={`ov${open ? ' on' : ''}`} id="co" role="dialog" aria-modal="true" aria-label={t('co')}>
      {order ? (
        <div className="fm">
          <h2>✓ {t('thx')} #{order.orderNo}</h2>
          <p>{t('thx2')}</p>
          <b>
            {t('tot')}: {order.totalDisplay ?? formatMoney(order.totalMillimes)}
          </b>
          <button
            className="btn"
            onClick={() => {
              setOrder(null);
              setForm({ name: '', phone: '', city: '', address: '', couponCode: '' });
              onClose();
            }}
          >
            {t('cl')}
          </button>
        </div>
      ) : (
        <form className="fm" onSubmit={submit}>
          <h2 style={{ margin: 0 }}>{t('co')}</h2>

          <input
            ref={firstFieldRef}
            required
            name="name"
            placeholder={t('nm')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            name="phone"
            type="tel"
            placeholder={t('ph')}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            required
            name="city"
            placeholder={t('ct')}
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
          <input
            required
            name="address"
            placeholder={t('ad')}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <input
            name="couponCode"
            placeholder="Coupon (optional)"
            value={form.couponCode}
            onChange={(e) => setForm({ ...form, couponCode: e.target.value.toUpperCase() })}
          />

          <small>{lines.map((l) => `${l.title} ×${l.qty}`).join(' · ')}</small>
          <b>
            {t('tot')}: {formatMoney(subtotal)}
          </b>

          {error && (
            <span className="err" role="alert">
              {error}
            </span>
          )}

          <button className="btn" type="submit" disabled={submitting || lines.length === 0}>
            {submitting ? t('loading') : t('ok')}
          </button>
          <button type="button" className="ghost" onClick={onClose}>
            {t('cl')}
          </button>
        </form>
      )}
    </div>
  );
}

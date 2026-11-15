import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { formatMoney, LEVELS, type Book } from '@maktaba/shared';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/store';
import { useI18n } from '../lib/i18n';

const emptyForm = {
  slug: '',
  title: '',
  level: 'g1',
  color: '#c2542d',
  price: 10,
  discountPct: 0,
  spineW: 30,
  spineH: 130,
  description: '',
  isFeatured: false,
  stock: 100,
};

/** Admin dashboard: manage the catalogue and review incoming orders. */
export function AdminPage() {
  const { t, level } = useI18n();
  const token = useAuth((s) => s.token);
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const queryClient = useQueryClient();

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: books } = useQuery({
    queryKey: ['books', { limit: 60, sort: 'featured' }],
    queryFn: () => api.listBooks({ limit: 60 }),
  });

  const { data: orders } = useQuery({
    queryKey: ['orders'],
    queryFn: () => api.listOrders(token!),
    enabled: !!token,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['books'] });
    void queryClient.invalidateQueries({ queryKey: ['featured'] });
  };

  const startEdit = (book: Book) => {
    setEditingId(book.id);
    setForm({
      slug: book.slug,
      title: book.title,
      level: book.level,
      color: book.color,
      price: book.priceMillimes / 1000,
      discountPct: book.discountPct,
      spineW: book.spineW,
      spineH: book.spineH,
      description: book.description,
      isFeatured: book.isFeatured,
      stock: book.stock,
    });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);
    const payload = {
      slug: form.slug,
      title: form.title,
      level: form.level,
      color: form.color,
      priceMillimes: Math.round(form.price * 1000),
      discountPct: Number(form.discountPct),
      spineW: Number(form.spineW),
      spineH: Number(form.spineH),
      description: form.description,
      isFeatured: form.isFeatured,
      stock: Number(form.stock),
    };
    try {
      if (editingId) await api.updateBook(token, editingId, payload);
      else await api.createBook(token, payload);
      setForm(emptyForm);
      setEditingId(null);
      invalidate();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('error'));
    }
  };

  const remove = async (id: number) => {
    if (!token) return;
    await api.deleteBook(token, id);
    invalidate();
  };

  return (
    <section className="cat">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0 }}>
          {t('admin')} · {user?.name}
        </h2>
        <button className="ghost" onClick={logout}>
          {t('logout')}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginTop: 24 }}>
        <form className="fm" onSubmit={submit} style={{ width: '100%' }}>
          <h3 style={{ margin: 0 }}>{editingId ? t('edit') : t('create')}</h3>
          <label>
            {t('bookTitle')}
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Slug
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              required
              pattern="[a-z0-9-]+"
            />
          </label>
          <label>
            {t('bookLevel')}
            <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {level(lvl)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t('bookPrice')} (DT)
            <input
              type="number"
              step="0.1"
              min="0"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              required
            />
          </label>
          <label>
            Discount %
            <input
              type="number"
              min="0"
              max="90"
              value={form.discountPct}
              onChange={(e) => setForm({ ...form, discountPct: Number(e.target.value) })}
            />
          </label>
          <label>
            Colour
            <input
              type="color"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </label>
          <label>
            {t('bookDescription')}
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </label>
          <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
            />
            {t('featured')}
          </label>

          {error && (
            <span className="err" role="alert">
              {error}
            </span>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn" type="submit">
              {t('save')}
            </button>
            {editingId && (
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                {t('cancel')}
              </button>
            )}
          </div>
        </form>

        <div>
          <h3>{t('catalogue')}</h3>
          <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
            {(books?.items ?? []).map((book) => (
              <div className="card" key={book.id}>
                <div className="mini" style={{ ['--c' as string]: book.color, height: 90 }}>
                  {book.title}
                </div>
                <small>{level(book.level)}</small>
                <span className="price">{formatMoney(book.finalPriceMillimes)}</span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="ghost" onClick={() => startEdit(book)}>
                    {t('edit')}
                  </button>
                  <button className="ghost" onClick={() => remove(book.id)}>
                    {t('delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ marginTop: 32 }}>{t('orders')}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'start' }}>#</th>
                <th style={{ textAlign: 'start' }}>{t('nm')}</th>
                <th style={{ textAlign: 'start' }}>{t('tot')}</th>
                <th style={{ textAlign: 'start' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {(orders?.items ?? []).map((order) => (
                <tr key={order.id} style={{ borderTop: '1px solid var(--line)' }}>
                  <td>{order.orderNo}</td>
                  <td>{order.name}</td>
                  <td>{formatMoney(order.totalMillimes)}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

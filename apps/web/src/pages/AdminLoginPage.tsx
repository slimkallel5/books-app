import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAuth } from '../lib/store';
import { useI18n } from '../lib/i18n';

export function AdminLoginPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const setAuth = useAuth((s) => s.setAuth);
  const [email, setEmail] = useState('admin@maktaba.local');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setAuth(res.token, res.user);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('error'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="cat" style={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
      <form className="fm" onSubmit={submit}>
        <h2 style={{ margin: 0 }}>{t('login')}</h2>
        <label htmlFor="email">{t('email')}</label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">{t('password')}</label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <span className="err" role="alert">
            {error}
          </span>
        )}
        <button className="btn" type="submit" disabled={busy}>
          {busy ? t('loading') : t('login')}
        </button>
      </form>
    </section>
  );
}

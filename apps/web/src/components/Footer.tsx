import { useI18n } from '../lib/i18n';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer>
      <div>
        <div className="logo" style={{ color: 'inherit' }}>
          Maktaba
        </div>
        <small>{t('ft')}</small>
      </div>
      <small>Maktaba · Digital library</small>
    </footer>
  );
}

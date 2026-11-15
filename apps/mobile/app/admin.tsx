import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { formatMoney } from '@maktaba/shared';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { Button } from '../src/components/Button';
import { api } from '../src/lib/api';
import { useI18n } from '../src/lib/i18n';
import { useTheme } from '../src/lib/theme';
import { useAuth } from '../src/lib/store';
import { useBooks } from '../src/lib/hooks';

/**
 * Admin area: sign in, then manage the catalogue and review orders.
 * Mirrors the web admin page (same API, same protection).
 */
export default function AdminScreen() {
  const theme = useTheme();
  const { t } = useI18n();
  const token = useAuth((s) => s.token);
  const setAuth = useAuth((s) => s.setAuth);
  const logout = useAuth((s) => s.logout);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Awaited<ReturnType<typeof api.listOrders>>['items']>([]);

  const { data: books } = useBooks({ limit: 60 });

  const signIn = async () => {
    setBusy(true);
    try {
      const res = await api.login(email, password);
      setAuth(res.token, res.user);
      const list = await api.listOrders(res.token);
      setOrders(list.items);
    } catch (err) {
      Alert.alert(t('error'), err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <ScrollView
        style={{ backgroundColor: theme.bg }}
        contentContainerStyle={{ padding: space(5), gap: space(3) }}
      >
        <Text style={[styles.h, { color: theme.ink }]}>{t('login')}</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('email')}
          placeholderTextColor={theme.mut}
          autoCapitalize="none"
          style={[styles.input, { backgroundColor: theme.card, borderColor: theme.line, color: theme.ink }]}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder={t('password')}
          placeholderTextColor={theme.mut}
          secureTextEntry
          style={[styles.input, { backgroundColor: theme.card, borderColor: theme.line, color: theme.ink }]}
        />
        <Button label={busy ? '…' : t('login')} onPress={signIn} disabled={busy} />
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: space(5), gap: space(3) }}
    >
      <View style={styles.headerRow}>
        <Text style={[styles.h, { color: theme.ink }]}>
          {t('admin')} · Maktaba
        </Text>
        <Button label={t('logout')} variant="ghost" onPress={logout} />
      </View>

      <Text style={[styles.h2, { color: theme.ink }]}>{t('catalogue')}</Text>
      {(books?.items ?? []).map((b) => (
        <View key={b.id} style={[styles.row, { borderColor: theme.line, backgroundColor: theme.card }]}>
          <View style={[styles.dot, { backgroundColor: b.color }]} />
          <Text style={{ color: theme.ink, flex: 1 }}>{b.title}</Text>
          <Text style={{ color: theme.mut }}>{formatMoney(b.finalPriceMillimes)}</Text>
        </View>
      ))}

      <Text style={[styles.h2, { color: theme.ink }]}>{t('orders')}</Text>
      {orders.length === 0 ? (
        <Text style={{ color: theme.mut }}>—</Text>
      ) : (
        orders.map((o) => (
          <View key={o.id} style={[styles.row, { borderColor: theme.line, backgroundColor: theme.card }]}>
            <Text style={{ color: theme.ink, flex: 1 }}>{o.orderNo}</Text>
            <Text style={{ color: theme.mut }}>
              {o.name} · {formatMoney(o.totalMillimes)} · {o.status}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h: { fontSize: 22, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '700', marginTop: space(2) },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: radius.cover,
    paddingHorizontal: space(3),
    paddingVertical: space(2),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space(3),
  },
  dot: { width: 20, height: 28, borderRadius: 4 },
});

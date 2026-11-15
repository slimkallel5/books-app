import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatMoney } from '@maktaba/shared';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { Button } from '../src/components/Button';
import { api } from '../src/lib/api';
import { useI18n } from '../src/lib/i18n';
import { useTheme } from '../src/lib/theme';
import { cartSubtotal, useCart } from '../src/lib/store';

export default function CheckoutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t, locale } = useI18n();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [coupon, setCoupon] = useState('');
  const [busy, setBusy] = useState(false);

  const subtotal = cartSubtotal(lines);

  const submit = async () => {
    if (!name || !phone || !city || !address) {
      Alert.alert(t('error'), t('co'));
      return;
    }
    setBusy(true);
    try {
      const order = await api.createOrder({
        name,
        phone,
        city,
        address,
        locale,
        couponCode: coupon || undefined,
        items: lines.map((l) => ({ bookId: l.bookId, qty: l.qty })),
      });
      clear();
      Alert.alert(t('thx'), `${order.orderNo}\n${order.totalDisplay}`, [
        { text: t('ok'), onPress: () => router.replace('/') },
      ]);
    } catch (err) {
      Alert.alert(t('error'), err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    keyboardType: 'default' | 'phone-pad' = 'default',
  ) => (
    <View style={{ gap: space(1) }}>
      <Text style={{ color: theme.mut }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.line, color: theme.ink }]}
      />
    </View>
  );

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: space(4), gap: space(3) }}
    >
      {field(t('nm'), name, setName)}
      {field(t('ph'), phone, setPhone, 'phone-pad')}
      {field(t('ct'), city, setCity)}
      {field(t('ad'), address, setAddress)}
      {field(t('coupon'), coupon, setCoupon)}

      <View style={[styles.summary, { backgroundColor: theme.card, borderColor: theme.line }]}>
        <Text style={{ color: theme.ink, fontWeight: '700' }}>{t('orderSummary')}</Text>
        {lines.map((l) => (
          <Text key={l.bookId} style={{ color: theme.mut }}>
            {l.title} × {l.qty} — {formatMoney(l.unitPriceMillimes * l.qty)}
          </Text>
        ))}
        <Text style={{ color: theme.acc, fontWeight: '700' }}>
          {t('tot')}: {formatMoney(subtotal)}
        </Text>
      </View>

      <Button label={busy ? '…' : t('ok')} onPress={submit} disabled={busy} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: radius.cover,
    paddingHorizontal: space(3),
    paddingVertical: space(2),
  },
  summary: { borderWidth: 1, borderRadius: radius.card, padding: space(4), gap: space(2) },
});

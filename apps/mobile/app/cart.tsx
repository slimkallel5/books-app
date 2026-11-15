import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { formatMoney } from '@maktaba/shared';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { Button } from '../src/components/Button';
import { useI18n } from '../src/lib/i18n';
import { useTheme } from '../src/lib/theme';
import { cartSubtotal, useCart } from '../src/lib/store';

export default function CartScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useI18n();
  const lines = useCart((s) => s.lines);
  const increment = useCart((s) => s.increment);
  const decrement = useCart((s) => s.decrement);
  const remove = useCart((s) => s.remove);
  const subtotal = cartSubtotal(lines);

  if (lines.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.mut }}>{t('emp')}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <FlatList
        data={lines}
        keyExtractor={(l) => String(l.bookId)}
        contentContainerStyle={{ padding: space(4), gap: space(3) }}
        renderItem={({ item }) => (
          <View style={[styles.line, { backgroundColor: theme.card, borderColor: theme.line }]}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.ink, fontWeight: '600' }}>{item.title}</Text>
              <Text style={{ color: theme.mut }}>
                {formatMoney(item.unitPriceMillimes)} × {item.qty}
              </Text>
            </View>
            <View style={styles.qty}>
              <Text onPress={() => decrement(item.bookId)} style={[styles.qtyBtn, { color: theme.ink }]}>
                −
              </Text>
              <Text style={{ color: theme.ink }}>{item.qty}</Text>
              <Text onPress={() => increment(item.bookId)} style={[styles.qtyBtn, { color: theme.ink }]}>
                +
              </Text>
            </View>
            <Text onPress={() => remove(item.bookId)} style={{ color: theme.acc }}>
              ✕
            </Text>
          </View>
        )}
      />

      <View style={[styles.footer, { borderTopColor: theme.line, backgroundColor: theme.bg2 }]}>
        <Text style={{ color: theme.ink, fontWeight: '700', fontSize: 16 }}>
          {t('tot')}: {formatMoney(subtotal)}
        </Text>
        <Button label={t('co')} onPress={() => router.push('/checkout')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space(3),
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space(3),
  },
  dot: { width: 28, height: 40, borderRadius: 4 },
  qty: { flexDirection: 'row', alignItems: 'center', gap: space(3) },
  qtyBtn: { fontSize: 20, paddingHorizontal: space(2) },
  footer: { padding: space(4), gap: space(3), borderTopWidth: 1 },
});

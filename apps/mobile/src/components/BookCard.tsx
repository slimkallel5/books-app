import { formatMoney, type Book } from '@maktaba/shared';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { useI18n } from '../lib/i18n';
import { useTheme } from '../lib/theme';

interface Props {
  book: Book;
  onAdd: (book: Book) => void;
  onOpen?: (book: Book) => void;
}

/**
 * The catalogue card. Mirrors the web `BookCard`: a coloured "mini" cover with
 * the title, the level, the price and an add-to-cart action.
 */
export function BookCard({ book, onAdd, onOpen }: Props) {
  const theme = useTheme();
  const { t, level } = useI18n();
  const discounted = book.discountPct > 0;

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }]}>
      <Pressable
        onPress={() => onOpen?.(book)}
        style={[styles.mini, { backgroundColor: book.color }]}
        accessibilityRole="button"
        accessibilityLabel={book.title}
      >
        <Text style={styles.miniTitle} numberOfLines={2}>
          {book.title}
        </Text>
      </Pressable>

      {discounted ? (
        <View style={[styles.tag, { backgroundColor: theme.acc }]}>
          <Text style={styles.tagText}>
            {t('off')} −{book.discountPct}%
          </Text>
        </View>
      ) : null}

      <Text style={[styles.level, { color: theme.mut }]}>{level(book.level)}</Text>
      <Text style={[styles.title, { color: theme.ink }]} numberOfLines={2}>
        {book.title}
      </Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: theme.acc }]}>
          {formatMoney(book.finalPriceMillimes)}
        </Text>
        {discounted ? (
          <Text style={[styles.strike, { color: theme.mut }]}>
            {formatMoney(book.priceMillimes)}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={() => onAdd(book)}
        style={[styles.btn, { backgroundColor: theme.acc }]}
        accessibilityRole="button"
      >
        <Text style={styles.btnText}>{t('add')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space(4),
    gap: space(2),
  },
  mini: {
    height: 120,
    borderRadius: radius.cover,
    padding: space(3),
    justifyContent: 'flex-end',
  },
  miniTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  tagText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  level: { fontSize: 12 },
  title: { fontSize: 15, fontWeight: '600' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  price: { fontWeight: '700', fontSize: 15 },
  strike: { textDecorationLine: 'line-through', fontSize: 13 },
  btn: { borderRadius: radius.pill, paddingVertical: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});

import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { formatMoney } from '@maktaba/shared';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { Button } from '../../src/components/Button';
import { useBook } from '../../src/lib/hooks';
import { useI18n } from '../../src/lib/i18n';
import { useTheme } from '../../src/lib/theme';
import { useCart } from '../../src/lib/store';

/**
 * Book detail + a native page-turn reader. Each page is a card; Prev/Next turn
 * it, mirroring the web reader's cover → pages → back-cover sequence.
 */
export default function BookDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const add = useCart((s) => s.add);
  const { t, level } = useI18n();
  const { data: book, isLoading } = useBook(id);

  const total = useMemo(() => (book ? book.pages.length + 2 : 0), [book]);
  const [index, setIndex] = useState(0);

  if (isLoading || !book) {
    return (
      <View style={[styles.center, { backgroundColor: theme.bg }]}>
        <Text style={{ color: theme.mut }}>{t('loading')}</Text>
      </View>
    );
  }

  const isCover = index === 0;
  const isBack = index === total - 1;
  const page = !isCover && !isBack ? book.pages[index - 1] : null;

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ padding: space(5), gap: space(4) }}
    >
      <View style={[styles.cover, { backgroundColor: book.color }]}>
        <Text style={styles.coverTitle}>{book.title}</Text>
      </View>

      <Text style={[styles.level, { color: theme.mut }]}>{level(book.level)}</Text>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: theme.acc }]}>
          {formatMoney(book.finalPriceMillimes)}
        </Text>
        {book.discountPct > 0 ? (
          <Text style={[styles.strike, { color: theme.mut }]}>
            {formatMoney(book.priceMillimes)}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.desc, { color: theme.ink }]}>{book.description}</Text>

      <Button label={t('add')} onPress={() => add(book)} />

      <View style={[styles.reader, { backgroundColor: theme.page, borderColor: theme.line }]}>
        <Text style={[styles.pageTitle, { color: theme.pageInk }]}>
          {isCover ? book.title : isBack ? 'Maktaba' : page?.title}
        </Text>
        <Text style={[styles.pageBody, { color: theme.pageInk }]}>
          {isCover ? t('open') : isBack ? t('thx') : page?.body}
        </Text>

        <View style={styles.readerNav}>
          <Pressable
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            style={[styles.navBtn, { borderColor: theme.line }]}
          >
            <Text style={{ color: theme.ink }}>‹ {t('back')}</Text>
          </Pressable>
          <Text style={{ color: theme.mut }}>
            {index + 1} / {total}
          </Text>
          <Pressable
            onPress={() => setIndex((i) => Math.min(total - 1, i + 1))}
            style={[styles.navBtn, { borderColor: theme.line }]}
          >
            <Text style={{ color: theme.ink }}>{t('next')} ›</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  cover: { height: 200, borderRadius: radius.cover, justifyContent: 'flex-end', padding: space(4) },
  coverTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  level: { fontSize: 13 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: space(2) },
  price: { fontSize: 20, fontWeight: '700' },
  strike: { textDecorationLine: 'line-through' },
  desc: { fontSize: 15, lineHeight: 22 },
  reader: {
    borderWidth: 1,
    borderRadius: radius.card,
    padding: space(5),
    minHeight: 220,
    gap: space(3),
  },
  pageTitle: { fontSize: 18, fontWeight: '700' },
  pageBody: { fontSize: 15, lineHeight: 22 },
  readerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  navBtn: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: 6,
  },
});

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from '@maktaba/ui-tokens/rn';
import type { Book } from '@maktaba/shared';
import { Button } from '../src/components/Button';
import { BookCard } from '../src/components/BookCard';
import { ShelfRow } from '../src/components/ShelfRow';
import { useBooks, useFeatured } from '../src/lib/hooks';
import { useI18n } from '../src/lib/i18n';
import { useTheme } from '../src/lib/theme';
import { cartCount, useCart } from '../src/lib/store';

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const add = useCart((s) => s.add);
  const count = useCart((s) => cartCount(s.lines));

  const { data: featured } = useFeatured();
  const { data: all } = useBooks({ limit: 60 });

  const openBook = (book: Book) => router.push(`/book/${book.id}`);

  return (
    <ScrollView
      style={{ backgroundColor: theme.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + space(8) }}
    >
      <View style={[styles.hero, { backgroundColor: theme.bg2 }]}>
        <Text style={[styles.h1, { color: theme.ink }]}>
          {t('h1').replace(/<\/?em>/g, '')}
        </Text>
        <Text style={[styles.p, { color: theme.mut }]}>{t('hp')}</Text>
        <View style={styles.ctaRow}>
          <Button label={t('cta')} onPress={() => router.push('/catalogue')} />
          <Button
            label={`${t('cart')} (${count})`}
            variant="ghost"
            onPress={() => router.push('/cart')}
          />
          <Button label={t('admin')} variant="ghost" onPress={() => router.push('/admin')} />
        </View>
      </View>

      <Text style={[styles.h2, { color: theme.ink }]}>{t('bs')}</Text>
      <View style={styles.grid}>
        {(featured?.items ?? []).map((b) => (
          <View key={b.id} style={styles.gridItem}>
            <BookCard book={b} onAdd={add} onOpen={openBook} />
          </View>
        ))}
      </View>

      <Text style={[styles.h2, { color: theme.ink }]}>{t('catalogue')}</Text>
      <ShelfRow books={(all?.items ?? []).slice(0, 12)} onOpen={openBook} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { padding: space(6), gap: space(3) },
  h1: { fontSize: 30, fontWeight: '800', lineHeight: 36 },
  p: { fontSize: 16 },
  ctaRow: { flexDirection: 'row', gap: space(3), flexWrap: 'wrap', marginTop: space(2) },
  h2: { fontSize: 22, fontWeight: '700', padding: space(6), paddingBottom: space(3) },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space(3), paddingHorizontal: space(4) },
  gridItem: { width: '47%' },
});

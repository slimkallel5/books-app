import { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LEVELS, SORTS, type Book, type LevelFilter, type Sort } from '@maktaba/shared';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { BookCard } from '../src/components/BookCard';
import { useBooks } from '../src/lib/hooks';
import { useI18n } from '../src/lib/i18n';
import { useTheme } from '../src/lib/theme';
import { useCart } from '../src/lib/store';

export default function CatalogueScreen() {
  const theme = useTheme();
  const router = useRouter();
  const add = useCart((s) => s.add);
  const { t, level } = useI18n();

  const [q, setQ] = useState('');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [sort, setSort] = useState<Sort>('featured');

  const { data, isLoading } = useBooks({ q, level: levelFilter, sort, limit: 60 });

  const openBook = (book: Book) => router.push(`/book/${book.id}`);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TextInput
        value={q}
        onChangeText={setQ}
        placeholder={t('q')}
        placeholderTextColor={theme.mut}
        style={[styles.input, { backgroundColor: theme.card, borderColor: theme.line, color: theme.ink }]}
      />

      <View style={styles.filters}>
        <FilterChips
          options={['all', ...LEVELS]}
          value={levelFilter}
          label={(v) => (v === 'all' ? t('all') : level(v))}
          onSelect={(v) => setLevelFilter(v as LevelFilter)}
        />
      </View>
      <View style={styles.filters}>
        <FilterChips
          options={[...SORTS]}
          value={sort}
          label={(v) => t(v === 'featured' ? 's1' : v === 'price_asc' ? 's2' : 's3')}
          onSelect={(v) => setSort(v as Sort)}
        />
      </View>

      {isLoading ? (
        <Text style={[styles.empty, { color: theme.mut }]}>{t('loading')}</Text>
      ) : (
        <FlatList
          data={data?.items ?? []}
          keyExtractor={(b) => String(b.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.mut }]}>{t('none')}</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.cell}>
              <BookCard book={item} onAdd={add} onOpen={openBook} />
            </View>
          )}
        />
      )}
    </View>
  );
}

function FilterChips({
  options,
  value,
  label,
  onSelect,
}: {
  options: string[];
  value: string;
  label: (v: string) => string;
  onSelect: (v: string) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.chips}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Text
            key={o}
            onPress={() => onSelect(o)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.acc : theme.card,
                color: active ? '#fff' : theme.ink,
                borderColor: theme.line,
              },
            ]}
          >
            {label(o)}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    margin: space(4),
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space(4),
    paddingVertical: space(3),
  },
  filters: { paddingHorizontal: space(4) },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space(2), marginBottom: space(2) },
  chip: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: space(3),
    paddingVertical: 6,
    fontSize: 13,
    overflow: 'hidden',
  },
  list: { padding: space(4), gap: space(3) },
  row: { gap: space(3) },
  cell: { flex: 1 },
  empty: { textAlign: 'center', padding: space(8) },
});

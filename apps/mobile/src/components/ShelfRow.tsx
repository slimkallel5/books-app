import { Pressable, StyleSheet, Text, View } from 'react-native';
import { space } from '@maktaba/ui-tokens/rn';
import type { Book } from '@maktaba/shared';
import { useTheme } from '../lib/theme';

interface Props {
  books: Book[];
  onOpen: (book: Book) => void;
}

/**
 * A horizontally scrollable shelf of book spines. The web app renders these in
 * 3D with CSS transforms; on mobile we keep the "row of coloured spines" look
 * and make the shelf scrollable with the finger.
 */
export function ShelfRow({ books, onOpen }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.wrap}>
      <View style={[styles.row, { borderBottomColor: theme.wood, shadowColor: theme.wood2 }]}>
        {books.map((b) => (
          <Pressable
            key={b.id}
            onPress={() => onOpen(b)}
            style={[styles.spine, { backgroundColor: b.color, width: b.spineW }]}
            accessibilityRole="button"
            accessibilityLabel={b.title}
          >
            <Text style={styles.spineText} numberOfLines={1}>
              {b.title}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: space(4) },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
    height: 150,
    borderBottomWidth: 14,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  spine: {
    height: '100%',
    borderRadius: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  spineText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    transform: [{ rotate: '-90deg' }],
  },
});

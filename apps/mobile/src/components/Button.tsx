import { Pressable, StyleSheet, Text } from 'react-native';
import { radius, space } from '@maktaba/ui-tokens/rn';
import { useTheme } from '../lib/theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled }: Props) {
  const theme = useTheme();
  const primary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        {
          backgroundColor: primary ? theme.acc : 'transparent',
          borderColor: theme.line,
          borderWidth: primary ? 0 : 1,
          opacity: disabled ? 0.6 : 1,
        },
      ]}
      accessibilityRole="button"
    >
      <Text style={[styles.text, { color: primary ? '#fff' : theme.ink }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    paddingVertical: space(3),
    paddingHorizontal: space(5),
    alignItems: 'center',
  },
  text: { fontWeight: '600' },
});

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTheme } from '../src/lib/theme';
import { useI18n } from '../src/lib/i18n';

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
      }),
  );
  const theme = useTheme();
  const { isRtl } = useI18n();

  return (
    <GestureHandlerRootView style={{ flex: 1, direction: isRtl ? 'rtl' : 'ltr' }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.bg },
              headerTintColor: theme.ink,
              headerTitleStyle: { fontFamily: 'serif' },
              contentStyle: { backgroundColor: theme.bg },
              headerBackTitle: '',
            }}
          >
            <Stack.Screen name="index" options={{ title: 'Maktaba' }} />
            <Stack.Screen name="catalogue" options={{ title: 'Catalogue' }} />
            <Stack.Screen name="book/[id]" options={{ title: '' }} />
            <Stack.Screen name="cart" options={{ title: 'Cart' }} />
            <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
            <Stack.Screen name="admin" options={{ title: 'Admin' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

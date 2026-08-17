import { Stack, ErrorBoundary } from 'expo-router';
export { ErrorBoundary };
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect, useState, Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Colors from '@/constants/Colors';
import AnimatedSplashScreen from '../components/shared/AnimatedSplashScreen';
import InitialPermissionsModal from '../components/shared/InitialPermissionsModal';
import { useNotificationObserver, registerForPushNotificationsAsync } from '../services/notificationService';

// Prevent splash screen from auto hiding before app is ready
SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RootErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={styles.retryButtonText}>Reload App</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  // Initialize push notification listeners
  useNotificationObserver();

  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    async function hideNativeSplash() {
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Ignore native splash screen hide errors
      }
    }
    hideNativeSplash();
  }, []);

  return (
    <RootErrorBoundary>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {showAnimatedSplash ? (
            <AnimatedSplashScreen onAnimationFinish={() => setShowAnimatedSplash(false)} />
          ) : (
            <InitialPermissionsModal />
          )}

          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              animationDuration: 220,
              headerStyle: {
                backgroundColor: Colors.brand.navy,
              },
              headerTintColor: '#FFFFFF',
              headerTitleStyle: {
                fontWeight: '800',
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="hotel/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="packages/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="stays/index" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="checkout/[id]" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="booking-success/index" options={{ headerShown: true, title: 'Booking Confirmed', headerLeft: () => null, animation: 'fade' }} />
            <Stack.Screen name="auth/login" options={{ headerShown: false, animation: 'slide_from_right' }} />
            <Stack.Screen name="auth/register" options={{ headerShown: false, animation: 'slide_from_right' }} />
          </Stack>
        </QueryClientProvider>
      </SafeAreaProvider>
    </RootErrorBoundary>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FF6B6B',
    marginBottom: 12,
  },
  errorMessage: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});

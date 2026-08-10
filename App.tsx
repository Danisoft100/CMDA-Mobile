import { StatusBar } from "expo-status-bar";
import AppNavigation from "./navigations";
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import Toast from "react-native-toast-message";
import { useEffect } from 'react';
import PushNotificationService from './services/PushNotificationService';
import UpdateService from './services/UpdateService';
import { Text, TouchableOpacity, View, Platform } from 'react-native';
import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { TutorialProvider } from './contexts/TutorialContext';
import { TutorialOverlay } from './components/tutorial';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OldAppMigrationGate from './components/OldAppMigrationGate';
import PushEnrollmentGate from './components/PushEnrollmentGate';
import TokenManager from './services/TokenManager';
import { logout, selectAuth } from './store/slices/authSlice';
import CrashReporterService from './services/CrashReporterService';
import { useSocket } from './utils/useSocket';
import api from './store/api/api';
import { useGetNotificationStatsQuery } from './store/api/notificationsApi';

function NotificationSync() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(selectAuth);
  const { socket } = useSocket();
  const { data } = useGetNotificationStatsQuery(undefined, {
    skip: !isAuthenticated,
    pollingInterval: 300000,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const refresh = () => dispatch(api.util.invalidateTags(["ALL_NOTIFICATIONS", "NOTIFICATIONS_STATS"]));
    const unsubscribePush = PushNotificationService.subscribeToForegroundNotifications(refresh);
    socket?.on("notification:new", refresh);
    socket?.on("connect", refresh);
    return () => {
      unsubscribePush();
      socket?.off("notification:new", refresh);
      socket?.off("connect", refresh);
    };
  }, [dispatch, isAuthenticated, socket]);

  useEffect(() => {
    void PushNotificationService.setBadgeCount(data?.unreadNotificationCount || 0);
  }, [data?.unreadNotificationCount]);

  return null;
}

// Keep splash screen visible while we initialize
let splashScreenHidden = false;
try {
  SplashScreen.preventAutoHideAsync().catch((error) => {
    console.error('[App] Splash screen already hidden or error:', error);
    splashScreenHidden = true;
  });
} catch (error) {
  console.error('[App] Failed to prevent splash auto-hide:', error);
  splashScreenHidden = true;
}

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] App crashed:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
    console.error('[ErrorBoundary] Stack trace:', error.stack);
    void CrashReporterService.report(error, errorInfo.componentStack);
    
    // Log to AsyncStorage for debugging
    try {
      import('@react-native-async-storage/async-storage').then(AsyncStorage => {
        AsyncStorage.default.setItem('app_crash_log', JSON.stringify({
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString(),
          errorInfo: errorInfo
        }));
      });
    } catch (e) {
      console.error('[ErrorBoundary] Failed to save crash log:', e);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  handleSignOut = async () => {
    await TokenManager.clearTokens();
    store.dispatch(logout());
    await persistor.purge();
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            App Error
          </Text>
          <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
            Something went wrong. You can retry safely or sign out and start a fresh session.
          </Text>
          <View style={{ width: '100%', maxWidth: 320, gap: 10 }}>
            <TouchableOpacity onPress={this.handleRetry} accessibilityRole="button" style={{ backgroundColor: '#8c2f6f', borderRadius: 10, padding: 14 }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => void this.handleSignOut()} accessibilityRole="button" style={{ borderColor: '#8c2f6f', borderWidth: 1, borderRadius: 10, padding: 14 }}>
              <Text style={{ color: '#8c2f6f', textAlign: 'center', fontWeight: '600' }}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreen.hideAsync();
      } catch (error) {
        try { SplashScreen.hideAsync(); } catch (e) { /* ignore */ }
      }

      if (Platform.OS !== 'web') {
        try {
          await PushNotificationService.initialize();
          PushNotificationService.registerTokenWithRetry(5);
          PushNotificationService.startPeriodicTokenRegistration();
        } catch (error) {
          console.error('[App] Push init failed:', error);
        }
      }

      // Silent OTA: check once after 3s, then every 5 minutes
      setTimeout(() => UpdateService.silentUpdate(), 3000);
      UpdateService.startAutoUpdate(300000);
    };

    initializeApp().catch(() => {});

    return () => {
      UpdateService.stopAutoUpdate();
      try { PushNotificationService.cleanup(); } catch (error) { /* ignore */ }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="dark" />
        <PersistGate
          loading={<View style={{ flex: 1, backgroundColor: "#8c2f6f" }} />}
          persistor={persistor}
        >
          <TutorialProvider>
            <NotificationSync />
            <View style={{ flex: 1 }}>
              <AppNavigation />
            </View>
            <TutorialOverlay />
          </TutorialProvider>
          <Toast />
        </PersistGate>
      </Provider>
      <OldAppMigrationGate />
      <PushEnrollmentGate />
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

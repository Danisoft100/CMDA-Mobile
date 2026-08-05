import { StatusBar } from "expo-status-bar";
import AppNavigation from "./navigations";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import Toast from "react-native-toast-message";
import { useEffect, useState } from 'react';
import PushNotificationService from './services/PushNotificationService';
import UpdateService from './services/UpdateService';
import UpdatePrompt from './components/UpdatePrompt';
import { Text, TouchableOpacity, View, Platform } from 'react-native';
import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { TutorialProvider } from './contexts/TutorialContext';
import { TutorialOverlay } from './components/tutorial';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import OldAppMigrationGate from './components/OldAppMigrationGate';
import PushEnrollmentGate from './components/PushEnrollmentGate';
import TokenManager from './services/TokenManager';
import { logout } from './store/slices/authSlice';
import CrashReporterService from './services/CrashReporterService';

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
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  useEffect(() => {
    
    // Use a more robust initialization sequence
    const initializeApp = async () => {
      try {
        // Hide splash screen with longer delay for slower devices
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('[App] Error hiding splash screen:', error);
        try { SplashScreen.hideAsync(); } catch (e) { console.error('[App] Fallback splash screen hide failed:', e); }
      }
      
      // Initialize push notifications
      if (Platform.OS !== 'web') {
        try {
          await PushNotificationService.initialize();
          // Use retry logic — waits for auth token before registering
          PushNotificationService.registerTokenWithRetry(5);
          // Start periodic re-registration (every 24h)
          PushNotificationService.startPeriodicTokenRegistration();
        } catch (error) {
          console.error('[App] Failed to initialize push notifications:', error);
        }
      }

      // Check for OTA updates after a short delay
      setTimeout(async () => {
        try {
          const result = await UpdateService.checkForUpdate();
          if (result.available) {
            setShowUpdate(true);
          }
        } catch (error) {
          console.error('[App] Update check failed:', error);
        }
      }, 3000);
    };

    initializeApp().catch((err) => console.error('[App] App initialization error:', err));

    return () => {
      try { PushNotificationService.cleanup(); } catch (error) { console.error('[App] PushNotificationService cleanup failed:', error); }
    };
  }, []);

  const handleUpdateNow = async () => {
    setIsUpdating(true);
    try {
      await UpdateService.fetchAndApplyUpdate();
    } catch (error) {
      console.error('[App] Update failed:', error);
      setIsUpdating(false);
      setShowUpdate(false);
    }
  };

  const handleUpdateLater = () => {
    setShowUpdate(false);
    // Download in background for next restart
    UpdateService.downloadInBackground();
  };

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="dark" />
        <PersistGate
          loading={<View style={{ flex: 1, backgroundColor: "#8c2f6f" }} />}
          persistor={persistor}
        >
          <TutorialProvider>
            <View style={{ flex: 1 }}>
              <AppNavigation />
            </View>
            <TutorialOverlay />
          </TutorialProvider>
          <Toast />
        </PersistGate>
        <UpdatePrompt
          visible={showUpdate}
          onUpdateNow={handleUpdateNow}
          onLater={handleUpdateLater}
          isLoading={isUpdating}
        />
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

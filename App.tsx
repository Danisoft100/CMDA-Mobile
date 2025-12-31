import { StatusBar } from "expo-status-bar";
import AppNavigation from "./navigations";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import Toast from "react-native-toast-message";
import { useEffect } from 'react';
import PushNotificationService from './services/PushNotificationService';
import { Text, View, Platform } from 'react-native';
import React from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { TutorialProvider } from './contexts/TutorialContext';
import { TutorialOverlay } from './components/tutorial';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Keep splash screen visible while we initialize
let splashScreenHidden = false;
try {
  SplashScreen.preventAutoHideAsync().catch((error) => {
    console.log('[App] Splash screen already hidden or error:', error);
    splashScreenHidden = true;
  });
} catch (error) {
  console.log('[App] Failed to prevent splash auto-hide:', error);
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

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            App Error
          </Text>
          <Text style={{ textAlign: 'center', color: '#666' }}>
            {this.state.error?.message || 'Something went wrong'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  console.log('[App] Starting AppContent initialization');
  
  useEffect(() => {
    console.log('[App] useEffect triggered');
    
    // Use a more robust initialization sequence
    const initializeApp = async () => {
      try {
        // Hide splash screen with longer delay for slower devices
        await new Promise(resolve => setTimeout(resolve, 500));
        await SplashScreen.hideAsync();
        console.log('[App] Splash screen hidden');
      } catch (error) {
        console.error('[App] Error hiding splash screen:', error);
        // Try to hide anyway
        try {
          SplashScreen.hideAsync();
        } catch (e) {
          console.error('[App] Final splash screen hide attempt failed:', e);
        }
      }
      
      // Initialize push notifications with better error handling
      // The service will automatically skip if running in Expo Go
      if (Platform.OS !== 'web') {
        try {
          console.log('[App] Starting push notification initialization');
          await PushNotificationService.initialize();
          console.log('[App] Push notification service initialized');
          
          // Update token on server when available
          const token = PushNotificationService.getPushToken();
          if (token) {
            console.log('[App] Updating push token on server');
            await PushNotificationService.updatePushTokenOnServer(token);
          }
        } catch (error) {
          console.error('[App] Failed to initialize push notifications:', error);
          // Continue without push notifications
        }
      }
    };

    // Run initialization with error boundary
    initializeApp().catch((err) => {
      console.error('[App] App initialization error:', err);
      // Don't crash the app
    });

    // Cleanup on unmount
    return () => {
      try {
        console.log('[App] Cleaning up push notifications');
        PushNotificationService.cleanup();
      } catch (error) {
        console.error('[App] Failed to cleanup push notifications:', error);
      }
    };
  }, []);

  console.log('[App] Rendering app components');

  return (
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar style="dark" />
        <PersistGate loading={null} persistor={persistor}>
          <TutorialProvider>
            <AppNavigation />
            <TutorialOverlay />
          </TutorialProvider>
          <Toast />
        </PersistGate>
      </Provider>
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

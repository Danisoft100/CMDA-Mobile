import { StatusBar } from "expo-status-bar";
import AppNavigation from "./navigations";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import Toast from "react-native-toast-message";
import { useEffect } from 'react';
import PushNotificationService from './services/PushNotificationService';
import { Text, View } from 'react-native';
import React from 'react';

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
    console.error('[ErrorBoundary] App crashed:', error, errorInfo);
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
    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        console.log('[App] Starting push notification initialization');
        // Only initialize if on a physical device or emulator
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
        // Don't crash the app if push notifications fail
      }
    };

    // Run async initialization without blocking
    initializePushNotifications().catch((err) => {
      console.error('[App] Push notification init error:', err);
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
    <Provider store={store}>
      <StatusBar style="dark" />
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigation />
        <Toast />
      </PersistGate>
    </Provider>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

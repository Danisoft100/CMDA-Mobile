import { StatusBar } from "expo-status-bar";
import AppNavigation from "./navigations";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import Toast from "react-native-toast-message";
import { useEffect } from 'react';
import PushNotificationService from './services/PushNotificationService';

export default function App() {
  useEffect(() => {
    // Initialize push notifications
    const initializePushNotifications = async () => {
      try {
        await PushNotificationService.initialize();
        
        // Update token on server when available
        const token = PushNotificationService.getPushToken();
        if (token) {
          await PushNotificationService.updatePushTokenOnServer(token);
        }
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initializePushNotifications();

    // Cleanup on unmount
    return () => {
      PushNotificationService.cleanup();
    };
  }, []);

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

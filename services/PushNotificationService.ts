import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigate } from '~/utils/navigationService';
import { API_URL } from '~/constants/api';
import TokenManager from './TokenManager';

// Lazy import notifications to avoid loading native module in Expo Go
let Notifications: any = null;

// Check if we're running in Expo Go (where notifications aren't supported in SDK 53+)
const isExpoGo = Constants.appOwnership === 'expo' || Constants.executionEnvironment === 'storeClient';

// Only import and configure notifications if NOT in Expo Go
if (!isExpoGo && Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.error('[PushNotificationService] Failed to load notification handler:', error);
  }
}

/**
 * Notification types supported by the system
 * Requirements: 5.9
 */
export type NotificationType = 
  | 'announcement' 
  | 'event_reminder' 
  | 'payment_reminder' 
  | 'custom'
  | 'ticket_created' 
  | 'ticket_updated' 
  | 'message_received' 
  | 'ticket_resolved';

/**
 * Notification data structure
 */
export interface NotificationData {
  ticketId?: string;
  eventId?: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Screen mapping for notification types
 * Requirements: 5.8 - Navigate to appropriate screen on tap based on type
 */
const NOTIFICATION_SCREEN_MAP: Record<
  NotificationType,
  { tab: 'home' | 'events' | 'payment'; screen: string; params?: (data: any) => object }
> = {
  announcement: { tab: 'home', screen: 'home-notifications' },
  event_reminder: { 
    tab: 'events',
    screen: 'events-single', 
    params: (data) => ({ slug: data?.slug || data?.eventSlug })
  },
  payment_reminder: { tab: 'payment', screen: 'pay-index' },
  custom: { tab: 'home', screen: 'home-notifications' },
  ticket_created: { tab: 'home', screen: 'home-notifications' },
  ticket_updated: { tab: 'home', screen: 'home-notifications' },
  message_received: { 
    tab: 'home',
    screen: 'home-messages-single', 
    params: (data) => ({ id: data?.senderId || data?.userId || 'admin', fullName: data?.senderName || 'Admin' })
  },
  ticket_resolved: { tab: 'home', screen: 'home-notifications' },
};

/**
 * Device ID storage key
 */
const DEVICE_ID_KEY = 'push_notification_device_id';

class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private deviceId: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;
  private tokenChangeListener: any = null;
  private periodicRegistrationInterval: any = null;
  private isInitialized: boolean = false;
  private tokenRegisteredWithServer: boolean = false;
  private lastRegistrationError: string | null = null;

  private constructor() {}

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  /**
   * Initialize push notification service
   */
  async initialize(): Promise<void> {
    try {
      
      // Skip if Notifications module not loaded (Expo Go)
      if (!Notifications) {
        return;
      }
      
      // Skip on web platform
      if (Platform.OS === 'web') {
        return;
      }

      // Check if running on a real device
      if (!Device.isDevice) {
        console.warn('[PushNotificationService] Not running on device, skipping');
        return;
      }

      // Get or generate device ID
      await this.ensureDeviceId();

      // Request permissions first
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.expoPushToken = token;
        await this.savePushTokenToStorage(token);
      }

      // Set up notification listeners (safe to do even without token)
      this.setupNotificationListeners();

      // Set up token change listener
      this.setupTokenChangeListener();

      // Configure notification categories (safe operation)
      await this.configureNotificationCategories();
      
      this.isInitialized = true;
    } catch (error) {
      console.error('[PushNotificationService] Initialization failed:', error);
      // Don't throw - let app continue without push notifications
    }
  }

  /**
   * Ensure we have a unique device ID
   */
  private async ensureDeviceId(): Promise<string> {
    if (this.deviceId) {
      return this.deviceId;
    }

    try {
      // Try to get existing device ID
      let storedDeviceId = await AsyncStorage.getItem(DEVICE_ID_KEY);
      
      if (!storedDeviceId) {
        // Generate a new device ID
        storedDeviceId = `${Platform.OS}-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
        await AsyncStorage.setItem(DEVICE_ID_KEY, storedDeviceId);
      }

      this.deviceId = storedDeviceId;
      return storedDeviceId;
    } catch (error) {
      console.error('[PushNotificationService] Error getting device ID:', error);
      // Fallback device ID
      this.deviceId = `${Platform.OS}-${Date.now()}`;
      return this.deviceId;
    }
  }

  /**
   * Get the current device ID
   */
  async getDeviceId(): Promise<string> {
    return this.ensureDeviceId();
  }

  /**
   * Register for push notifications and get token
   */
  private async registerForPushNotificationsAsync(): Promise<string | null> {
    let token = null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create support-specific channel
      await Notifications.setNotificationChannelAsync('support', {
        name: 'Support Tickets',
        description: 'Notifications for support ticket updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2196F3',
        sound: 'default',
      });

      // Create admin notifications channel
      await Notifications.setNotificationChannelAsync('admin', {
        name: 'Admin Notifications',
        description: 'Announcements and updates from administrators',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
      });
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permission denied');
        return null;
      }

      try {
        const projectId =
          Constants.expoConfig?.extra?.eas?.projectId ??
          Constants.easConfig?.projectId;

        if (!projectId) {
          this.lastRegistrationError = 'EAS project ID is unavailable';
          console.error('[PushNotificationService] EAS project ID is unavailable');
          return null;
        }

        token = (await Notifications.getExpoPushTokenAsync({
          projectId,
        })).data;
        this.lastRegistrationError = null;
      } catch (error) {
        this.lastRegistrationError =
          error instanceof Error ? error.message : 'Failed to obtain an Expo push token';
        console.error('Failed to get push token:', error);
      }
    } else {
      console.warn('Must use physical device for Push Notifications');
    }

    return token;
  }

  /**
   * Set up listener for token changes (e.g., app reinstall)
   * Requirements: 7.3 - Update token when it changes
   */
  private setupTokenChangeListener(): void {
    if (!Notifications) return;

    this.tokenChangeListener = Notifications.addPushTokenListener(async (tokenData: any) => {
      const newToken = tokenData.data;
      
      if (newToken && newToken !== this.expoPushToken) {
        this.expoPushToken = newToken;
        await this.savePushTokenToStorage(newToken);
        
        // Update token on server if user is logged in
        await this.updatePushTokenOnServer(newToken);
      }
    });
  }

  /**
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    if (!Notifications) return;

    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Configure notification categories with actions
   */
  private async configureNotificationCategories(): Promise<void> {
    if (!Notifications) return;

    await Notifications.setNotificationCategoryAsync('support_ticket', [
      {
        identifier: 'view_ticket',
        buttonTitle: 'View Ticket',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'mark_read',
        buttonTitle: 'Mark as Read',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);

    await Notifications.setNotificationCategoryAsync('new_message', [
      {
        identifier: 'reply',
        buttonTitle: 'Reply',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'view_ticket',
        buttonTitle: 'View Ticket',
        options: {
          opensAppToForeground: true,
        },
      },
    ]);

    // Admin notification category
    await Notifications.setNotificationCategoryAsync('admin_notification', [
      {
        identifier: 'view',
        buttonTitle: 'View',
        options: {
          opensAppToForeground: true,
        },
      },
      {
        identifier: 'dismiss',
        buttonTitle: 'Dismiss',
        options: {
          opensAppToForeground: false,
        },
      },
    ]);
  }

  /**
   * Handle notification received while app is running
   * Requirements: 5.7 - Display notifications with correct title/body
   */
  private handleNotificationReceived(notification: any): void {
    const { data } = notification.request.content;
    
    // Update app state based on notification type
    if (data?.type === 'ticket_updated' || data?.type === 'message_received') {
      // Dispatch action to update ticket data
    }
  }

  /**
   * Handle user tapping on notification
   * Requirements: 5.8 - Navigate to appropriate screen on tap based on type
   */
  private handleNotificationResponse(response: any): void {
    const { actionIdentifier, notification } = response;
    const { data, title, body } = notification.request.content;
    const notificationType = data?.type as NotificationType;

    // Handle specific action buttons
    switch (actionIdentifier) {
      case 'view_ticket':
        this.navigateToScreen('home', 'home-notifications');
        return;
      case 'mark_read':
        if (typeof data?.notificationId === 'string') {
          this.markNotificationAsRead(data.notificationId);
        }
        return;
      case 'reply':
        this.navigateToScreen('home', 'home-messages-single', {
          id: data?.senderId || data?.userId || 'admin',
          fullName: data?.senderName || 'Admin',
        });
        return;
      case 'view':
        // Default view action - fall through to type-based navigation
        break;
      case 'dismiss':
        // User dismissed, do nothing
        return;
    }

    // Default tap - navigate based on notification type
    this.navigateByNotificationType(notificationType, data);
  }

  /**
   * Navigate to appropriate screen based on notification type
   * Requirements: 5.8, 5.9
   */
  private navigateByNotificationType(type: NotificationType | undefined, data: any): void {
    if (!type) {
      // Default to notification center if no type
      this.navigateToScreen('home', 'home-notifications');
      return;
    }

    const screenConfig = NOTIFICATION_SCREEN_MAP[type];
    if (screenConfig) {
      const params = screenConfig.params ? screenConfig.params(data) : undefined;
      this.navigateToScreen(screenConfig.tab, screenConfig.screen, params);
    } else {
      // Fallback to notification center
      this.navigateToScreen('home', 'home-notifications');
    }
  }

  /**
   * Navigate to a specific screen
   */
  private navigateToScreen(tab: string, screen: string, params?: object): void {
    // Use a small delay to ensure navigation is ready
    setTimeout(() => {
      navigate('tab', { screen: tab, params: { screen, params } });
    }, 100);
  }

  /**
   * Send local notification (for testing or offline scenarios)
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<void> {
    if (!Notifications) return;

    const { type, title, body, ticketId, eventId, data } = notificationData;

    let categoryIdentifier = 'admin_notification';
    if (type === 'message_received') {
      categoryIdentifier = 'new_message';
    } else if (type.includes('ticket')) {
      categoryIdentifier = 'support_ticket';
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, ticketId, eventId, ...data },
        categoryIdentifier,
        sound: 'default',
      },
      trigger: null, // Show immediately
    });
  }

  /**
   * Get the current push token
   */
  getPushToken(): string | null {
    return this.expoPushToken;
  }

  /**
   * Register push token on login
   * Requirements: 7.1 - Register device's push token with the backend on login
   */
  async registerPushTokenOnLogin(): Promise<boolean> {
    try {
      this.lastRegistrationError = null;
      let token = this.expoPushToken || await this.getStoredPushToken();

      // Login can finish before app-level notification initialization has
      // obtained a token. Recover here instead of silently leaving the user
      // without a server-side device registration.
      if (!token && Notifications && Platform.OS !== 'web' && Device.isDevice) {
        await this.ensureDeviceId();
        token = await this.registerForPushNotificationsAsync();
        if (token) {
          this.expoPushToken = token;
          await this.savePushTokenToStorage(token);
        }
      }

      if (!token) {
        const permissionStatus = await this.getPermissionStatus();
        this.lastRegistrationError =
          permissionStatus === 'denied'
            ? 'Notification permission is disabled'
            : this.lastRegistrationError || 'No Expo push token is available';
        console.warn('[PushNotificationService] No push token available after permission/token request');
        return false;
      }

      const deviceId = await this.getDeviceId();
      const authToken = await TokenManager.getToken();

      if (!authToken) {
        this.lastRegistrationError = 'Your session is not ready';
        console.warn('[PushNotificationService] No auth token available for push token registration');
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/notifications/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          token,
          platform: Platform.OS as 'ios' | 'android',
          deviceId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        this.lastRegistrationError = `Registration failed (${response.status})`;
        console.error('[PushNotificationService] Failed to register push token:', response.status, errorText);
        return false;
      }

      this.tokenRegisteredWithServer = true;
      this.lastRegistrationError = null;
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        this.lastRegistrationError = 'Registration timed out';
        console.error('[PushNotificationService] Push token registration timed out');
      } else {
        this.lastRegistrationError =
          error instanceof Error ? error.message : 'Push registration failed';
        console.error('[PushNotificationService] Error registering push token on login:', error);
      }
      return false;
    }
  }

  getLastRegistrationError(): string | null {
    return this.lastRegistrationError;
  }

  /**
   * Update push token on server with retry logic
   * Requirements: 7.3 - Update token when it changes
   */
  async updatePushTokenOnServer(token: string, retries = 3): Promise<boolean> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const authToken = await TokenManager.getToken();

        if (!authToken) {
          console.warn(`[PushNotificationService] No auth token available (attempt ${attempt}/${retries})`);
          if (attempt < retries) {
            await new Promise(r => setTimeout(r, 2000 * attempt));
            continue;
          }
          return false;
        }

        const deviceId = await this.getDeviceId();

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`${API_URL}/notifications/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token,
            platform: Platform.OS as 'ios' | 'android',
            deviceId,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Failed to update push token: ${response.status}`);
        }

        this.tokenRegisteredWithServer = true;
        return true;
      } catch (error) {
        console.error(`[PushNotificationService] Token update attempt ${attempt}/${retries} failed:`, error);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    }
    return false;
  }

  /**
   * Register token with retry — called after login and on app restart
   */
  async registerTokenWithRetry(maxRetries = 5): Promise<boolean> {
    const token = this.expoPushToken || await this.getStoredPushToken();
    if (!token) {
      return false;
    }

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const authToken = await TokenManager.getToken();
        if (!authToken) {
          console.warn(`[PushNotificationService] Auth token not ready (attempt ${attempt}/${maxRetries}), waiting...`);
          await new Promise(r => setTimeout(r, 3000 * attempt));
          continue;
        }

        const success = await this.updatePushTokenOnServer(token, 1);
        if (success) {
          return true;
        }
      } catch (error) {
        console.error(`[PushNotificationService] Registration attempt ${attempt}/${maxRetries} failed:`, error);
      }
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 3000 * attempt));
      }
    }

    console.error('[PushNotificationService] Failed to register token after all retries');
    return false;
  }

  /**
   * Start periodic token re-registration (every 24 hours)
   */
  startPeriodicTokenRegistration(): void {
    // Re-register token every 24 hours to ensure server always has a fresh token
    this.periodicRegistrationInterval = setInterval(async () => {
      if (this.expoPushToken && this.tokenRegisteredWithServer === false) {
        await this.registerTokenWithRetry(3);
      }
    }, 24 * 60 * 60 * 1000); // 24 hours
  }

  /**
   * Remove push token on logout
   * Requirements: 7.4 - Remove push token association on logout
   */
  async removePushTokenOnLogout(): Promise<boolean> {
    try {
      const authToken = await TokenManager.getToken();
      const deviceId = await this.getDeviceId();

      if (!authToken) {
        console.warn('[PushNotificationService] No auth token available for push token removal');
        // Still clear local token even if we can't remove from server
        this.expoPushToken = null;
        await AsyncStorage.removeItem('expo_push_token');
        return true;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/notifications/push-token?deviceId=${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.error('[PushNotificationService] Failed to remove push token from server:', response.status);
        // Still clear local token
      }

      // Clear local token
      this.expoPushToken = null;
      await AsyncStorage.removeItem('expo_push_token');

      return true;
    } catch (error) {
      console.error('[PushNotificationService] Error removing push token on logout:', error);
      // Still clear local token
      this.expoPushToken = null;
      await AsyncStorage.removeItem('expo_push_token');
      return false;
    }
  }

  /**
   * Save push token to local storage
   */
  private async savePushTokenToStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
    } catch (error) {
      console.error('[PushNotificationService] Failed to save push token to storage:', error);
    }
  }

  /**
   * Get stored push token
   */
  async getStoredPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('[PushNotificationService] Failed to retrieve push token from storage:', error);
      return null;
    }
  }

  /**
   * Mark notification as read
   */
  private async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const authToken = await TokenManager.getToken();
      if (!authToken) return;

      await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

    } catch (error) {
      console.error('[PushNotificationService] Error marking notification as read:', error);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (this.periodicRegistrationInterval) {
      clearInterval(this.periodicRegistrationInterval);
      this.periodicRegistrationInterval = null;
    }
    if (!Notifications) return;
    
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
      this.notificationListener = null;
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
      this.responseListener = null;
    }
    if (this.tokenChangeListener) {
      Notifications.removeNotificationSubscription(this.tokenChangeListener);
      this.tokenChangeListener = null;
    }
  }

  /**
   * Get notification permissions status
   */
  async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    if (!Notifications) return 'undetermined';
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    if (!Notifications) return false;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    if (!Notifications) return;
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    if (!Notifications) return;
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Check if service is initialized
   */
  isServiceInitialized(): boolean {
    return this.isInitialized;
  }
}

export default PushNotificationService.getInstance();

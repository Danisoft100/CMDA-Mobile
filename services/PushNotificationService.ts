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
const NOTIFICATION_SCREEN_MAP: Record<NotificationType, { screen: string; params?: (data: any) => object }> = {
  announcement: { screen: 'home-notifications' },
  event_reminder: { 
    screen: 'events-single', 
    params: (data) => ({ eventId: data?.eventId }) 
  },
  payment_reminder: { screen: 'pay-index' },
  custom: { screen: 'home-notifications' },
  ticket_created: { 
    screen: 'home-notifications-single', 
    params: (data) => ({ ticketId: data?.ticketId }) 
  },
  ticket_updated: { 
    screen: 'home-notifications-single', 
    params: (data) => ({ ticketId: data?.ticketId }) 
  },
  message_received: { 
    screen: 'home-messages-single', 
    params: (data) => ({ ticketId: data?.ticketId }) 
  },
  ticket_resolved: { 
    screen: 'home-notifications-single', 
    params: (data) => ({ ticketId: data?.ticketId }) 
  },
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
  private isInitialized: boolean = false;

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
      console.log('[PushNotificationService] Starting initialization');
      
      // Skip if Notifications module not loaded (Expo Go)
      if (!Notifications) {
        console.log('[PushNotificationService] Skipping - not available in Expo Go');
        return;
      }
      
      // Skip on web platform
      if (Platform.OS === 'web') {
        console.log('[PushNotificationService] Skipping on web platform');
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
        console.log('[PushNotificationService] Push token obtained:', token.substring(0, 20) + '...');
      }

      // Set up notification listeners (safe to do even without token)
      this.setupNotificationListeners();

      // Set up token change listener
      this.setupTokenChangeListener();

      // Configure notification categories (safe operation)
      await this.configureNotificationCategories();
      
      this.isInitialized = true;
      console.log('[PushNotificationService] Initialization completed');
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
        console.log('[PushNotificationService] Generated new device ID:', storedDeviceId);
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
        token = (await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })).data;
      } catch (error) {
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
      console.log('[PushNotificationService] Token changed:', newToken?.substring(0, 20) + '...');
      
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
        console.log('[PushNotificationService] Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log('[PushNotificationService] Notification response:', response);
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
    const { data, title, body } = notification.request.content;
    
    console.log('[PushNotificationService] Received notification:', { title, body, type: data?.type });
    
    // Update app state based on notification type
    if (data?.type === 'ticket_updated' || data?.type === 'message_received') {
      // Dispatch action to update ticket data
      console.log('[PushNotificationService] Updating app state for notification:', data);
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

    console.log('[PushNotificationService] Handling notification tap:', { 
      actionIdentifier, 
      type: notificationType, 
      title, 
      body 
    });

    // Handle specific action buttons
    switch (actionIdentifier) {
      case 'view_ticket':
        if (typeof data?.ticketId === 'string') {
          this.navigateToScreen('home-notifications-single', { ticketId: data.ticketId });
        }
        return;
      case 'mark_read':
        if (typeof data?.notificationId === 'string') {
          this.markNotificationAsRead(data.notificationId);
        }
        return;
      case 'reply':
        if (typeof data?.ticketId === 'string') {
          this.navigateToScreen('home-messages-single', { ticketId: data.ticketId });
        }
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
      this.navigateToScreen('home-notifications');
      return;
    }

    const screenConfig = NOTIFICATION_SCREEN_MAP[type];
    if (screenConfig) {
      const params = screenConfig.params ? screenConfig.params(data) : undefined;
      this.navigateToScreen(screenConfig.screen, params);
    } else {
      // Fallback to notification center
      this.navigateToScreen('home-notifications');
    }
  }

  /**
   * Navigate to a specific screen
   */
  private navigateToScreen(screen: string, params?: object): void {
    console.log('[PushNotificationService] Navigating to:', screen, params);
    
    // Use a small delay to ensure navigation is ready
    setTimeout(() => {
      try {
        navigate(screen, params);
      } catch (error) {
        console.error('[PushNotificationService] Navigation error:', error);
        // Fallback: try navigating to tab first, then screen
        try {
          navigate('tab', { screen: 'home', params: { screen, params } });
        } catch (fallbackError) {
          console.error('[PushNotificationService] Fallback navigation error:', fallbackError);
        }
      }
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
      const token = this.expoPushToken || await this.getStoredPushToken();
      if (!token) {
        console.log('[PushNotificationService] No push token available to register');
        return false;
      }

      const deviceId = await this.getDeviceId();
      const authToken = await TokenManager.getToken();

      if (!authToken) {
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
        console.error('[PushNotificationService] Failed to register push token:', response.status, errorText);
        return false;
      }

      console.log('[PushNotificationService] Push token registered on login successfully');
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[PushNotificationService] Push token registration timed out');
      } else {
        console.error('[PushNotificationService] Error registering push token on login:', error);
      }
      return false;
    }
  }

  /**
   * Update push token on server
   * Requirements: 7.3 - Update token when it changes
   */
  async updatePushTokenOnServer(token: string): Promise<boolean> {
    try {
      const authToken = await TokenManager.getToken();
      
      if (!authToken) {
        console.warn('[PushNotificationService] No auth token available for push token update');
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

      console.log('[PushNotificationService] Push token updated on server successfully');
      return true;
    } catch (error) {
      console.error('[PushNotificationService] Error updating push token on server:', error);
      return false;
    }
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

      console.log('[PushNotificationService] Push token removed on logout');
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

      console.log('[PushNotificationService] Notification marked as read:', notificationId);
    } catch (error) {
      console.error('[PushNotificationService] Error marking notification as read:', error);
    }
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
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

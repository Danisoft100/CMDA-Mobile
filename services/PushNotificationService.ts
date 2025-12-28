import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

export interface NotificationData {
  ticketId?: string;
  type: 'ticket_created' | 'ticket_updated' | 'message_received' | 'ticket_resolved';
  title: string;
  body: string;
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private expoPushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

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

      // Request permissions first
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.expoPushToken = token;
        await this.savePushTokenToStorage(token);
        console.log('[PushNotificationService] Push token obtained:', token.substring(0, 20) + '...');
      }

      // Set up notification listeners (safe to do even without token)
      this.setupNotificationListeners();

      // Configure notification categories (safe operation)
      await this.configureNotificationCategories();
      
      console.log('[PushNotificationService] Initialization completed');
    } catch (error) {
      console.error('[PushNotificationService] Initialization failed:', error);
      // Don't throw - let app continue without push notifications
    }
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
   * Set up notification event listeners
   */
  private setupNotificationListeners(): void {
    // Listener for notifications received while app is running
    this.notificationListener = Notifications.addNotificationReceivedListener(
      (notification: any) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response: any) => {
        console.log('Notification response:', response);
        this.handleNotificationResponse(response);
      }
    );
  }

  /**
   * Configure notification categories with actions
   */
  private async configureNotificationCategories(): Promise<void> {
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
  }

  /**
   * Handle notification received while app is running
   */
  private handleNotificationReceived(notification: any): void {
    const { data } = notification.request.content;
    
    // Update app state based on notification type
    if (data?.type === 'ticket_updated' || data?.type === 'message_received') {
      // Dispatch action to update ticket data
      // This would integrate with your Redux store
      console.log('Updating app state for notification:', data);
    }
  }

  /**
   * Handle user tapping on notification
   */
  private handleNotificationResponse(response: any): void {
    const { actionIdentifier, notification } = response;
    const { data } = notification.request.content;

    switch (actionIdentifier) {
      case 'view_ticket':
        if (typeof data?.ticketId === 'string') {
          this.navigateToTicket(data.ticketId);
        }
        break;
      case 'mark_read':
        if (typeof data?.notificationId === 'string') {
          this.markNotificationAsRead(data.notificationId);
        }
        break;
      case 'reply':
        if (typeof data?.ticketId === 'string') {
          this.navigateToTicketReply(data.ticketId);
        }
        break;
      default:
        // Default tap - navigate to appropriate screen
        if (typeof data?.ticketId === 'string') {
          this.navigateToTicket(data.ticketId);
        } else {
          this.navigateToNotificationCenter();
        }
    }
  }

  /**
   * Send local notification (for testing or offline scenarios)
   */
  async sendLocalNotification(notificationData: NotificationData): Promise<void> {
    const { type, title, body, ticketId } = notificationData;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type, ticketId },
        categoryIdentifier: type === 'message_received' ? 'new_message' : 'support_ticket',
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
   * Update push token on server
   */
  async updatePushTokenOnServer(token: string): Promise<void> {
    try {
      const apiUrl = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://api.cmdanigeria.net';
      
      // Get auth token safely
      let authToken = null;
      try {
        authToken = await AsyncStorage.getItem('auth_token');
      } catch (e) {
        console.warn('No auth token available for push token update');
      }
      
      // Make API call to update push token with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${apiUrl}/notifications/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        },
        body: JSON.stringify({ pushToken: token, platform: Platform.OS }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Failed to update push token: ${response.status}`);
      }

      console.log('Push token updated on server successfully');
    } catch (error) {
      console.error('Error updating push token on server:', error);
      // Don't throw - this shouldn't crash the app
    }
  }

  /**
   * Save push token to local storage
   */
  private async savePushTokenToStorage(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('expo_push_token', token);
    } catch (error) {
      console.error('Failed to save push token to storage:', error);
    }
  }

  /**
   * Get stored push token
   */
  async getStoredPushToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expo_push_token');
    } catch (error) {
      console.error('Failed to retrieve push token from storage:', error);
      return null;
    }
  }

  /**
   * Navigation helpers (to be implemented with your navigation system)
   */
  private navigateToTicket(ticketId: string): void {
    // Implement navigation to specific ticket
    console.log('Navigate to ticket:', ticketId);
    // Example: NavigationService.navigate('TicketDetails', { ticketId });
  }

  private navigateToTicketReply(ticketId: string): void {
    // Implement navigation to ticket reply screen
    console.log('Navigate to ticket reply:', ticketId);
    // Example: NavigationService.navigate('TicketReply', { ticketId });
  }

  private navigateToNotificationCenter(): void {
    // Implement navigation to notification center
    console.log('Navigate to notification center');
    // Example: NavigationService.navigate('NotificationCenter');
  }

  private async markNotificationAsRead(notificationId: string): Promise<void> {
    // Implement API call to mark notification as read
    console.log('Mark notification as read:', notificationId);
  }

  /**
   * Clean up listeners
   */
  cleanup(): void {
    if (!Notifications) return;
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
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
}

export default PushNotificationService.getInstance();

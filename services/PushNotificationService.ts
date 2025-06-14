import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
      // Request permissions
      const token = await this.registerForPushNotificationsAsync();
      if (token) {
        this.expoPushToken = token;
        await this.savePushTokenToStorage(token);
        console.log('Push notification token obtained:', token);
      }

      // Set up notification listeners
      this.setupNotificationListeners();

      // Configure notification categories
      await this.configureNotificationCategories();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
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
      (notification) => {
        console.log('Notification received:', notification);
        this.handleNotificationReceived(notification);
      }
    );

    // Listener for user tapping on notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener(
      (response) => {
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
  private handleNotificationReceived(notification: Notifications.Notification): void {
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
  private handleNotificationResponse(response: Notifications.NotificationResponse): void {
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
      // Make API call to update push token
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/notifications/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await AsyncStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ pushToken: token, platform: Platform.OS }),
      });

      if (!response.ok) {
        throw new Error('Failed to update push token on server');
      }

      console.log('Push token updated on server successfully');
    } catch (error) {
      console.error('Error updating push token on server:', error);
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
    const { status } = await Notifications.getPermissionsAsync();
    return status;
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Clear all notifications
   */
  async clearAllNotifications(): Promise<void> {
    await Notifications.dismissAllNotificationsAsync();
  }

  /**
   * Set notification badge count
   */
  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }
}

export default PushNotificationService.getInstance();

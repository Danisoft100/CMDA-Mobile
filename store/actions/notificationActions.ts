// Simple action creators for notification management
// These can be enhanced later with proper async thunks and API integration

export const fetchNotifications = (params: { page?: number; limit?: number; date?: string } = {}) => ({
  type: 'notifications/fetchNotifications',
  payload: params,
});

export const markNotificationAsRead = (id: string) => ({
  type: 'notifications/markAsRead',
  payload: { id },
});

export const markAllNotificationsAsRead = () => ({
  type: 'notifications/markAllAsRead',
});

export const deleteNotification = (id: string) => ({
  type: 'notifications/deleteNotification',
  payload: { id },
});

export const getUnreadCount = () => ({
  type: 'notifications/getUnreadCount',
});

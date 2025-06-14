import axios from 'axios';
import { getToken } from '../../utils/token';
import { API_URL } from '../../constants/api';

// Action Types
export const SUPPORT_ACTIONS = {
  CREATE_TICKET_REQUEST: 'support/CREATE_TICKET_REQUEST',
  CREATE_TICKET_SUCCESS: 'support/CREATE_TICKET_SUCCESS',
  CREATE_TICKET_FAILURE: 'support/CREATE_TICKET_FAILURE',
  
  FETCH_TICKETS_REQUEST: 'support/FETCH_TICKETS_REQUEST',
  FETCH_TICKETS_SUCCESS: 'support/FETCH_TICKETS_SUCCESS',
  FETCH_TICKETS_FAILURE: 'support/FETCH_TICKETS_FAILURE',
  
  FETCH_TICKET_REQUEST: 'support/FETCH_TICKET_REQUEST',
  FETCH_TICKET_SUCCESS: 'support/FETCH_TICKET_SUCCESS',
  FETCH_TICKET_FAILURE: 'support/FETCH_TICKET_FAILURE',
  
  ADD_MESSAGE_REQUEST: 'support/ADD_MESSAGE_REQUEST',
  ADD_MESSAGE_SUCCESS: 'support/ADD_MESSAGE_SUCCESS',
  ADD_MESSAGE_FAILURE: 'support/ADD_MESSAGE_FAILURE',
  
  SEARCH_KB_REQUEST: 'support/SEARCH_KB_REQUEST',
  SEARCH_KB_SUCCESS: 'support/SEARCH_KB_SUCCESS',
  SEARCH_KB_FAILURE: 'support/SEARCH_KB_FAILURE',
  
  MARK_ARTICLE_HELPFUL_REQUEST: 'support/MARK_ARTICLE_HELPFUL_REQUEST',
  MARK_ARTICLE_HELPFUL_SUCCESS: 'support/MARK_ARTICLE_HELPFUL_SUCCESS',
  MARK_ARTICLE_HELPFUL_FAILURE: 'support/MARK_ARTICLE_HELPFUL_FAILURE',
  
  // Notification actions
  FETCH_NOTIFICATIONS_REQUEST: 'support/FETCH_NOTIFICATIONS_REQUEST',
  FETCH_NOTIFICATIONS_SUCCESS: 'support/FETCH_NOTIFICATIONS_SUCCESS',
  FETCH_NOTIFICATIONS_FAILURE: 'support/FETCH_NOTIFICATIONS_FAILURE',
  
  MARK_NOTIFICATION_READ_REQUEST: 'support/MARK_NOTIFICATION_READ_REQUEST',
  MARK_NOTIFICATION_READ_SUCCESS: 'support/MARK_NOTIFICATION_READ_SUCCESS',
  MARK_NOTIFICATION_READ_FAILURE: 'support/MARK_NOTIFICATION_READ_FAILURE',
  
  GET_UNREAD_COUNT_REQUEST: 'support/GET_UNREAD_COUNT_REQUEST',
  GET_UNREAD_COUNT_SUCCESS: 'support/GET_UNREAD_COUNT_SUCCESS',
  GET_UNREAD_COUNT_FAILURE: 'support/GET_UNREAD_COUNT_FAILURE',
};

// Create a new ticket
export const createTicket = (ticketData: any) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.CREATE_TICKET_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.post(
      `${API_URL}/support/tickets`,
      ticketData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.CREATE_TICKET_SUCCESS,
      payload: response.data,
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.CREATE_TICKET_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Fetch all tickets for the current user
export const fetchTickets = () => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.FETCH_TICKETS_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.get(
      `${API_URL}/support/tickets`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_TICKETS_SUCCESS,
      payload: response.data,
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_TICKETS_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Fetch a specific ticket by ID
export const fetchTicket = (ticketId: string) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.FETCH_TICKET_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.get(
      `${API_URL}/support/tickets/${ticketId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_TICKET_SUCCESS,
      payload: response.data,
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_TICKET_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Add a message to a ticket
export const addMessage = (ticketId: string, messageData: any) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.ADD_MESSAGE_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.post(
      `${API_URL}/support/tickets/${ticketId}/messages`,
      messageData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.ADD_MESSAGE_SUCCESS,
      payload: { ...response.data, ticketId },
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.ADD_MESSAGE_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Search knowledge base
export const searchKnowledgeBase = (query: string) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.SEARCH_KB_REQUEST });
  
  try {
    const response = await axios.get(
      `${API_URL}/knowledge-base/search`,
      {
        params: { q: query },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.SEARCH_KB_SUCCESS,
      payload: { articles: response.data, query },
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.SEARCH_KB_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Mark article as helpful
export const markArticleHelpful = (articleId: number, isHelpful: boolean) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.MARK_ARTICLE_HELPFUL_REQUEST });
  
  try {
    const response = await axios.post(
      `${API_URL}/knowledge-base/articles/${articleId}/helpful`,
      { isHelpful }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.MARK_ARTICLE_HELPFUL_SUCCESS,
      payload: { articleId, isHelpful },
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.MARK_ARTICLE_HELPFUL_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Fetch notifications
export const fetchNotifications = (filters: any = {}) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.get(
      `${API_URL}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: filters,
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_SUCCESS,
      payload: response.data,
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = (notificationId: number) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.patch(
      `${API_URL}/notifications/${notificationId}/read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_SUCCESS,
      payload: { notificationId, notification: response.data },
    });
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = () => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.patch(
      `${API_URL}/notifications/mark-all-read`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_SUCCESS,
      payload: response.data,
    });
    
    // Refresh notifications
    dispatch(fetchNotifications());
    
    return response.data;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Delete notification
export const deleteNotification = (notificationId: number) => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_REQUEST });
  
  try {
    const token = await getToken();
    
    await axios.delete(
      `${API_URL}/notifications/${notificationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_SUCCESS,
      payload: { deletedNotificationId: notificationId },
    });
    
    // Refresh notifications
    dispatch(fetchNotifications());
    
    return { success: true };
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

// Get unread count
export const getUnreadCount = () => async (dispatch: any) => {
  dispatch({ type: SUPPORT_ACTIONS.GET_UNREAD_COUNT_REQUEST });
  
  try {
    const token = await getToken();
    
    const response = await axios.get(
      `${API_URL}/notifications/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    
    dispatch({
      type: SUPPORT_ACTIONS.GET_UNREAD_COUNT_SUCCESS,
      payload: response.data.count,
    });
    
    return response.data.count;
  } catch (error: any) {
    let errorMessage = 'An error occurred';
    if (error && typeof error === 'object' && 'response' in error && error.response?.data?.message) {
      errorMessage = error.response.data.message;
    }
    dispatch({
      type: SUPPORT_ACTIONS.GET_UNREAD_COUNT_FAILURE,
      payload: errorMessage,
    });
    
    throw error;
  }
};

import { SUPPORT_ACTIONS } from '../actions/supportActions';

const initialState = {
  tickets: [],
  currentTicket: null as any,
  messages: {} as { [ticketId: string]: any[] },
  knowledgeBase: {
    articles: [] as any[],
    searchQuery: '',
    loading: false,
  },
  notifications: {
    items: [] as any[],
    unreadCount: 0,
    loading: false,
  },
  loading: false,
  error: null,
};

export default function supportReducer(state = initialState, action: any) {
  switch (action.type) {
    // Create Ticket
    case SUPPORT_ACTIONS.CREATE_TICKET_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SUPPORT_ACTIONS.CREATE_TICKET_SUCCESS:
      return {
        ...state,
        tickets: [action.payload, ...state.tickets],
        loading: false,
      };
    case SUPPORT_ACTIONS.CREATE_TICKET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch Tickets
    case SUPPORT_ACTIONS.FETCH_TICKETS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SUPPORT_ACTIONS.FETCH_TICKETS_SUCCESS:
      return {
        ...state,
        tickets: action.payload,
        loading: false,
      };
    case SUPPORT_ACTIONS.FETCH_TICKETS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch Single Ticket
    case SUPPORT_ACTIONS.FETCH_TICKET_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SUPPORT_ACTIONS.FETCH_TICKET_SUCCESS:
      return {
        ...state,
        currentTicket: action.payload,
        loading: false,
      };
    case SUPPORT_ACTIONS.FETCH_TICKET_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Add Message
    case SUPPORT_ACTIONS.ADD_MESSAGE_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };
    case SUPPORT_ACTIONS.ADD_MESSAGE_SUCCESS: {
      const { ticketId } = action.payload;
      const updatedMessages = state.messages[ticketId] 
        ? [...state.messages[ticketId], action.payload] 
        : [action.payload];
      
      // Update current ticket if it's the same one
      let updatedCurrentTicket = state.currentTicket;
      if (state.currentTicket && state.currentTicket.id === ticketId) {
        updatedCurrentTicket = {
          ...state.currentTicket,
          messages: [
            ...(state.currentTicket.messages || []),
            action.payload,
          ],
        };
      }
      
      return {
        ...state,
        messages: {
          ...state.messages,
          [ticketId]: updatedMessages,
        },
        currentTicket: updatedCurrentTicket,
        loading: false,
      };
    }
    case SUPPORT_ACTIONS.ADD_MESSAGE_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Search Knowledge Base
    case SUPPORT_ACTIONS.SEARCH_KB_REQUEST:
      return {
        ...state,
        knowledgeBase: {
          ...state.knowledgeBase,
          loading: true,
        },
      };
    case SUPPORT_ACTIONS.SEARCH_KB_SUCCESS:
      return {
        ...state,
        knowledgeBase: {
          articles: action.payload.articles,
          searchQuery: action.payload.query,
          loading: false,
        },
      };
    case SUPPORT_ACTIONS.SEARCH_KB_FAILURE:
      return {
        ...state,
        knowledgeBase: {
          ...state.knowledgeBase,
          loading: false,
        },
        error: action.payload,
      };

    // Mark Article Helpful
    case SUPPORT_ACTIONS.MARK_ARTICLE_HELPFUL_REQUEST:
      return {
        ...state,
        loading: true,
      };
    case SUPPORT_ACTIONS.MARK_ARTICLE_HELPFUL_SUCCESS:
      return {
        ...state,
        loading: false,        knowledgeBase: {
          ...state.knowledgeBase,
          articles: state.knowledgeBase.articles.map((article: any) =>
            article.id === action.payload.articleId
              ? { 
                  ...article, 
                  helpful_count: action.payload.isHelpful 
                    ? article.helpful_count + 1 
                    : article.helpful_count - 1 
                }
              : article
          ),
        },
      };
    case SUPPORT_ACTIONS.MARK_ARTICLE_HELPFUL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    // Fetch Notifications
    case SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_REQUEST:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          loading: true,
        },
        error: null,
      };
    case SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_SUCCESS:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: action.payload.notifications || [],
          loading: false,
        },
      };
    case SUPPORT_ACTIONS.FETCH_NOTIFICATIONS_FAILURE:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          loading: false,
        },
        error: action.payload,
      };

    // Mark Notification as Read
    case SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_REQUEST:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          loading: true,
        },
        error: null,
      };
    case SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_SUCCESS:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          items: state.notifications.items.map((notification: any) =>
            notification.id === action.payload.notificationId
              ? { ...notification, is_read: true }
              : notification
          ),
          unreadCount: Math.max(0, state.notifications.unreadCount - 1),
          loading: false,
        },
      };
    case SUPPORT_ACTIONS.MARK_NOTIFICATION_READ_FAILURE:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          loading: false,
        },
        error: action.payload,
      };

    // Get Unread Count
    case SUPPORT_ACTIONS.GET_UNREAD_COUNT_REQUEST:
      return {
        ...state,
        error: null,
      };
    case SUPPORT_ACTIONS.GET_UNREAD_COUNT_SUCCESS:
      return {
        ...state,
        notifications: {
          ...state.notifications,
          unreadCount: action.payload,
        },
      };
    case SUPPORT_ACTIONS.GET_UNREAD_COUNT_FAILURE:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
}

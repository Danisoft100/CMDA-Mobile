// Base API - must be imported first
import api from './api';

// Import all API endpoints to ensure they are injected into the base API
// This prevents "Cannot read property 'S' of undefined" errors
// These imports register the endpoints with RTK Query
import './authApi';
import './chatsApi';
import './eventsApi';
import './faithApi';
import './membersApi';
import './notificationsApi';
import './paymentsApi';
import './productsApi';
import './profileApi';
import './resourcesApi';
import './volunteerApi';

// Export the configured API
export default api;


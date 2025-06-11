export const getNetworkErrorMessage = (error: any): string => {
  if (!error) return 'An unexpected error occurred';
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('Network request failed')) {
    return 'Network connection failed. Please check your internet connection.';
  }
  
  // HTTP errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return error.data?.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission for this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return error.data?.message || 'This action has already been completed.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return error.data?.message || `Error ${error.status}: Something went wrong.`;
    }
  }
  
  // Other errors
  if (error.message) {
    return error.message;
  }
  
  if (error.data?.message) {
    return Array.isArray(error.data.message) 
      ? error.data.message.join(', ') 
      : error.data.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const isNetworkError = (error: any): boolean => {
  return (
    error?.name === 'TypeError' && 
    error?.message?.includes('Network request failed')
  ) || (
    error?.code === 'NETWORK_ERROR'
  ) || (
    error?.status === undefined && error?.message?.includes('fetch')
  );
};

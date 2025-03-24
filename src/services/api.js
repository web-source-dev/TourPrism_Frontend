import axios from 'axios';

const API_URL = 'https://tourprism-backend.onrender.com';
// const API_URL = 'http://localhost:5000';
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const getErrorMessage = (error) => {
  // Handle network errors
  if (!error.response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  // Handle specific error messages from backend
  const backendMessage = error.response?.data?.message;
  if (backendMessage) {
    // Map backend messages to user-friendly messages
    const messageMap = {
      'Invalid credentials': 'The email or password you entered is incorrect.',
      'User already exists': 'An account with this email already exists.',
      'User not found': 'No account found with this email address.',
      'Invalid or expired OTP': 'The verification code is invalid or has expired.',
      'Email already verified': 'Your email is already verified.',
      'Please wait before requesting another OTP': 'Please wait a moment before requesting another verification code.',
      'This email is registered with Google. Please continue with Google login.': 'This email is linked to a Google account. Please use Google Sign In instead.',
    };
    return messageMap[backendMessage] || backendMessage;
  }

  // Default error message
  return 'Something went wrong. Please try again later.';
};

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const googleLogin = () => {
  window.location.href = `${API_URL}/auth/google`;
};

export const handleGoogleCallback = async (token) => {
  if (token) {
    localStorage.setItem('token', token);
    // Fetch user data using the token
    try {
      const response = await api.get('/auth/user/profile');
      localStorage.setItem('user', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/';
};

export const forgotPassword = async (data) => {
  try {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

// Add this to your interceptors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login if token is expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Update verifyOTP function
export const verifyOTP = async (data) => {
  try {
    const response = await api.post('/auth/verify-email', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const verifyResetOTP = async (data) => {
  try {
    const response = await api.post('/auth/verify-reset-otp', data);
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const resetPassword = async (data) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const resendOTP = async (data) => {
  try {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

export const resendResetOTP = async (data) => {
  try {
    const response = await api.post('/auth/resend-reset-otp', data);
    return response.data;
  } catch (error) {
    throw { message: getErrorMessage(error) };
  }
};

// Alert related API calls
export const createAlert = async (formData) => {
  try {
    // Create a FormData object for file uploads
    const alertData = new FormData();
    
    // Add text fields
    alertData.append('incidentType', formData.incidentType);
    if (formData.incidentType === 'Other') {
      alertData.append('otherType', formData.otherType);
    }
    alertData.append('location', formData.location);
    alertData.append('latitude', formData.latitude);
    alertData.append('longitude', formData.longitude);
    alertData.append('city', formData.city);
    alertData.append('description', formData.description);
    
    // Add media files - ensure we're appending the actual file objects
    if (formData.media && formData.media.length > 0) {
      formData.media.forEach((mediaItem) => {
        if (mediaItem.file) {
          alertData.append('media', mediaItem.file);
        }
      });
    }
    
    const response = await api.post('/api/alerts/create', alertData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const getAlerts = async (filters = {}) => {
  try {
    const response = await api.get('/api/alerts', { params: filters });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const getAlertById = async (alertId) => {
  try {
    const response = await api.get(`/api/alerts/${alertId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const getUserAlerts = async () => {
  try {
    const response = await api.get('/api/alerts/user/my-alerts');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};


export const fetchAlerts = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Location filters
    if (params.city) {
      queryParams.append('city', params.city);
    }
    if (params.latitude && params.longitude) {
      // Ensure coordinates are numbers
      queryParams.append('latitude', Number(params.latitude).toFixed(6));
      queryParams.append('longitude', Number(params.longitude).toFixed(6));
      
      // Only append distance if coordinates are present
      if (params.distance && params.distance > 0) {
        queryParams.append('distance', Number(params.distance));
      }
    }

    // Time range filters
    if (params.startDate) {
      queryParams.append('startDate', params.startDate);
    }
    if (params.endDate) {
      queryParams.append('endDate', params.endDate);
    }

    // Incident type filters
    if (params.incidentTypes && params.incidentTypes.length > 0) {
      params.incidentTypes.forEach(type => {
        queryParams.append('incidentTypes[]', type);
      });
    }

    // Pagination
    queryParams.append('limit', params.limit || 20);
    queryParams.append('page', params.page || 1);

    // Sorting
    if (params.sortBy) {
      queryParams.append('sortBy', params.sortBy);
      queryParams.append('sortOrder', params.sortOrder || 'desc');
    }
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/alerts?${queryString}` : '/api/alerts';
    
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching alerts:', error);
    throw error.response?.data || {
      message: 'Failed to fetch alerts. Please try again later.',
      error: error.message
    };
  }
};

export const getNotifications = async () => {
  try {
    const response = await api.get('/api/notifications');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error fetching notifications' };
  }
};

export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking notification as read' };
  }
};

export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(`/api/notifications/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error deleting notification' };
  }
};

// Add new function to mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/api/notifications/mark-all-read');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Error marking all notifications as read' };
  }
};
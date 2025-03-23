import axios from 'axios';

// const API_URL = 'https://tourprism-backend.onrender.com';
const API_URL = 'http://localhost:5000';
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

export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
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
    throw error.response?.data || { message: 'An error occurred' };
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
};

export const forgotPassword = async (data) => {
  try {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const verifyOTP = async (data) => {
  try {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const verifyResetOTP = async (data) => {
    try {
      const response = await api.post('/auth/verify-reset-otp', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'An error occurred' };
    }
  };
export const resetPassword = async (data) => {
  try {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const resendOTP = async (data) => {
  try {
    const response = await api.post('/auth/resend-otp', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred' };
  }
};

export const resendResetOTP = async (data) => {
  try {
    const response = await api.post('/auth/resend-reset-otp', data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'An error occurred while resending OTP' };
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


export const fetchAlerts = async (locationParams = {}) => {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    if (locationParams.city) {
      queryParams.append('city', locationParams.city);
    }
    
    if (locationParams.latitude && locationParams.longitude) {
      queryParams.append('latitude', locationParams.latitude);
      queryParams.append('longitude', locationParams.longitude);
    }
    
    // Set default limit and page if needed
    queryParams.append('limit', locationParams.limit || 20);
    queryParams.append('page', locationParams.page || 1);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/api/alerts?${queryString}` : '/api/alerts';
    
    console.log("API request endpoint:", `${API_URL}${endpoint}`);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API error response:", errorText);
      throw new Error(`Failed to fetch alerts: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log("API response data:", data);
    return data;
  } catch (error) {
    console.error("Error in fetchAlerts:", error);
    throw error;
  }
};
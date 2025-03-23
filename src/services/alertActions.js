import axios from 'axios';

// const API_URL = 'https://tourprism-backend.onrender.com';
const API_URL = 'http://localhost:5000/api';
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
  
export const likeAlert = async (alertId) => {
  try {
    const response = await api.post(`/alerts/${alertId}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const shareAlert = async (alertId) => {
  try {
    const response = await api.post(`/alerts/${alertId}/share`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const flagAlert = async (alertId) => {
  try {
    const response = await api.post(`/alerts/${alertId}/flag`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
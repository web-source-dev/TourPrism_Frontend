// Remove the existing interceptor and import the api instance from api.js
import { api } from './api';

export const likeAlert = async (alertId) => {
  try {
    const response = await api.post(`/api/alerts/${alertId}/like`);
    return {
      likes: response.data.likes,
      liked: response.data.liked
    };
  } catch (error) {
    throw error;
  }
};

export const flagAlert = async (alertId) => {
  try {
    const response = await api.post(`/api/alerts/${alertId}/flag`);
    return {
      flagged: response.data.flagged
    };
  } catch (error) {
    throw error;
  }
};

export const shareAlert = async (alertId) => {
  try {
    const response = await api.post(`/api/alerts/${alertId}/share`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

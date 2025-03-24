import axios from 'axios';

const API_URL = 'https://tourprism-backend.onrender.com/api';
// const API_URL = 'http://localhost:5000/api';

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

export const uploadBulkAlerts = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/bulk-alerts/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const downloadTemplate = async () => {
  try {
    const response = await api.get('/bulk-alerts/template', {
      responseType: 'blob',
    });

    // Create a download link and trigger it
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'alert-template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
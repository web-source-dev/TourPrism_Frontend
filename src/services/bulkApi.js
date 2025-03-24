// Remove the existing interceptor and import the api instance from api.js
import { api } from './api';

export const uploadBulkAlerts = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/api/bulk-alerts/upload', formData, {
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
    const response = await api.get('/api/bulk-alerts/template', {
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
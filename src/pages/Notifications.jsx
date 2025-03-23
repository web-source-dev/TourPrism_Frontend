import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Button, Divider } from '@mui/material';
import { getNotifications, markAsRead, deleteNotification } from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(notif => 
        notif._id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(notif => notif._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Notifications</Typography>
      
      {notifications.map((notification) => (
        <Card 
          key={notification._id} 
          sx={{ 
            mb: 2, 
            bgcolor: notification.isRead ? 'white' : '#f0f7ff'
          }}
        >
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6">{notification.title}</Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>{notification.message}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {new Date(notification.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Box>
                {!notification.isRead && (
                  <Button 
                    size="small" 
                    onClick={() => handleMarkAsRead(notification._id)}
                    sx={{ mr: 1 }}
                  >
                    Mark as read
                  </Button>
                )}
                <IconButton 
                  size="small" 
                  onClick={() => handleDelete(notification._id)}
                  color="error"
                >
                  <i className="ri-delete-bin-line"></i>
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      ))}

      {notifications.length === 0 && (
        <Typography variant="body1" textAlign="center" color="text.secondary">
          No notifications yet
        </Typography>
      )}
    </Box>
  );
};

export default Notifications;
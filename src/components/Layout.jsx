import React, { useEffect, useState } from 'react';
// Add Badge to the imports from MUI
import { Box, AppBar, Toolbar, Typography, Container, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, Button, Badge } from '@mui/material';
import { Link } from 'react-router-dom';
import { logout } from '../services/api';

// Add these imports at the top
import NotificationDrawer from './NotificationDrawer';
import { getNotifications } from '../services/api';
import { NotificationAddOutlined, NotificationsNone } from '@mui/icons-material';

const Layout = ({ children, isFooter = true }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Add fetchNotifications function
  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Add useEffect to fetch notifications when logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

  // Add this line to calculate unread notifications
  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(token ? true : false);
  }, []);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = isLoggedIn ? [
    { text: 'Feed', icon: 'ri-home-line', path: '/feed' },
    { text: 'Post Alert', icon: 'ri-notification-line', path: '/post-alert' },
    { text: 'My Alerts', icon: 'ri-notification-line', path: '/my-alerts' },
    { text: 'Insights', icon: 'ri-line-chart-line', path: '/insights' },
    { text: 'Rewards', icon: 'ri-gift-line', path: '/rewards' },
    { text: 'Subscription', icon: 'ri-vip-crown-line', path: '/subscription' },
    { text: 'Settings', icon: 'ri-settings-line', path: '/settings' },
    { text: 'Logout', icon: 'ri-logout-box-line', path: '/' }
  ] : [
    { text: 'About', icon: 'ri-information-line', path: '/about' },
    { text: 'Post Alert', icon: 'ri-notification-line', path: '/post-alert' },
    { text: 'Ambassadors', icon: 'ri-team-line', path: '/ambassadors' },
    { text: 'Pricing', icon: 'ri-price-tag-3-line', path: '/pricing' },
    { text: 'Login', icon: 'ri-login-box-line', path: '/login' }
  ];


  const drawer = (
    <Box sx={{ width: 300 }}>
      <Box sx={{ p: 3, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
        <Typography onClick={handleDrawerToggle} >X</Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            component={Link}
            to={item.path}
            key={item.text}
            onClick={() => setMobileOpen(false)}
            sx={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '18px',
                height: '35px',
                fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#f5f5f5'
              }
            }}
          >
             <ListItemText 
    primary={item.text} 
    onClick={() => item.text === "Logout" ? logout() : null} 
    sx={{ cursor: item.text === "Logout" ? 'pointer' : 'default' }} 
  />

          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', p:0,m:0}}>
      <AppBar position="static" sx={{ bgcolor: 'white', boxShadow: 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{display: 'flex', gap:1}}>
                                  {/* Mobile menu icon */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' }, color: 'black' }}
          >
            <i className="ri-menu-2-line" style={{ fontSize: '24px' }}></i>
          </IconButton>

          <Typography
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontWeight: 'bold',
              fontSize: '24px',
              color: 'black',
              textDecoration: 'none'
            }}
          >
            <span style={{ color: '#0066FF' }}>t</span>
          </Typography>
          
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {!isLoggedIn && (  <Link
            to="/post-alert"
            style={{
              color: 'black',
              textDecoration: 'underline',
              fontSize: '16px',
              '&:hover': {
                color: '#0066FF'
              }
            }}
          >
            Post Alert <i className="ri-arrow-right-up-line"></i>
          </Link>
          )}
          {isLoggedIn && (
            <IconButton
              onClick={() => setNotificationDrawerOpen(true)}
              sx={{ color: 'black' }}
            >
              <Badge badgeContent={unreadCount} color="error">
               <NotificationsNone />
              </Badge>
            </IconButton>
          )}
        </Box>
          {/* Desktop navigation */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 2 }}>
            <Link
              to="/login"
              style={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '16px',
                '&:hover': {
                  color: '#0066FF'
                }
              }}
            >
              Login
            </Link>
            <Link
              to="/signup"
              style={{
                color: 'black',
                textDecoration: 'none',
                fontSize: '16px',
                '&:hover': {
                  color: '#0066FF'
                }
              }}
            >
              Sign Up
            </Link>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 300 }
        }}
      >
        {drawer}
      </Drawer>

      <Container component="main" sx={{ flex: 1, py: 4 ,px:0 }}>
        {children}
      </Container>

      {isFooter && (
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 0,
            mt: 'auto',
            bgcolor: 'white',
            borderTop: '1px solid #e0e0e0'
          }}
        >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: 3 }}>


            {/* Navigation Links */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, md: 6 }, alignItems: { xs: 'flex-start', md: 'flex-start' } }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: 1 }}>
                <Link to="/about" style={{ fontSize:'14px',color: '#000', textDecoration: 'none' }}>About</Link>
                <Link to="/post-alert" style={{ fontSize:'14px',color: '#000', textDecoration: 'none' }}>Post Alert</Link>
                <Link to="/ambassadors" style={{ fontSize:'14px',color: '#000', textDecoration: 'none' }}>Ambassadors</Link>
                <Link to="/pricing" style={{ fontSize:'14px',color: '#000', textDecoration: 'none' }}>Pricing</Link>
                <Link to="/privacy-policy" style={{ fontSize:'14px',color: '#000', textDecoration: 'none' }}>Privacy Policy</Link>
                <Link to="/terms" style={{ fontSize:'14px',color: '#000', textDecoration: 'none' }}>Terms of Use</Link>
              </Box>
            </Box>
          </Box>
                      {/* Logo and Social Links */}
                      <Box sx={{ display: 'flex',mt:3, flexDirection: 'column', alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: 2 }}>
              <Typography
                component={Link}
                to="/"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  fontSize: '18px',
                  color: 'black',
                  textDecoration: 'none'
                }}
              >
                <span style={{ color: '#0066FF' ,
                  fontWeight: 'bold',fontSize:'24px'}}>t</span> tourprism
              </Typography>
              <Box sx={{ display: 'flex', gap: 2,alignItems:'center' }}>
                <Link to="mailto:info@tourprism.com" style={{ color: 'black',textDecoration:'none' }}>
                  <i className="ri-mail-fill" style={{ fontSize: '24px',color:'#666' }}></i>
                </Link>
                <Link to="https://linkedin.com" target="_blank" style={{ color: 'black',textDecoration:'none'  }}>
                  <i className="ri-linkedin-box-fill" style={{ fontSize: '27px',color:'#666' }}></i>
                </Link>
                <Link to="https://twitter.com" target="_blank" style={{ color: 'white',textDecoration:'none',backgroundColor:'#666',borderRadius:'5px',height:'22px'}}>
                  <i className="ri-twitter-x-fill" style={{ fontSize: '20px'}}></i>
                </Link>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                © 2025. Tourprism Limited. <br /> Made in Scotland.
              </Typography>
            </Box>
        </Container>
      </Box>
    )}
    
<NotificationDrawer
  open={notificationDrawerOpen}
  onClose={() => setNotificationDrawerOpen(false)}
  notifications={notifications}
  onNotificationUpdate={fetchNotifications}
/>
    </Box>
  );
};

export default Layout;

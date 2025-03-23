import React, { useEffect, useState } from 'react';
import { Box, AppBar, Toolbar, Typography, Container, Drawer, IconButton, List, ListItem, ListItemIcon, ListItemText, Divider, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { logout } from '../services/api';

const Layout = ({ children, isFooter = true }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // TODO: Replace with actual auth state


  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(token ? true : false);
  }, []);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = isLoggedIn ? [
    { text: 'Feed', icon: 'ri-home-line', path: '/feed' },
    { text: 'My Alerts', icon: 'ri-notification-line', path: '/my-alerts' },
    { text: 'Insights', icon: 'ri-line-chart-line', path: '/insights' },
    { text: 'Rewards', icon: 'ri-gift-line', path: '/rewards' },
    { text: 'Notifications', icon: 'ri-notification-line', path: '/notifications' },
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
            <i className="ri-menu-line" style={{ fontSize: '24px' }}></i>
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
        <Link
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
            px: 2,
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
                <Link to="/about" style={{ color: '#000', textDecoration: 'none' }}>About</Link>
                <Link to="/post-alert" style={{ color: '#000', textDecoration: 'none' }}>Post Alert</Link>
                <Link to="/ambassadors" style={{ color: '#000', textDecoration: 'none' }}>Ambassadors</Link>
                <Link to="/pricing" style={{ color: '#000', textDecoration: 'none' }}>Pricing</Link>
                <Link to="/privacy-policy" style={{ color: '#000', textDecoration: 'none' }}>Privacy Policy</Link>
                <Link to="/terms" style={{ color: '#000', textDecoration: 'none' }}>Terms of Use</Link>
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
                  fontWeight: 'bold',
                  fontSize: '24px',
                  color: 'black',
                  textDecoration: 'none'
                }}
              >
                <span style={{ color: '#0066FF' }}>t</span> tourprism
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link to="mailto:info@tourprism.com" style={{ color: 'black' }}>
                  <i className="ri-mail-line" style={{ fontSize: '24px' }}></i>
                </Link>
                <Link to="https://linkedin.com" target="_blank" style={{ color: 'black' }}>
                  <i className="ri-linkedin-box-line" style={{ fontSize: '24px' }}></i>
                </Link>
                <Link to="https://twitter.com" target="_blank" style={{ color: 'black' }}>
                  <i className="ri-twitter-x-line" style={{ fontSize: '24px' }}></i>
                </Link>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                © 2025. Tourprism Limited. <br /> Made in Scotland.
              </Typography>
            </Box>
        </Container>
      </Box>
    )}
    </Box>
  );
};

export default Layout;
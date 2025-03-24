import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

const NotFound = () => {
  const navigate = useNavigate();

  return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 3
        }}
      >
        <Typography variant="h1" sx={{ fontSize: '120px', fontWeight: 'bold', color: '#000' }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Oops! Page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '350px' }}>
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          sx={{
            bgcolor: 'black',
            '&:hover': { bgcolor: '#333' },
            px: 4,
            py: 1.5,
            borderRadius: 2
          }}
        >
          Back to Home
        </Button>
      </Box>
  );
};

export default NotFound;
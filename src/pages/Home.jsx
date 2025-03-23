import React from 'react';
import { Box, Typography, Container, Grid, Button, Divider } from '@mui/material';
import Layout from '../components/Layout';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  return (
    <Layout>
      <Container>
        {/* Hero Section */}
        <Box sx={{
          pt: { xs: 4, md: 8 },
          pb: { xs: 6, md: 10 },
          textAlign: { xs: 'left', md: 'center' }
        }}>
          <Typography variant="h1" sx={{
            fontSize: { xs: '2.5rem', md: '3.5rem' },
            fontWeight: 'bold',
            mb: 2
          }}>
            Personalized
            <br />
            Travel Safety insights.
          </Typography>
          <Typography variant="body1" sx={{
            fontSize: { xs: '1rem', md: '1.2rem' },
            color: 'text.secondary',
            mb: 4
          }}>
            Access real-time, hyperlocal safety alerts and insights – built for businesses, travelers, and local communities.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/signup')}
            sx={{
              bgcolor: 'black',
              borderRadius: 8,
              py: 1.5,
              px: 4,
              '&:hover': {
                bgcolor: '#333'
              }
            }}
          >
            Try It Free
          </Button>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {/* What You Get Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Typography variant="h2" sx={{
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 'bold',
            mb: 4
          }}>
            What You Get
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <i className="ri-alert-line" style={{ fontSize: '24px' }}></i>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Emerging Threat Alerts
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Instant alerts on scams, frauds, and crimes near you.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <i className="ri-error-warning-line" style={{ fontSize: '24px' }}></i>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Travel Disruption Updates
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Real-time feed on cancellations, closures, and transport risks.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <i className="ri-line-chart-line" style={{ fontSize: '24px' }}></i>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Safety Insights
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Location-based data, predictive analytics, and custom reports.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {/* How It Works Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Typography variant="h2" sx={{
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 'bold',
            mb: 4
          }}>
            How It Works?
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box sx={{ px: '15px', py:1, bgcolor: 'background.paper', borderRadius: 2 ,border: '1px solid #ddd',}}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Step 1: Choose Your Role
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create an account and select your role – Contributor, Ambassador, or Business User.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ px: '15px', py:1, bgcolor: 'background.paper', borderRadius: 2 ,border: '1px solid #ddd',}}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Step 2: Set Your Preferences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Choose locations, alert types, frequency, and delivery methods to receive relevant updates.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ px: '15px', py:1, bgcolor: 'background.paper', borderRadius: 2 ,border: '1px solid #ddd',}}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Step 3: Start Receiving Alerts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Travelers receive unlimited free alerts. Business users can unlock premium features for tailored insights.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <Divider sx={{ mb: 4 }} />

        {/* Why Choose Us Section */}
        <Box sx={{ py: { xs: 4, md: 8 } }}>
          <Typography variant="h2" sx={{
            fontSize: { xs: '1.75rem', md: '2.5rem' },
            fontWeight: 'bold',
            mb: 4
          }}>
            Why Choose Us?
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <i className="ri-focus-3-line" style={{ fontSize: '24px' }}></i>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Unmatched Relevance
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Using geo-data technologies and local expertise, we deliver hyperlocal, actionable safety information that's most relevant to you.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <i className="ri-shield-check-line" style={{ fontSize: '24px' }}></i>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Exceptional Accuracy
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Our AI pre-verification, local community validation, and feedback loops ensure you receive rigorously verified and accurate safety information.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <i className="ri-plug-line" style={{ fontSize: '24px' }}></i>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Effortless Integration
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Simply signup and start receiving alerts and insights via email, dashboard, or WhatsApp – no complex setup or integration needed.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;
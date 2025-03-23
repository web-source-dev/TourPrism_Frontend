import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Divider, Alert, Snackbar } from '@mui/material';
import { createAlert } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AlertSubmissionSuccess from '../components/AlertSubmissionSuccess';

const PostAlert = () => {
  const [formData, setFormData] = useState({
    incidentType: '',
    otherType: '',
    location: '',
    latitude: null,
    longitude: null,
    city: '',
    description: '',
    media: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showDropdown, setShowDropdown] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const navigate = useNavigate();

  const incidentTypes = [
    'Scam',
    'Theft',
    'Crime',
    'Weather',
    'Public Disorder',
    'Other'
  ];
  console.log("formData",formData)

  // Check if user is logged in when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setErrorMessage('Please login to post an alert');
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/login', { state: { from: '/post-alert', message: 'You need to be logged in to post an alert' } });
      }, 2000);
    }
  }, [navigate]);

  useEffect(() => {
    // Check if Google Maps script is loaded
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeAutocomplete;
      document.head.appendChild(script);
    };
    const initializeAutocomplete = () => {
        const input = document.getElementById('location-input');
        if (window.google && input) {
          const autocomplete = new window.google.maps.places.Autocomplete(input, {
            types: ['geocode'],
            fields: ['formatted_address', 'geometry', 'address_components'],
          });
      
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (place.formatted_address && place.geometry) {
              // Extract latitude and longitude
              const lat = place.geometry.location.lat();
              const lng = place.geometry.location.lng();
      
              // Extract city from address components
              let city = '';
              place.address_components.forEach((component) => {
                if (component.types.includes('locality')) {
                  city = component.long_name;
                }
              });
      
              // Update state with location details
              setFormData(prev => ({
                ...prev,
                location: place.formatted_address,
                latitude: lat,
                longitude: lng,
                city: city,
              }));
      
              // Clear errors if location was previously invalid
              if (errors.location) {
                setErrors(prev => ({ ...prev, location: '' }));
              }
            }
          });
        }
      };
      
    // Check if script is already loaded
    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      initializeAutocomplete();
    }

    return () => {
      // Cleanup if needed
      const script = document.querySelector('script[src*="maps.googleapis.com/maps/api"]');
      if (script) {
        script.remove();
      }
    };
  }, [errors.location]);
  const handleIncidentTypeSelect = (type) => {
    setFormData(prev => ({ ...prev, incidentType: type }));
    setShowDropdown(false);
    if (errors.incidentType) {
      setErrors(prev => ({ ...prev, incidentType: '' }));
    }
  };

  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.media.length + files.length > 5) {
      alert('You can only upload up to 5 files');
      return;
    }
    const newMedia = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia]
    }));
  };

  const handleDeleteMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.incidentType) {
      newErrors.incidentType = 'Please select an incident type';
    }
    
    if (formData.incidentType === 'Other' && !formData.otherType.trim()) {
      newErrors.otherType = 'Please specify the incident type';
    }
    
    if (!formData.location) {
      newErrors.location = 'Please enter a location';
    }
    
    if (!formData.latitude || !formData.longitude) {
      newErrors.location = 'Please select a valid location from the dropdown';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Please describe the incident';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Double-check if user is logged in
      const token = localStorage.getItem('token');
      if (!token) {
        setErrorMessage('Please login to post an alert');
        setTimeout(() => {
          navigate('/login', { state: { from: '/post-alert' } });
        }, 2000);
        return;
      }
      
      const response = await createAlert(formData);
      // Instead of showing a snackbar, show the success screen
      setShowSuccessScreen(true);
      
    } catch (error) {
      console.error('Error submitting alert:', error);
      
      // Handle specific error messages
      if (error.message === 'Invalid token' || error.message === 'No token provided') {
        setErrorMessage('Your session has expired. Please login again.');
        setTimeout(() => {
          navigate('/login', { state: { from: '/post-alert' } });
        }, 2000);
      } else {
        setErrorMessage(error.message || 'Failed to submit alert. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostAnotherAlert = () => {
    // Reset form and hide success screen
    setFormData({
      incidentType: '',
      otherType: '',
      location: '',
      latitude: null,
      longitude: null,
      city: '',
      description: '',
      media: []
    });
    setShowSuccessScreen(false);
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
    setErrorMessage('');
  };

  // If showing success screen, render that instead of the form
  if (showSuccessScreen) {
    return <AlertSubmissionSuccess onPostAnother={handlePostAnotherAlert} />;
  }

  return (
    <Box sx={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '50px 20px'
    }}>
      {!localStorage.getItem('token') ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Authentication Required
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            You need to be logged in to post a safety alert.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/login', { state: { from: '/post-alert' } })}
            sx={{
              bgcolor: 'black',
              color: 'white',
              py: 1.5,
              px: 4,
              borderRadius: 8,
              '&:hover': {
                bgcolor: '#333',
              },
            }}
          >
            Go to Login
          </Button>
        </Box>
      ) : (
        <>
          <Typography variant="h5" sx={{ fontWeight:'bold', mb: 2 }}>
            Post a Safety Alert
          </Typography>
          <Typography variant="body2" sx={{ mb: 4, color: 'text.secondary' }}>
            Your alert could save someone's day – Help us keep the travel community safe and informed.
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Incident Type Dropdown */}
            <Box sx={{ mb: 2, position: 'relative' }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                What type of incident is this?
              </Typography>
              <Box
                onClick={() => setShowDropdown(!showDropdown)}
                sx={{
                  border: '1px solid',
                  borderColor: errors.incidentType ? 'error.main' : 'grey.300',
                  borderRadius: 2,
                  p: 1,
                  cursor: 'pointer',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <Typography>
                  {formData.incidentType || 'Please Select'}
                </Typography>
                <i className={`ri-arrow-${showDropdown ? 'up' : 'down'}-s-line`}></i>
              </Box>

              {showDropdown && (
                <Box sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: '#ccc',
                  boxShadow: 2,
                  borderRadius: 1,
                  zIndex: 1000,
                  mt: 1
                }}>
                  {incidentTypes.map((type) => (
                    <Box
                      key={type}
                      onClick={() => handleIncidentTypeSelect(type)}
                      sx={{
                        p: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'grey.100' },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        border: '1px solid transparent',
                        borderColor: '#ccc',
                        gap: 1
                      }}
                    >
                      <Typography>{type}</Typography>
                      {type === formData.incidentType && (
                        <i className="ri-checkbox-circle-fill" style={{ color: '#4CAF50' }}></i>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

            {/* Other Type Input */}
            {formData.incidentType === 'Other' && (
              <Box>
                <textarea
                  placeholder="Please specify the incident type"
                  value={formData.otherType}
                  onChange={(e) => {
                    if (e.target.value.length <= 150) {
                      setFormData(prev => ({ ...prev, otherType: e.target.value }));
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: `1px solid ${errors.otherType ? '#d32f2f' : '#ccc'}`,
                    fontSize: '16px',
                    outline: 'none',
                    boxSizing: 'border-box',
                    minHeight: '100px',
                    resize: 'vertical',
                    marginTop: '8px'
                  }}
                />
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: 'text.secondary' }}>
                  {formData.otherType.length}/150
                </Typography>
              </Box>
            )}

            {/* Location Input */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Where did this happen?
              </Typography>
              <input
                id="location-input"
                type="text"
                placeholder="Enter location, street, or landmark"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '7px',
                  border: `1px solid ${errors.location ? '#d32f2f' : '#ccc'}`,
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </Box>

            {/* Description Input */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                What happened?
              </Typography>
              <textarea
                placeholder="Briefly describe the incident and any tips to avoid it."
                value={formData.description}
                onChange={(e) => {
                  if (e.target.value.length <= 500) {
                    setFormData(prev => ({ ...prev, description: e.target.value }));
                  }
                }}
                style={{
                  width: '100%',
                  padding: '16px',
                  borderRadius: '8px',
                  border: `1px solid ${errors.description ? '#d32f2f' : '#ccc'}`,
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '120px',
                  resize: 'vertical'
                }}
              />
              <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: 'text.secondary' }}>
                {formData.description.length}/500
              </Typography>
            </Box>

            {/* Media Upload */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Button
                  component="label"
                  sx={{
                      borderRadius:2,
                      color:'#444',
                      borderColor:'#ccc',
                      textTransform:'none',
                      fontSize:'14px',
                  }}
                  variant="outlined"
                  startIcon={<i className="ri-upload-2-line"></i>}
                >
                  Upload (optional)
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*,video/*"
                    onChange={handleMediaUpload}
                  />
                </Button>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {formData.media.length}/5
                </Typography>
              </Box>

              {formData.media.length > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 2,
                    '::-webkit-scrollbar': {
                      height: '8px',
                    },
                    '::-webkit-scrollbar-track': {
                      background: '#f1f1f1',
                      borderRadius: '4px',
                    },
                    '::-webkit-scrollbar-thumb': {
                      background: '#888',
                      borderRadius: '4px',
                    },
                  }}
                >
                  {formData.media.map((media, index) => (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        minWidth: '120px',
                        height: '120px',
                      }}
                    >
                      <img
                        src={media.preview}
                        alt={`Upload ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                      <Button
                        onClick={() => handleDeleteMedia(index)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          minWidth: 'auto',
                          p: 0.5,
                          bgcolor: 'rgba(0, 0, 0, 0.5)',
                          color: 'white',
                          '&:hover': {
                            bgcolor: 'rgba(0, 0, 0, 0.7)',
                          },
                        }}
                      >
                        <i className="ri-close-line"></i>
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>

<Divider sx={{ mb: 3 ,mt:3}} />

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isLoading}
              sx={{
                bgcolor: 'black',
                color: 'white',
                py: 2,
                borderRadius:8,
                '&:hover': {
                  bgcolor: '#333',
                },
              }}
            >
              {isLoading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  <span>Submitting...</span>
                </Box>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </>
      )}

      {/* Snackbars for error messages */}
      <Snackbar open={!!errorMessage} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostAlert;
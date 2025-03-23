import React, { useState, useEffect } from "react";
import { fetchAlerts } from "../services/api";
import { formatDistanceToNow } from "date-fns";
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardActions, 
  Divider, 
  IconButton, 
  CircularProgress,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from "@mui/material";
import FilterDrawer from "../components/FilterDrawer";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ShareIcon from '@mui/icons-material/Share';
import FlagIcon from '@mui/icons-material/Flag';
import MenuIcon from '@mui/icons-material/Menu';

const Feed = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState("Edinburgh");
  const [resultsCount, setResultsCount] = useState(0);
  const [error, setError] = useState(null);
  const [locationCoords, setLocationCoords] = useState(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [showLocationMessage, setShowLocationMessage] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filters, setFilters] = useState({
    sortBy: 'relevant',
    incidentTypes: [],
    timeRange: 0,
    distance: 0
  });

  // Fetch alerts based on current location settings and filters
  const fetchLocationAlerts = async (city = "Edinburgh", coords = null) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching alerts with params:", { city, coords });
      
      // Fetch alerts with location parameters and filters
      const response = await fetchAlerts({
        city: city || undefined,  // Only pass city if it has a value
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        sortBy: filters.sortBy,
        incidentTypes: filters.incidentTypes
      });
      
      console.log("API Response:", response);
      
      // Extract alerts from response correctly
      const alertsData = Array.isArray(response) 
        ? response 
        : (response.alerts ? response.alerts : []);
      
      console.log("Extracted alerts data:", alertsData);
      
      // Filter alerts based on incident types, time range, distance, and status
      let filteredAlerts = alertsData.filter(alert => alert.status === "approved" || !alert.status);

      // Apply time range filter if set
      if (filters.timeRange > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.timeRange);
        filteredAlerts = filteredAlerts.filter(alert => new Date(alert.createdAt) >= cutoffDate);
      }
      
      // Apply distance filter if set and we have user coordinates
      if (filters.distance > 0 && coords) {
        filteredAlerts = filteredAlerts.filter(alert => {
          if (!alert.latitude || !alert.longitude) return false;
          
          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in kilometers
          const lat1 = coords.latitude * Math.PI / 180;
          const lat2 = alert.latitude * Math.PI / 180;
          const dLat = (alert.latitude - coords.latitude) * Math.PI / 180;
          const dLon = (alert.longitude - coords.longitude) * Math.PI / 180;
          
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(lat1) * Math.cos(lat2) *
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c; // Distance in kilometers
          
          return distance <= filters.distance;
        });
      }
      
      if (filters.incidentTypes.length > 0) {
        filteredAlerts = filteredAlerts.filter(alert =>
          filters.incidentTypes.includes(alert.incidentType)
        );
      }

      // Sort alerts based on selected option
      filteredAlerts.sort((a, b) => {
        switch (filters.sortBy) {
          case 'relevant':
            return (b.likes || 0) - (a.likes || 0);
          case 'reported':
            return (b.flaggedBy?.length || 0) - (a.flaggedBy?.length || 0);
          case 'newest':
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const aIsRecent = new Date(a.createdAt) > twentyFourHoursAgo;
            const bIsRecent = new Date(b.createdAt) > twentyFourHoursAgo;
            if (aIsRecent !== bIsRecent) return bIsRecent ? 1 : -1;
            return new Date(b.createdAt) - new Date(a.createdAt);
          case 'oldest':
            return new Date(a.createdAt) - new Date(b.createdAt);
          default:
            return 0;
        }
      });
      
      console.log("Filtered alerts:", filteredAlerts);
      
      setAlerts(filteredAlerts);
      setResultsCount(filteredAlerts.length);
      
      if (filteredAlerts.length === 0) {
        setLocationMessage(`No alerts found${coords ? " for your current location" : " in Edinburgh"}`);
        setShowLocationMessage(true);
      }
    } catch (error) {
      console.error("Error fetching alerts:", error);
      setError("Failed to load alerts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load - fetch Edinburgh alerts
  useEffect(() => {
    fetchLocationAlerts("Edinburgh");
  }, []);

  // Helper function to get device location with high accuracy
  const getHighAccuracyLocation = (highAccuracy = true) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log("Got position with accuracy options:", { 
            accuracy: position.coords.accuracy,
            highAccuracy: highAccuracy 
          });
          resolve(position);
        },
        (error) => {
          console.error("Error getting location:", error);
          reject(error);
        },
        { 
          enableHighAccuracy: highAccuracy, 
          timeout: 15000, 
          maximumAge: 0  // Don't use cached position
        }
      );
    });
  };

  // Get user's current location with improved accuracy
  const handleUseMyLocation = async () => {
    setLocationMessage("Accessing your location...");
    setShowLocationMessage(true);
    
    try {
      // First try with high accuracy (may prompt for GPS access on mobile)
      const position = await getHighAccuracyLocation(true);
      handleLocationSuccess(position);
    } catch (error) {
      console.error("Error with high accuracy location:", error);
      
      if (error.code === error.TIMEOUT || error.code === error.PERMISSION_DENIED) {
        try {
          // Fall back to lower accuracy if high accuracy times out or is denied
          setLocationMessage("Trying with lower accuracy...");
          const position = await getHighAccuracyLocation(false);
          handleLocationSuccess(position, false);
        } catch (fallbackError) {
          handleLocationError(fallbackError);
        }
      } else {
        handleLocationError(error);
      }
    }
  };

  // Handle successful location retrieval
  const handleLocationSuccess = (position, highAccuracy = true) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log("Got user location:", { latitude, longitude, accuracy });
    
    setLocationCoords({ latitude, longitude });
    setLocation("Your Location");
    setLocationAccuracy(accuracy);
    
    // If accuracy is poor (>500 meters), show a warning dialog
    if (accuracy > 500) {
      setLocationDialogOpen(true);
    }
    
    const qualityMsg = accuracy < 100 ? "high" : accuracy < 500 ? "moderate" : "low";
    setLocationMessage(`Location accessed with ${qualityMsg} accuracy (±${Math.round(accuracy)}m)`);
    setShowLocationMessage(true);
    
    // Fetch alerts for user's location
    fetchLocationAlerts(null, { latitude, longitude });
  };

  // Handle location errors
  const handleLocationError = (error) => {
    console.error("Location error:", error);
    let errorMessage = "Unable to access your location.";
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage += " Please enable location access in your browser settings.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage += " Your current position is unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage += " The request to get your location timed out.";
        break;
      default:
        errorMessage += " An unknown error occurred.";
    }
    
    setLocationMessage(errorMessage);
    setShowLocationMessage(true);
  };

  // Handle clicking on Edinburgh
  const handleSelectEdinburgh = () => {
    setLocation("Edinburgh");
    setLocationCoords(null);
    fetchLocationAlerts("Edinburgh");
  };

  // Continue with location despite poor accuracy
  const handleContinueWithLocation = () => {
    setLocationDialogOpen(false);
  };

  // Retry with high accuracy
  const handleRetryLocation = () => {
    setLocationDialogOpen(false);
    handleUseMyLocation();
  };

  const formatTime = (createdAt) => {
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: false }) + " ago";
    } catch (error) {
      return "recently";
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
          Feed
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOnIcon fontSize="small" sx={{ mr: 0.5 }} />
            <Typography 
              variant="body1" 
              fontWeight={500}
              onClick={handleSelectEdinburgh}
              sx={{ cursor: location !== "Edinburgh" ? "pointer" : "default" }}
            >
              {location}
            </Typography>
            {locationAccuracy && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (±{Math.round(locationAccuracy)}m)
              </Typography>
            )}
          </Box>
          <Button 
            onClick={handleUseMyLocation} 
            color="primary" 
            startIcon={<MyLocationIcon />}
            sx={{ textTransform: 'none' }}
          >
            My location
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Showing {resultsCount} results
          </Typography>
          <IconButton 
            size="small" 
            sx={{ border: '1px solid', borderColor: 'divider' }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card key={alert._id} variant="outlined" sx={{ mb: 0.5 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {alert.incidentType}:
                    </Box>{' '}
                    {alert.header}
                  </Typography>
                  
                  <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                    {alert.description}
                  </Typography>
                  
                  {alert.action && (
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                      {alert.action}
                    </Typography>
                  )}
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', mb: 1 }}>
                    <Typography variant="body2">
                      {alert.location}
                    </Typography>
                    <Typography variant="body2" sx={{ mx: 0.5 }}>•</Typography>
                    <Typography variant="body2">
                      {formatTime(alert.createdAt)}
                    </Typography>
                  </Box>
                </CardContent>
                
                <Divider />
                
                <CardActions>
                  <IconButton size="small">
                    <ThumbUpIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small">
                    <FlagIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            ))
          ) : (
            <Typography variant="body1" color="text.secondary" align="center" sx={{ my: 4 }}>
              No alerts found {location === "Edinburgh" ? "in Edinburgh" : "for your location"}.
            </Typography>
          )}
        </Box>
      )}

      <Snackbar
        open={showLocationMessage}
        autoHideDuration={6000}
        onClose={() => setShowLocationMessage(false)}
        message={locationMessage}
      />

      {/* Dialog for low accuracy location */}
      <Dialog
        open={locationDialogOpen}
        onClose={() => setLocationDialogOpen(false)}
      >
        <DialogTitle>Location Accuracy Notice</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your location could only be determined with low accuracy ({Math.round(locationAccuracy || 0)}m). 
            This might be because you're on a desktop computer, using a VPN, or your device's GPS is disabled.
            <br /><br />
            For more accurate location:
            <ul>
              <li>On mobile, ensure GPS is enabled</li>
              <li>Allow precise location in browser permissions</li>
              <li>Disable VPN if you're using one</li>
            </ul>
            Would you like to continue with this approximate location or try again?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleContinueWithLocation} color="primary">
            Use Current Accuracy
          </Button>
          <Button onClick={handleRetryLocation} color="primary" variant="contained">
            Try Again
          </Button>
        </DialogActions>
      </Dialog>

      <FilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        filters={filters}
        onFilterChange={setFilters}
        resultCount={resultsCount}
        onApplyFilters={() => {
          setFilterDrawerOpen(false);
          fetchLocationAlerts(location, locationCoords);
        }}
        onClearFilters={() => {
          setFilters({
            sortBy: 'relevant',
            incidentTypes: []
          });
          fetchLocationAlerts(location, locationCoords);
        }}
      />
    </Container>
  );
};

export default Feed;
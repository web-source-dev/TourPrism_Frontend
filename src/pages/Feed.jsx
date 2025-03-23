import React, { useState, useEffect } from "react";
import { fetchAlerts } from "../services/api";
import { formatDistanceToNowStrict } from "date-fns";
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
import { ThumbUp, ThumbUpOutlined, Share, ShareOutlined, Flag, FlagOutlined } from "@mui/icons-material";
import { likeAlert, shareAlert, flagAlert } from "../services/alertActions";
import Layout from "../components/Layout";

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
  const [userId, setUserId] = useState(null); // State for user ID
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserId(parsedData._id);
      console.log("User ID set:", userId);
    } else {
      console.warn("No user data found in localStorage");
    }
  }, []);
  const handleLike = async (alertId) => {
    try {
      const response = await likeAlert(alertId);
      setAlerts(alerts.map(alert => {
        if (alert._id === alertId) {
          return {
            ...alert,
            likes: response.likes,
            likedBy: response.liked
              ? [...(alert.likedBy || []), userId]
              : (alert.likedBy || []).filter(id => id !== userId)
          };
        }
        return alert;
      }));
    } catch (error) {
      console.error("Error liking alert:", error);
    }
  };

  const handleShare = async (alertId) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: alert.title || "Check this out!",
          text: alert.description || "Here's something interesting!",
          url: window.location.href // Change this to a specific alert URL if needed
        });
      } else {
        console.log("Share API not supported on this device");
      }
      const response = await shareAlert(alertId);
      setAlerts(alerts.map(alert => {
        if (alert._id === alertId) {
          return {
            ...alert,
            shares: response.shares,
            sharedBy: [...(alert.sharedBy || []), userId]
          };
        }
        return alert;
      }));
    } catch (error) {
      console.error("Error sharing alert:", error);
    }
  };

  const handleFlag = async (alertId) => {
    try {
      const response = await flagAlert(alertId);
      setAlerts(alerts.map(alert => {
        if (alert._id === alertId) {
          return {
            ...alert,
            flaggedBy: response.flagged
              ? [...(alert.flaggedBy || []), userId]
              : (alert.flaggedBy || []).filter(id => id !== userId)
          };
        }
        return alert;
      }));
    } catch (error) {
      console.error("Error flagging alert:", error);
    }
  };

  // Update the CardActions section in the alerts.map
  // Fetch alerts based on current location settings and filters
  const fetchLocationAlerts = async (city = "Edinburgh", coords = null) => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching alerts with params:", { city, coords, filters });

      // Fetch alerts with location parameters and filters
      const response = await fetchAlerts({
        city: city || undefined,  // Only pass city if it has a value
        latitude: coords?.latitude,
        longitude: coords?.longitude,
        sortBy: filters.sortBy,
        incidentTypes: filters.incidentTypes,
        timeRange: filters.timeRange,
        distance: filters.distance
      });

      console.log("API Response:", response);

      // Extract alerts from response correctly
      const alertsData = Array.isArray(response)
        ? response
        : (response.alerts ? response.alerts : []);

      console.log("Extracted alerts data:", alertsData);

      // Filter alerts based on status
      let filteredAlerts = alertsData.filter(alert => alert.status === "approved" || !alert.status);

      // Apply time range filter if set
      if (filters.timeRange > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - filters.timeRange);
        filteredAlerts = filteredAlerts.filter(alert => new Date(alert.createdAt) >= cutoffDate);
      }

      // Apply distance filter if set and we have coordinates (either from user location or alert)
      if (filters.distance > 0 && (coords || city)) {
        filteredAlerts = filteredAlerts.filter(alert => {
          if (!alert.latitude || !alert.longitude) return false;

          // Use either user coordinates or default Edinburgh coordinates
          const baseCoords = coords || {
            latitude: 55.9533, // Edinburgh's latitude
            longitude: -3.1883 // Edinburgh's longitude
          };

          // Calculate distance using Haversine formula
          const R = 6371; // Earth's radius in kilometers
          const lat1 = baseCoords.latitude * Math.PI / 180;
          const lon1 = baseCoords.longitude * Math.PI / 180;
          const lat2 = alert.latitude * Math.PI / 180;
          const lon2 = alert.longitude * Math.PI / 180;

          const dLat = lat2 - lat1;
          const dLon = lon2 - lon1;

          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);

          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const distance = R * c; // Distance in kilometers

          return distance <= filters.distance;
        });
      }

      // Apply incident type filter
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
  // Replace the existing useEffect for initial load with this:
  useEffect(() => {
    const storedData = localStorage.getItem("user");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setUserId(parsedData._id);
    }
  }, []);

  // Add a new useEffect to fetch alerts when userId is available
  useEffect(() => {
    if (userId) {
      fetchLocationAlerts("Edinburgh");
    }
  }, [userId]);

  // Remove the existing initial useEffect that only calls fetchLocationAlerts
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
  // Add this function after the existing imports
  const getCityFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await response.json();

      // Extract city name from the response
      const city = data.address.city ||
        data.address.town ||
        data.address.village ||
        data.address.suburb ||
        "Unknown Location";

      return city;
    } catch (error) {
      console.error("Error getting city name:", error);
      return "Unknown Location";
    }
  };

  const handleLocationSuccess = async (position, highAccuracy = true) => {
    const { latitude, longitude, accuracy } = position.coords;
    console.log("Got user location:", { latitude, longitude, accuracy });

    // Create coordinates object
    const currentCoords = { latitude, longitude };
    setLocationCoords(currentCoords);
    setLocationAccuracy(accuracy);

    // Get city name from coordinates
    const cityName = await getCityFromCoordinates(latitude, longitude);
    setLocation(cityName);

    if (accuracy > 500) {
      setLocationDialogOpen(true);
    }

    const qualityMsg = accuracy < 100 ? "high" : accuracy < 500 ? "moderate" : "low";
    setLocationMessage(`Location accessed with ${qualityMsg} accuracy (±${Math.round(accuracy)}m)`);
    setShowLocationMessage(true);

    // Fetch alerts with the current coordinates and filters
    await fetchLocationAlerts(cityName);
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
      const result = formatDistanceToNowStrict(new Date(createdAt), { addSuffix: false });

      return result
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" days", "d")
        .replace(" day", "d")
        .replace(" seconds", "s")
        .replace(" second", "s");
    } catch (error) {
      return "recently";
    }
  };


  return (
    <Layout isFooter={false}>
    <Container maxWidth="md" sx={{ pb: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
          Feed
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            color="#000"
            startIcon={<MyLocationIcon color="primary" />}
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
            sx={{
              border: '1px solid', borderColor: 'divider',
              borderRadius: 1,
            }}
            onClick={() => setFilterDrawerOpen(true)}
          >
            <i class="ri-filter-3-line"></i>
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
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {alerts.length > 0 ? (
            alerts.map((alert) => (
              <Card key={alert._id} sx={{ boxShadow: 'none', mb: 1, p: 0 }} >
                <CardContent sx={{p:0}}>
                  <Typography variant="body2" component="div" sx={{ fontWeight: '600', mb: 1 }}>
                    {alert.typeLocation || alert.city} {/* Use typeLocation or city instead of location object */}
                  </Typography>

                  <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                    {alert.description}
                  </Typography>

                  {alert.action && (
                    <Typography variant="body2" color="text.primary" sx={{ mb: 1 }}>
                      {alert.action}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', color: 'text.secondary' }}>
                    <Typography variant="body2" sx={{ fontWeight: '600',fontSize:'12px', color: "#000" }}>
                      {alert.typeLocation || alert.city} {/* Use typeLocation or city instead of location object */}
                    </Typography>
                    <i class="ri-circle-fill" style={{ fontSize: '6px' }}></i>
                    <Typography variant="body2" sx={{ fontWeight: '600',fontSize:'12px', color: "#000" }}>
                      {formatTime(alert.createdAt)} ago
                    </Typography>
                  </Box>
                </CardContent>


                <CardActions>
                  <IconButton size="small" onClick={() => handleLike(alert._id)}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {alert.likedBy?.includes(userId) ? (
                        <ThumbUp fontSize="small" color="primary" />
                      ) : (
                        <ThumbUpOutlined fontSize="small" />
                      )}
                      <span>{alert.likes || 0}</span>
                    </Box>
                  </IconButton>

                  <IconButton size="small" onClick={() => handleShare(alert._id)}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {alert.sharedBy?.includes(userId) ? (
                        <i class="ri-share-2-line" style={{color:"#0000ffb3"}}></i>
                      ) : (
                        <i class="ri-share-2-line"></i>
                      )}
                      <span>{alert.shares || 0}</span>
                    </Box>
                  </IconButton>

                  <IconButton size="small" onClick={() => handleFlag(alert._id)}>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      {alert.flaggedBy?.includes(userId) ? (
                        <Flag fontSize="small" color="error" />
                      ) : (
                        <FlagOutlined fontSize="small" />
                      )}
                    </Box>
                  </IconButton>
                </CardActions>
                <Divider />

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
        onApplyFilters={async () => {
          setFilterDrawerOpen(false);
          // Use current location coordinates if available
          if (locationCoords?.latitude && locationCoords?.longitude) {
            await fetchLocationAlerts(null, {
              ...locationCoords,
              distance: filters.distance
            });
          } else {
            await fetchLocationAlerts(location);
          }
        }}
        onClearFilters={async () => {
          const newFilters = {
            sortBy: 'relevant',
            incidentTypes: [],
            timeRange: 0,
            distance: 5 // Set a default distance to maintain location context
          };
          setFilters(newFilters);

          // Maintain location context when clearing filters
          if (locationCoords?.latitude && locationCoords?.longitude) {
            await fetchLocationAlerts(null, {
              ...locationCoords,
              distance: 50 // Use the same default distance
            });
          } else {
            await fetchLocationAlerts(location);
          }
        }}
      />
    </Container>
    </Layout>
  );
};

export default Feed;
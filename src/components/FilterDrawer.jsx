import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  FormControl,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider,
  Slider,
} from '@mui/material';

const INCIDENT_TYPES = [
  'Scam',
  'Theft',
  'Crime',
  'Weather',
  'Public Disorder'
];

const SORT_OPTIONS = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'reported', label: 'Most Reported' },
  { value: 'newest', label: 'Newest (24h)' },
  { value: 'oldest', label: 'Oldest' },
];

const FilterDrawer = ({
  open,
  onClose,
  filters,
  onFilterChange,
  resultCount,
  onApplyFilters,
  onClearFilters
}) => {
  const handleTimeRangeChange = (event, newValue) => {
    onFilterChange({
      ...filters,
      timeRange: newValue
    });
  };

  const handleDistanceChange = (event, newValue) => {
    onFilterChange({
      ...filters,
      distance: newValue
    });
  };
  const handleSortChange = (event) => {
    onFilterChange({
      ...filters,
      sortBy: event.target.value
    });
  };

  const handleIncidentTypeChange = (type) => {
    const updatedTypes = filters.incidentTypes.includes(type)
      ? filters.incidentTypes.filter(t => t !== type)
      : [...filters.incidentTypes, type];
    
    onFilterChange({
      ...filters,
      incidentTypes: updatedTypes
    });
  };

  const getTimeRangeLabel = (value) => {
    if (value === 0) return 'All Time';
    return `${value} ${value === 1 ? 'Day' : 'Days'}`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 360 } }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filter Alerts
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Time Range
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.timeRange || 0}
              onChange={handleTimeRangeChange}
              min={0}
              max={30}
              step={1}
              marks={[
                { value: 0, label: 'All' },
                { value: 30, label: '30d' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={getTimeRangeLabel}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Distance (km)
          </Typography>
          <Box sx={{ px: 1 }}>
            <Slider
              value={filters.distance || 0}
              onChange={handleDistanceChange}
              min={0}
              max={50}
              step={1}
              marks={[
                { value: 0, label: '0' },
                { value: 50, label: '50km' }
              ]}
              valueLabelDisplay="auto"
              valueLabelFormat={(value) => `${value}km`}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Sort By
          </Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.sortBy}
              onChange={handleSortChange}
              displayEmpty
            >
              {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Incident Types
          </Typography>
          <FormGroup>
            {INCIDENT_TYPES.map((type) => (
              <FormControlLabel
                key={type}
                control={
                  <Checkbox
                    checked={filters.incidentTypes.includes(type)}
                    onChange={() => handleIncidentTypeChange(type)}
                    size="small"
                  />
                }
                label={type}
              />
            ))}
          </FormGroup>
        </Box>

        <Box sx={{ mt: 'auto' }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {resultCount} results found
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClearFilters}
              fullWidth
            >
              Clear All
            </Button>
            <Button
              variant="contained"
              onClick={onApplyFilters}
              fullWidth
            >
              Show Results
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};

export default FilterDrawer;
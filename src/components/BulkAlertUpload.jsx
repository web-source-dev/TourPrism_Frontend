import React, { useState } from 'react';
import { Box, Typography, Button, Paper, Alert, CircularProgress } from '@mui/material';
import { uploadBulkAlerts, downloadTemplate } from '../services/bulkApi';

const BulkAlertUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
    } else {
      setFile(null);
      setError('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadResult(null);

    try {
      const result = await uploadBulkAlerts(file);
      setUploadResult(result);
    } catch (err) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      await downloadTemplate();
    } catch (err) {
      setError('Failed to download template');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Bulk Upload Alerts
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
          Download our CSV template to ensure your data is formatted correctly.
        </Typography>
        <Button
          variant="outlined"
          onClick={handleDownloadTemplate}
          sx={{
            borderRadius: 2,
            borderColor: '#ccc',
            color: '#444',
            textTransform: 'none'
          }}
        >
          Download Template
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <input
          accept=".csv"
          style={{ display: 'none' }}
          id="csv-file-input"
          type="file"
          onChange={handleFileChange}
        />
        <label htmlFor="csv-file-input">
          <Button
            component="span"
            variant="contained"
            sx={{
              bgcolor: 'black',
              '&:hover': { bgcolor: '#333' },
              borderRadius: 2,
              textTransform: 'none'
            }}
          >
            Select CSV File
          </Button>
        </label>
        {file && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            Selected file: {file.name}
          </Typography>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleUpload}
        disabled={!file || isUploading}
        sx={{
          bgcolor: 'black',
          '&:hover': { bgcolor: '#333' },
          borderRadius: 2,
          textTransform: 'none',
          width: '100%'
        }}
      >
        {isUploading ? (
          <CircularProgress size={24} sx={{ color: 'white' }} />
        ) : (
          'Upload Alerts'
        )}
      </Button>

      {uploadResult && (
        <Box sx={{ mt: 3 }}>
          <Alert severity={uploadResult.errorCount > 0 ? 'warning' : 'success'}>
            <Typography variant="body2">
              Processed {uploadResult.totalProcessed} alerts
              <br />
              Successfully uploaded: {uploadResult.successCount}
              <br />
              Errors: {uploadResult.errorCount}
            </Typography>
          </Alert>
          {uploadResult.errorCount > 0 && (
            <Box sx={{ mt: 2, maxHeight: 200, overflowY: 'auto' }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Error Details:
              </Typography>
              {uploadResult.errors.map((error, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                  Row {error.row}: {error.errors.join(', ')}
                </Alert>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default BulkAlertUpload;
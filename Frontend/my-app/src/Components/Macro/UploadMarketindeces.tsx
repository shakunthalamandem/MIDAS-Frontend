import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, Typography, Snackbar, Alert, Container } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const UploadMarketIndices = () => {
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [file, setFile] = useState<File | null>(null); // File type is explicitly set
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false); // Track if upload was successful
  const [openSnackbar, setOpenSnackbar] = useState(false); // Snackbar open state
  const [snackbarMessage, setSnackbarMessage] = useState(''); // Message to show in Snackbar

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  // Handle file upload
  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('excelfile', file);

    setUploading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL; // Assuming the API URL is set in the environment
      const response = await axios.post(`${apiUrl}/api/upload_market_index/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        setUploadSuccess(true); // Successful upload
        setSnackbarMessage('Data uploaded successfully.');
        setOpenSnackbar(true); // Open Snackbar on success
      }
    } catch (err) {
      console.error(err);
      setError('Failed to upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // useEffect to handle any state changes or trigger actions based on file upload status
  useEffect(() => {
    if (uploadSuccess) {
      // You can handle any post-upload actions here, for example:
      // Reset the form or handle redirection, etc.
    }
  }, [uploadSuccess]); // This effect runs when the upload success state changes

  // Handle Snackbar close action
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container>
      <Grid container spacing={2} marginBottom={'40px'} justifyContent="center">
        <Grid item>
          <Typography variant="h5" gutterBottom color="#012d3f" align="center">
            <strong>Upload Market Indices Data</strong>
          </Typography>
        </Grid>
      </Grid>

      {/* Smaller Box aligned to the left side with a gap from the heading */}
      <Box width="50%" maxWidth="400px" margin="0 auto" padding={'10px'} marginTop={'20px'}>
        <Grid container spacing={2} justifyContent="center" padding={'10px'} border={'1px solid #e9e9e9'}>
          <Grid item>
            <CloudUploadIcon color="primary" sx={{ ml: 1, verticalAlign: 'middle', fontSize: '50px' }} />
          </Grid>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <p style={{ color: '#adadad' }}>Drag and drop some files here, or click to select files</p>
            </Grid>
          </Grid>

          <Grid item>
            <label htmlFor="upload-file">
              <Button variant="contained" component="span" sx={{ width: 200 }}> {/* Fixed width */}
                Upload File
                <input
                  accept=".xlsx, .xls"
                  style={{ display: 'none' }}
                  id="upload-file"
                  type="file"
                  onChange={handleFileChange}
                />
              </Button>
            </label>

            {uploadedFileName && (
              <Typography variant="body2" color="textSecondary" marginLeft="10px">
                {uploadedFileName}
              </Typography>
            )}

            {error && <Typography variant="body2" color="error" marginTop="10px">{error}</Typography>}
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={2} marginTop={'10px'} justifyContent="center">
        <Grid item>
          <Button onClick={handleSubmit} variant="contained" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Submit'}
          </Button>
        </Grid>
      </Grid>

      {/* Snackbar component to show success message */}
      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UploadMarketIndices;

import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, Typography, Snackbar, Alert, Container } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const MonasheDataDump = () => {
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // ✅ Correct key: 'file'

    setUploading(true);
    setError('');

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.post(`${apiUrl}/api/monashee_deals_data_upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response); // ✅ Debugging log

      if (response.status === 200) { // ✅ Changed to 200 OK
        setUploadSuccess(true);
        setSnackbarMessage('Monashee Deals Data uploaded successfully.');
        setOpenSnackbar(true);
      }
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Failed to upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      // Post-upload actions here
    }
  }, [uploadSuccess]);

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <Container sx={{ marginTop: '40px' }}>
      <Grid container spacing={2} marginBottom={'40px'} justifyContent="center">
        <Grid item>
          <Typography variant="h5" gutterBottom color="#012d3f" align="center">
            <strong>Upload Monashee Deals Data</strong>
          </Typography>
        </Grid>
      </Grid>

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
              <Button variant="contained" component="span" sx={{ width: 200 }}>
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

      <Snackbar open={openSnackbar} autoHideDuration={8000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MonasheDataDump;
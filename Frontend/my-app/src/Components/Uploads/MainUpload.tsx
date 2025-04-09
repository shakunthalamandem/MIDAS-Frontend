import React, { useState, ChangeEvent } from 'react';
import { Grid, Box, Button, Typography, Snackbar, Alert, Container, FormControl, Card, CardContent, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

// Type for active upload (either 'market_indices' or 'monashee_deals')
type UploadType = 'market_indices' | 'monashee_deals' | null;

const MainUpload: React.FC = () => {
  const [activeUpload, setActiveUpload] = useState<UploadType>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      if (!activeUpload) return;

      await axios.post(`${apiUrl}/api/${activeUpload}_data_upload/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // onUploadProgress: (progressEvent) => {
        //   const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //   setUploadProgress(progress);
        // },
      });

      setUploadSuccess(true);
      setSnackbarMessage(`${activeUpload === 'market_indices' ? 'Market Indices' : 'Monashee Deal Data'} uploaded successfully.`);
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Failed to upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Container sx={{ marginTop: '40px' }}>
      {/* Upload Data Button Card */}
      <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center" color="#012d3f">
            <strong>Upload Data</strong>
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              {/* <Button variant="contained" color="primary" onClick={() => setActiveUpload('market_indices')}>
                Upload Market Indices Data
              </Button> */}
            </Grid>
            <Grid item>
              <Button variant="contained" color="secondary" onClick={() => setActiveUpload('monashee_deals')}>
                Upload Monashee Deal Data
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Upload Form Card */}
      {activeUpload && (
        <Card sx={{ p: 2, boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h6" color="primary" align="center" gutterBottom>
              {activeUpload === 'market_indices' ? 'Upload Market Indices' : 'Upload Monashee Deal Data'}
            </Typography>

            <Box display="flex" justifyContent="center" alignItems="center" gap={2}>
              <CloudUploadIcon color="action" sx={{ fontSize: 50 }} />
              <input
                accept=".xlsx, .xls"
                style={{ display: 'none' }}
                id={`${activeUpload}-upload-file`}
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor={`${activeUpload}-upload-file`}>
                <Button variant="outlined" component="span" color="primary">
                  Choose File
                </Button>
              </label>
            </Box>

            {uploadedFileName && (
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                <strong>Selected File:</strong> {uploadedFileName}
              </Typography>
            )}
            {error && <Typography variant="body2" color="error" align="center">{error}</Typography>}

            <Button onClick={handleUpload} variant="contained" disabled={uploading} color="success" sx={{ mt: 2 }}>
              {uploading ? 'Uploading...' : 'Submit'}
            </Button>

            {/* Progress Bar */}
            {uploading && (
              <Box sx={{ mt: 2 }}>
                <LinearProgress variant="determinate" value={uploadProgress} />
                <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 1 }}>
                  {/* Upload Progress: {uploadProgress}% */}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
        <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default MainUpload;
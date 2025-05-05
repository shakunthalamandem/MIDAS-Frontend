import React, { useState, ChangeEvent } from 'react';
import {
  Grid,
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Container,
  Card,
  CardContent,
  LinearProgress,
  Divider,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import DownloadDeals from './DownloadDeals';
import LastThreeDayDeals from './LastThreeDayDeals';

// Upload type
type UploadType = 'form' | 'monashee_deals' | null;

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
      });

      setUploadSuccess(true);
      setSnackbarMessage(`${activeUpload === 'form' ? 'New Deal Data' : 'Monashee Deal Data'} uploaded successfully.`);
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Failed to upload the file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', position: 'relative', width: '100%' }}>
      {/* Left side: Upload Form */}
      <Container sx={{ marginTop: '100px', width: '70%' }}>
        <Grid container spacing={4}>
          <Grid item xs={12}>
            <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom align="center" color="#012d3f">
                  <strong>Upload Data</strong>
                </Typography>
                <Grid container spacing={2} justifyContent="center">
                  <Grid item>
                    <Button variant="contained" color="primary" onClick={() => setActiveUpload('form')}>
                      Upload New Deal Data
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="secondary" onClick={() => setActiveUpload('monashee_deals')}>
                      Upload Monashee Deal Data
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {activeUpload && (
              <Card sx={{ p: 2, boxShadow: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary" align="center" gutterBottom>
                    {activeUpload === 'form' ? 'Upload New Deal Data' : 'Upload Monashee Deal Data'}
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
                  {error && (
                    <Typography variant="body2" color="error" align="center">
                      {error}
                    </Typography>
                  )}

                  <Button onClick={handleUpload} variant="contained" disabled={uploading} color="success" sx={{ mt: 2 }}>
                    {uploading ? 'Uploading...' : 'Submit'}
                  </Button>

                  {uploading && (
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress variant="determinate" value={uploadProgress} />
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>

      {/* Vertical Divider */}
      <Divider orientation="vertical" flexItem sx={{ height: '100vh', borderColor: '#e0e0e0' }} />

      {/* Right side: DownloadDeals component */}
      <Box
        sx={{
          width: '15%',
          padding: 3,
          marginTop: '40px',
          height: '100vh',
          overflowY: 'auto',
        }}
      >
  
        <DownloadDeals />
        <Divider sx={{ margin: '30px 0', color:"red" }} />
        <LastThreeDayDeals />
      </Box>
    </Box>
  );
};

export default MainUpload;

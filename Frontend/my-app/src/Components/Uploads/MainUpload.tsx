import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Container,
  Card,
  CardContent,
  LinearProgress,
  Grid,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

import NewDealDownloadWithFilter from './NewDealDownloadWithFilter';
import AiInsightsInputForm from '../Main/DashBoards/InsightsAi/UploadsInsights/AiInsightsInputForm';
import IpoDashboardCalendar from '../Main/DashBoards/InsightsAi/UploadsInsights/IpoDashboardCalender';
import Ipos1Download from '../IPOwriteUp/Ipos1Download';
import FileUpload from '../IPOwriteUp/FileUpload';

const uploadConfigs = [
  {
    key: 'form',
    label: 'Upload New Deal Data',
    apiEndpoint: 'form_data_upload',
    buttonColor: 'primary',
  },
  {
    key: 'monashee_deals',
    label: 'Upload Monashee Deal Data',
    apiEndpoint: 'monashee_deals_data_upload',
    buttonColor: 'secondary',
  },
  {
    key: 'writeup',
    label: 'Upload IPO writeUp Data',
    apiEndpoint: 'writeup_data_upload',
    buttonColor: 'error',
  },
  {
    key: 'financialForecasts',
    label: 'Upload IPO S1 FinancialForecasts',
    apiEndpoint: 'financialForecasts_data_upload',
    buttonColor: 'success',
  },
  {
    key: 'companymetric',
    label: 'Upload Companymetric Data',
    apiEndpoint: 'companymetric_data_upload',
    buttonColor: 'warning',
  },
];

const MainUpload: React.FC = () => {
  const [activeUpload, setActiveUpload] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
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
    if (!file || !activeUpload) {
      setError('Please select a file and upload type.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    const config = uploadConfigs.find((conf) => conf.key === activeUpload);
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!config || !apiUrl) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');

      await axios.post(`${apiUrl}/api/${config.apiEndpoint}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Optional: to track progress, you can add onUploadProgress here
        // onUploadProgress: (progressEvent) => {
        //   const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        //   setUploadProgress(percentCompleted);
        // },
      });

      setSnackbarMessage(`${config.label} uploaded successfully.`);
      setOpenSnackbar(true);
      setFile(null);
      setUploadedFileName('');
      setActiveUpload('');
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', py: 6, mr: 20 }}>
        <Container maxWidth="xl">
          <Typography variant="h4" align="center" sx={{ mb: 6, fontWeight: 600, color: '#2c3e50' }}>
            Capital Markets Upload & Tools
          </Typography>

          <Grid container spacing={4}>
            {/* Upload Section */}
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 3, backgroundColor: '#ffffff' }}>
                <Typography variant="h6" gutterBottom color="primary" align="center" sx={{ fontWeight: 600 }}>
                  Upload Data
                </Typography>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="upload-type-label">Select Upload Type</InputLabel>
                  <Select
                    labelId="upload-type-label"
                    id="upload-type"
                    value={activeUpload}
                    label="Select Upload Type"
                    onChange={(e) => {
                      setActiveUpload(e.target.value);
                      setFile(null);
                      setUploadedFileName('');
                      setError('');
                    }}
                  >
                    {uploadConfigs.map((config) => (
                      <MenuItem key={config.key} value={config.key}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                { (
                  <Box sx={{ mt: 4, height: "240px" }}>
                    <Typography variant="subtitle1" align="center" color="textSecondary" gutterBottom>
                      {uploadConfigs.find((cfg) => cfg.key === activeUpload)?.label}
                    </Typography>

                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                      sx={{
                        border: '2px dashed #ccc',
                        borderRadius: 2,
                        p: 3,
                        mt: 2,
                        backgroundColor: '#fdfdfd',
                      }}
                    >
                      <CloudUploadIcon sx={{ fontSize: 40, color: '#1976d2' }} />
                      <input
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="contained" component="span">
                          Choose File
                        </Button>
                      </label>

                      {uploadedFileName && (
                        <Typography sx={{ mt: 1 }} color="text.secondary">
                          <strong>Selected:</strong> {uploadedFileName}
                        </Typography>
                      )}
                    </Box>

                    {error && (
                      <Typography color="error" align="center" sx={{ mt: 2 }}>
                        {error}
                      </Typography>
                    )}

                    <Button
                      onClick={handleUpload}
                      fullWidth
                      variant="contained"
                      color="success"
                      sx={{ mt: 3 }}
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Submit'}
                    </Button>

                    {uploading && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                      </Box>
                    )}
                  </Box>
                )}
              </Card>
            </Grid>

            {/* File Upload & Downloads */}
            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 3 ,height: "382px"}}>
                <Typography variant="h6" align="center" color="primary" sx={{ fontWeight: 600 }}>
                  Upload IPO Files
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FileUpload />
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 3,width: '600px',height: "382px" }}>
                <Typography variant="h6" align="center" color="primary" sx={{ fontWeight: 600 }}>
                  Downloads
                </Typography>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
                  <NewDealDownloadWithFilter />
                  <Ipos1Download />
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Bottom Section */}
          <Grid container spacing={4} sx={{ mt: 6 }}>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 3 }}>
                <AiInsightsInputForm />
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card elevation={3} sx={{ borderRadius: 3, pt: 6 , height:"591px"}}>
                <IpoDashboardCalendar />
              </Card>
            </Grid>
          </Grid>

          <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
            <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>

    </>
  );
};

export default MainUpload;

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
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

import NewDealDownloadWithFilter from './NewDealDownloadWithFilter';
import AiInsightsInputForm from '../Main/DashBoards/InsightsAi/UploadsInsights/AiInsightsInputForm';
import IpoDashboardCalendar from '../Main/DashBoards/InsightsAi/UploadsInsights/IpoDashboardCalender';
import Ipos1Download from '../IPOwriteUp/Ipos1Download';
import FileUpload from '../IPOwriteUp/FileUpload';

// Configuration for multiple upload types
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
    key: 'ipos1_data',
    label: 'Upload IPO writeUp Data',
    apiEndpoint: 'ipos1_data_upload',
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
  //  {
  //   key: 'xx',
  //   label: 'Upload IPO S1 Document',
  //   apiEndpoint: 'xx_data_upload',
  //   buttonColor: 'error',
  // },

];

const MainUpload: React.FC = () => {
  const [activeUpload, setActiveUpload] = useState<string | null>(null);
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

      });

      setSnackbarMessage(`${config.label} uploaded successfully.`);
      setOpenSnackbar(true);
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', width: '100%' }}>
        <Container sx={{ mt: '100px', width: '70%' }}>
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card sx={{ mb: 3, p: 2 }}>
                <CardContent>
                <Typography
                  variant="h5"
                  align="center"
                  color="#012d3f"
                  sx={{ mb: 3 }}  // mb = margin-bottom
                >
                  <strong>Upload Data</strong>
                </Typography>
                  <Grid container spacing={2} justifyContent="center">
                    {uploadConfigs.map((config) => (
                      <Grid item key={config.key}>
                        <Button
                          variant="contained"
                          color={config.buttonColor as any}
                          onClick={() => {
                            setActiveUpload(config.key);
                            setFile(null);
                            setUploadedFileName('');
                            setError('');
                          }}
                        >
                          {config.label}
                        </Button>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              {activeUpload && (
                <Card sx={{ p: 2 }}>
                  <CardContent>
                    <Typography variant="h6" align="center" color="primary" gutterBottom>
                      {uploadConfigs.find((cfg) => cfg.key === activeUpload)?.label}
                    </Typography>

                    <Box display="flex" justifyContent="center" gap={2} alignItems="center">
                      <CloudUploadIcon sx={{ fontSize: 50 }} />
                      <input
                        accept=".xlsx, .xls"
                        style={{ display: 'none' }}
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="outlined" component="span" color="primary">
                          Choose File
                        </Button>
                      </label>
                    </Box>

                    {uploadedFileName && (
                      <Typography align="center" sx={{ mt: 1 }}>
                        <strong>Selected File:</strong> {uploadedFileName}
                      </Typography>
                    )}
                    {error && (
                      <Typography color="error" align="center">
                        {error}
                      </Typography>
                    )}

                    <Button
                      onClick={handleUpload}
                      variant="contained"
                      disabled={uploading}
                      color="success"
                      sx={{ mt: 2 }}
                    >
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

        <Box sx={{height: '60vh' }}>
            <FileUpload />
        </Box>

        <Divider orientation="vertical" flexItem sx={{ height: '60vh', borderColor: '#e0e0e0' }} />
        <Box sx={{ display: 'flex', height: '60vh' }}>
          <Divider orientation="vertical" flexItem sx={{ borderColor: '#e0e0e0' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: 2, gap: 2 }}>
            <NewDealDownloadWithFilter />
            <Ipos1Download />
          </Box>
        </Box>
      </Box>

           
  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, px: 4 }}>
    <Box sx={{ flex: 1, mr: 2 }}>
      <AiInsightsInputForm />
    </Box>
    <Box sx={{ flex: 1, m: 2 }}>
      <IpoDashboardCalendar />
    </Box>
  </Box>
   </Box>
            </>
   );
};

export default MainUpload;

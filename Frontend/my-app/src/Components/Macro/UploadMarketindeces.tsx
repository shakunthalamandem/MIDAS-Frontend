import React, { useState, useEffect } from 'react';
import { Grid, Box, Button, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';

const UploadMarketIndices = () => {
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [file, setFile] = useState<File | null>(null); // File type is explicitly set
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);  // Track if upload was successful

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
        alert('Data uploaded successfully.');
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
      // Redirect the user, reset the form, etc.
      console.log('File upload was successful!');
    }
  }, [uploadSuccess]); // This effect runs when the upload success state changes

  return (
    <div>
      <Grid container spacing={2} marginBottom={'10px'} justifyContent="center">
        <Grid item>
          <Typography variant="h5" gutterBottom color="#012d3f" align="center">
            <strong>Upload Market Indices Data</strong>
          </Typography>
        </Grid>
      </Grid>

      {/* Smaller Box aligned to the right side */}
      <Box 
        width="30%" 
        maxWidth="350px" 
        padding={'10px'} 
        sx={{ float: 'right', marginRight: '20px' }}
      >
        <Grid container spacing={2} justifyContent="center" padding={'10px'} border={'1px solid #e9e9e9'}>
          <Grid item>
            <CloudUploadIcon color='primary' sx={{ ml: 1, verticalAlign: 'middle', fontSize: '40px' }} />
          </Grid>

          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <p style={{ color: '#adadad' }}>
                Drag and drop some files here, or click to select files
              </p>
            </Grid>
          </Grid>

          <Grid item container spacing={2} justifyContent="space-between" alignItems="center">
            <Grid item>
              <label htmlFor="upload-file">
                <Button variant="contained" component="span">
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
            </Grid>

            <Grid item>
              <Button 
                onClick={handleSubmit} 
                variant="contained" 
                disabled={uploading || !file}
              >
                {uploading ? 'Uploading...' : 'Submit'}
              </Button>
            </Grid>
          </Grid>

          {uploadedFileName && (
            <Typography variant="body2" color="textSecondary" marginLeft="10px">
              {uploadedFileName}
            </Typography>
          )}

          {error && <Typography variant="body2" color="error" marginTop="10px">{error}</Typography>}
        </Grid>
      </Box>
    </div>
  );
};

export default UploadMarketIndices;

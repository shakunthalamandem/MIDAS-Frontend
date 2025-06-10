import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const FileUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [severity, setSeverity] = useState<'success' | 'error' | 'info'>('info');
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

    const apiUrl = process.env.REACT_APP_API_URL;
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    if (selectedFile?.type !== 'application/pdf') {
      setMessage('Only PDF files are allowed.');
      setSeverity('error');
      setSnackbarOpen(true);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setMessage('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a PDF file.');
      setSeverity('error');
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    setSnackbarOpen(false);

    try {
    const response = await fetch(`${apiUrl}/api/upload_s1/`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'File uploaded successfully.');
        setSeverity('success');
      } else {
        setMessage(data.error || 'Upload failed.');
        setSeverity('error');
      }
    } catch (error) {
      console.error(error);
      setMessage('Something went wrong during upload.');
      setSeverity('error');
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{  width: '45%', margin: 'auto', mt: 5, px: 2 }}>
      <Card elevation={3} sx={{ mb: 3, p: 2, backgroundColor: '#f5f1f9' }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Upload IPO S1 PDF
          </Typography>

          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mt: 2 }}
          >
            Select PDF File
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>

          {file && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: {file.name}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !file}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Upload'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={severity}
          sx={{ width: '100%' }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FileUpload;

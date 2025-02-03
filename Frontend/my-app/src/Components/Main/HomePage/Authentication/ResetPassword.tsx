import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert } from '@mui/material';
import axios from 'axios';
const apiUrl = process.env.REACT_APP_API_URL;

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Get token from query params
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    if (!newPassword || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      // Call the backend API to reset the password
      const response = await axios.post(
        `${apiUrl}/api/password-reset-confirm/`,

        {
          token,
          new_password: newPassword,
        }
      );

      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000); // Redirect to login page after 3 seconds
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || 'An error occurred. Please try again.';
      setError(errorMessage);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
    >
      <Box
        width={400}
        padding={3}
        border="1px solid #ddd"
        borderRadius={4}
        boxShadow={2}
        textAlign="center"
      >
        <Typography variant="h5" marginBottom={2}>
          Reset Password
        </Typography>
        {success ? (
          <Alert severity="success">
            Password reset successfully! Redirecting to login...
          </Alert>
        ) : (
          <>
            {error && <Alert severity="error">{error}</Alert>}
            <TextField
              label="New Password"
              type="password"
              fullWidth
              margin="normal"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <TextField
              label="Confirm Password"
              type="password"
              fullWidth
              margin="normal"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleSubmit}
              sx={{ marginTop: 2 }}
            >
              Reset Password
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ResetPassword;

// Login.tsx
import React from 'react';
import { Box, Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle login logic
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 400,
        margin: 'auto',
        padding: 3,
        boxShadow: 3,
        borderRadius: 2,
        mt: 8,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={2}>
        Log In
      </Typography>

      {/* Username Field */}
      <TextField
        label="Username"
        variant="outlined"
        margin="normal"
        required
        fullWidth
      />

      {/* Password Field */}
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        margin="normal"
        required
        fullWidth
      />

      {/* Forgot Password Link */}
      <Box textAlign="right" sx={{ mt: 1, mb: 2 }}>
        <Link href="#" underline="hover">
          Forgot Password?
        </Link>
      </Box>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 2 }}
      >
        Log In
      </Button>

      {/* Sign Up Link */}
      <Typography textAlign="center" sx={{ mt: 2 }}>
        Don't have an account?{' '}
        <Link component="button" onClick={() => navigate('/signup')}>
          Sign Up
        </Link>
      </Typography>
    </Box>
  );
};

export default Login;

// SignUp.tsx
import React from 'react';
import { Box, Button, TextField, Typography, Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const SignUp: React.FC = () => {
  const navigate = useNavigate();

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Handle signup logic
  };

  return (
    <Box
      component="form"
      onSubmit={handleSignUp}
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
        Sign Up
      </Typography>
      <TextField label="Email" variant="outlined" margin="normal" required fullWidth />
      <TextField label="Password" type="password" variant="outlined" margin="normal" required fullWidth />
      <TextField label="Confirm Password" type="password" variant="outlined" margin="normal" required fullWidth />
      <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
        Sign Up
      </Button>
      <Typography textAlign="center" sx={{ mt: 2 }}>
        Already have an account?{' '}
        <Link component="button" onClick={() => navigate('/login')}>
          Log In
        </Link>
      </Typography>
    </Box>
  );
};

export default SignUp;

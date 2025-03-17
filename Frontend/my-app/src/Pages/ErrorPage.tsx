import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Typography, Button, Box } from '@mui/material';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the error message passed from routing or set a default one
  const errorMessage = location.state?.message || 'An unexpected error occurred.';

  return (
    <Container maxWidth="sm">
      <Box 
        display="flex" 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        height="100vh" 
        textAlign="center"
      >
        <Typography variant="h2" color="error" gutterBottom>
          Error
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          {errorMessage}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/')}
        >
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default ErrorPage;

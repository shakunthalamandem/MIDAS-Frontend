import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get the error message passed from routing or set a default one
  const errorMessage = location.state?.message || 'An unexpected error occurred.';

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1>Error</h1>
      <p>{errorMessage}</p>
      <button onClick={() => navigate('/')}>Go Home</button>
    </div>
  );
};

export default ErrorPage;

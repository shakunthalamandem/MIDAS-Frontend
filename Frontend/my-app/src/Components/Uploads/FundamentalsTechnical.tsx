// src/components/FundamentalsTechnical.tsx
import React, { useState } from 'react';
import { Button, CircularProgress, Stack, Typography } from '@mui/material';
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

const FundamentalsTechnical: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);

  const handleClick = async (type: 'technical' | 'fundamental') => {
    setLoading(true);
    setResponse(null);

    const endpoint =
      type === 'technical'
        ? `${apiUrl}/api/technical_data_download/`
        : `${apiUrl}/api/fundamental_data_download/`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({}), 
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData?.error || 'Failed to fetch data');
      }

      const data = await res.json();
      setResponse(`Success: ${data.message || 'Data received'}`);
    } catch (error: any) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2} alignItems="center">
      <Typography variant="h6">Select Data Type</Typography>
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          disabled={loading}
          onClick={() => handleClick('technical')}
        >
          Technicals
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={loading}
          onClick={() => handleClick('fundamental')}
        >
          Fundamentals
        </Button>
      </Stack>
      {loading && <CircularProgress />}
      {response && <Typography>{response}</Typography>}
    </Stack>
  );
};

export default FundamentalsTechnical;

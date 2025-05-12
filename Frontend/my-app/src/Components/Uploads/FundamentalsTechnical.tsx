// src/components/FundamentalsTechnical.tsx
import React, { useState } from 'react';
import {
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Stack,
  Typography,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Container,
} from '@mui/material';

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

const FundamentalsTechnical: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState('');

  const handleChange = async (event: SelectChangeEvent) => {
    const type = event.target.value as 'technical' | 'fundamental';
    setSelectedType(type);
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
    <Container maxWidth="md" sx={{ marginTop: 20 }}>
    <Box mt={2} sx={{ padding: 2, backgroundColor: '#f9f9f9', boxShadow: 3 }}>
      <Stack spacing={2} alignItems="center">
        <Typography variant="h6" color="#002060">
          Select Data Type to Download
        </Typography>
        <FormControl sx={{ minWidth: 220 }} disabled={loading}>
          <InputLabel id="data-type-label">Data Type</InputLabel>
          <Select
            labelId="data-type-label"
            value={selectedType}
            label="Data Type"
            onChange={handleChange}
          >
            <MenuItem value="technical">Technicals</MenuItem>
            <MenuItem value="fundamental">Fundamentals</MenuItem>
          </Select>
        </FormControl>

        {loading && <CircularProgress />}
        {response && <Typography>{response}</Typography>}
      </Stack>
    </Box>
    </Container>
  );
};

export default FundamentalsTechnical;

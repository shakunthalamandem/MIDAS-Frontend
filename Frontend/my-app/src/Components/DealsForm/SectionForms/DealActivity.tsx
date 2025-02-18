import React from 'react';
import { TextField, Typography } from '@mui/material';

interface DealActivityProps {
  data: {
    ticker: string;
  };
}

const DealActivity: React.FC<DealActivityProps> = ({ data }) => {
  const { ticker } = data;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Deal Activity
      </Typography>
      <TextField
        label="Ticker"
        value={ticker}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
    </div>
  );
};

export default DealActivity;

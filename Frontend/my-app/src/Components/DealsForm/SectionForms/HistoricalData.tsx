import React from 'react';
import { TextField, Typography } from '@mui/material';

interface HistoricalDataProps {
  data: {
    ticker: string; // Assuming ticker or other historical data can be included here
  };
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ data }) => {
  const { ticker } = data; // You can add more fields to display from data if needed

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Historical Data
      </Typography>
      <TextField
        label="Ticker"
        value={ticker}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
      {/* You can add more TextFields here to display other relevant data */}
    </div>
  );
};

export default HistoricalData;

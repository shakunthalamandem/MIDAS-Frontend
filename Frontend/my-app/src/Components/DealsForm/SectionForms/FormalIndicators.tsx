import React from 'react';
import { TextField, Typography } from '@mui/material';

interface FormalIndicatorsProps {
  data: {
    vendor_issuer: {
      type: string;
      from: string[];
    };
  };
}

const FormalIndicators: React.FC<FormalIndicatorsProps> = ({ data }) => {
  const { type, from } = data.vendor_issuer;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Formal Indicators
      </Typography>
      <TextField
        label="Issuer Type"
        value={type}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
      <TextField
        label="From"
        value={from.join(', ')} // Assuming it's an array and displaying the names as a comma-separated string
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
    </div>
  );
};

export default FormalIndicators;

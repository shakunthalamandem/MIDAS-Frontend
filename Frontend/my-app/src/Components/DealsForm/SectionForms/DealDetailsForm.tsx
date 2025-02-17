import React from 'react';
import { TextField, Typography } from '@mui/material';

interface DealDetailsFormProps {
  data: {
    company: {
      name: string;
      description: string;
    };
  };
}

const DealDetailsForm: React.FC<DealDetailsFormProps> = ({ data }) => {
  const { name, description } = data.company;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Deal Details
      </Typography>
      <TextField
        label="Company Name"
        value={name}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
      <TextField
        label="Company Description"
        value={description}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
    </div>
  );
};

export default DealDetailsForm;

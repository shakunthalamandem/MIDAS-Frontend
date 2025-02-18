import React from 'react';
import { TextField, Typography } from '@mui/material';

interface TechnicalInsightsProps {
  data: {
    company: {
      description: string; // Assuming you might want to display the company description in this section
    };
  };
}

const TechnicalInsights: React.FC<TechnicalInsightsProps> = ({ data }) => {
  const { description } = data.company;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Technical Insights
      </Typography>
      <TextField
        label="Company Description"
        value={description}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
      {/* You can add more fields related to technical insights here */}
    </div>
  );
};

export default TechnicalInsights;

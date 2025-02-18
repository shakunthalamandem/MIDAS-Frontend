import React from 'react';
import { TextField, Typography } from '@mui/material';

interface PerformanceStatergyProps {
  data: {
    team: string;  // Assuming 'team' might be part of the performance strategy data
  };
}

const PerformanceStatergy: React.FC<PerformanceStatergyProps> = ({ data }) => {
  const { team } = data; // Assuming 'team' could be relevant here

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Performance Strategy
      </Typography>
      <TextField
        label="Team"
        value={team}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
      {/* You can add more fields here based on your performance strategy data */}
    </div>
  );
};

export default PerformanceStatergy;

import React from 'react';
import { TextField, Typography } from '@mui/material';

interface BackgroundProps {
  data: {
    deal_captain: string;
    team: string;
  };
}

const Background: React.FC<BackgroundProps> = ({ data }) => {
  const { deal_captain, team } = data;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Background
      </Typography>
      <TextField
        label="Deal Captain"
        value={deal_captain}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
      <TextField
        label="Team"
        value={team}
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
    </div>
  );
};

export default Background;

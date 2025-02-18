import React from 'react';
import { TextField, Typography } from '@mui/material';

interface ParticipationProps {
  data: {
    participants: string[]; // Assuming 'participants' is an array of strings
  };
}

const Participation: React.FC<ParticipationProps> = ({ data }) => {
  const { participants } = data;

  return (
    <div>
      <Typography variant="h6" gutterBottom>
        Participation
      </Typography>
      <TextField
        label="Participants"
        value={participants.join(', ')} // Join participants into a comma-separated string
        onChange={(e) => console.log(e.target.value)} // Handle change logic if needed
        fullWidth
        margin="normal"
      />
    </div>
  );
};

export default Participation;

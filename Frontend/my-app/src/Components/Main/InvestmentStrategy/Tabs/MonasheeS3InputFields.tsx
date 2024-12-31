import React from 'react';
import { Box, TextField, Typography, Grid } from '@mui/material';

const MonasheeS3InputFields = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 3,
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      }}
    >
      {[ 
        "Allocation % DealSize (Simple)",
        "Allocation % IOI (Simple)",
        "Hold Period",
      ].map((label) => (
        <Grid 
          key={label} 
          container 
          alignItems="center" 
          spacing={2} 
          sx={{ gap: 2 }}
        >
          {/* Label on the left */}
          <Grid item xs={4}>
            <Typography
              variant="body2"
              color="#333"
              sx={{ fontSize: '0.9rem', textAlign: 'right' }}
            >
              {label}
            </Typography>
          </Grid>
          
          {/* Input boxes on the right */}
          <Grid item xs={8} container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Min Value"
                variant="outlined"
                type="number"
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Max Value"
                variant="outlined"
                type="number"
                fullWidth
                size="small"
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Box>
  );
};

export default MonasheeS3InputFields;

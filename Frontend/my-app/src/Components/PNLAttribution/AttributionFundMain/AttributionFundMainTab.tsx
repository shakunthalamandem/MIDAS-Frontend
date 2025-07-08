import React, { useState } from 'react';
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Grid,
  Fade,
  Paper,
} from '@mui/material';
import DealTypeFundMain from './DealTypeFundMain';

const AttributionFundMainTab = () => {
  const [selectedFund, setSelectedFund] = useState("FMAP");

  const fundOptions = [
    "BEMAP",
    "BEMAP2",
    "Bespoke Alpha MAC MIM LP",
    "DS Liquid Div RVA MON LLC",
    "FMAP",
    "Mission Pure Alpha LP",
    "Monashee Managed Account SP",
    "Monashee Pure Alpha SPV I LP",
    "Monashee Solitario Fund LP",
    "MPAM",
    "WAF",
  ];

  return (
    <Box
      sx={{
        p: 4,
        background: '#f5f7fa',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      {/* Header and Select Fund */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Grid item>
          <Typography variant="h5" sx={{ color: '#002060', fontWeight: 600 }}>
           P&L Attribution Fund Dashboard
          </Typography>
        </Grid>
        <Grid item>
          <Select
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
            size="small"
            sx={{
              minWidth: 250,
              backgroundColor: 'white',
              borderRadius: 1,
              boxShadow: 1,
              '& .MuiSelect-select': {
                padding: '8px 12px',
              },
              '& fieldset': {
                borderColor: '#002060',
              },
              '&:hover fieldset': {
                borderColor: '#002060',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#002060',
              },
            }}
          >
            {fundOptions.map((fund) => (
              <MenuItem key={fund} value={fund}>
                {fund}
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {/* Selected Fund Heading */}
      <Fade in timeout={500}>
        <Paper
          elevation={3}
          sx={{
            backgroundColor: '#005360',
            color: 'white',
            p: 2,
            mb: 4,
            borderRadius: 2,
            transition: 'all 0.3s ease',
          }}
        >
          <Typography variant="subtitle1">
            The selected fund details are:&nbsp;
            <strong>{selectedFund}</strong>
          </Typography>
        </Paper>
      </Fade>

      {/* Main Deal Component */}
      <Box>
        <DealTypeFundMain fund={selectedFund} />
      </Box>
    </Box>
  );
};

export default AttributionFundMainTab;

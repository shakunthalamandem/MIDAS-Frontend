import React, { useState } from 'react';
import { Box, Select, MenuItem, Typography } from '@mui/material';
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
    <Box p={3}>
      <Typography variant="h6" gutterBottom>
        Select Fund
      </Typography>

      <Select
        value={selectedFund}
        onChange={(e) => setSelectedFund(e.target.value)}
        fullWidth
        size="small"
        displayEmpty
      >
        {fundOptions.map((fund) => (
          <MenuItem key={fund} value={fund}>
            {fund}
          </MenuItem>
        ))}
      </Select>

      <Box mt={4}>
        <DealTypeFundMain fund={selectedFund} />
      </Box>
    </Box>
  );
};

export default AttributionFundMainTab;

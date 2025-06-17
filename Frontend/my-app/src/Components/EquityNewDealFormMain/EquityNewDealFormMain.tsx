import React, { useState } from 'react';
import { Box, Button, TextField, Autocomplete } from '@mui/material';
import DealFormSectionMain from './DealFormSections/DealFormSectionMain';

interface TickerOption {
  ticker: string;
  pricing_date: string;
}

const EquityNewDealFormMain = () => {
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [options, setOptions] = useState<TickerOption[]>([]);

  const handleSearchClick = async () => {
    const response = await fetch('/api/ticker-options');
    const data = await response.json();
    setOptions(data);
  };

  const handleCreateClick = () => {
    setSelectedOption({ create: true });
  };

  return (
    <Box display="flex" flexDirection="column">
      <Box display="flex" justifyContent="flex-end" gap={2} mb={2}>
        <Autocomplete
          options={options}
          getOptionLabel={(option) => `${option.ticker} - ${option.pricing_date}`}
          onChange={(event, value) => setSelectedOption(value)}
          onOpen={handleSearchClick}
          renderInput={(params) => <TextField {...params} label="Search Ticker" variant="outlined" size="small" />}
          sx={{ width: 300 }}
        />
        <Button variant="contained" onClick={handleCreateClick}>Create</Button>
      </Box>
      <DealFormSectionMain selectedOption={selectedOption} />
    </Box>
  );
};

export default EquityNewDealFormMain;

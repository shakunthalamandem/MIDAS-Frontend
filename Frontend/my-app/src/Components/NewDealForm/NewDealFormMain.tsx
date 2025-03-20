import React, { useState } from 'react';
import { TextField, Button, Grid, Box, Typography } from '@mui/material';
import NewDealFormMainTable from './NewDealFormMainTable';

interface NewDealFormMainProps {
  selecteditems: { ticker: string; launch_date: string };
}

const NewDealFormMain: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [launchDate, setLaunchDate] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{ ticker: string; launch_date: string } | null>(null);

  // Handle the Get Data button click
  const handleGetData = () => {
    setSelectedItems({ ticker, launch_date: launchDate });
  };

  return (
    <Box mt={2}>

      <Grid container spacing={2} justifyContent="flex-start" alignItems="center">
        <Grid item xs={3}>  {/* Ticker input field */}
          <TextField
            label="Ticker Name"
            variant="outlined"
            fullWidth
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
        </Grid>
        <Grid item xs={3}>  {/* Launch Date input field */}
          <TextField
            label="Launch Date"
            type="date"
            variant="outlined"
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            value={launchDate}
            onChange={(e) => setLaunchDate(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
        </Grid>
        <Grid item xs={2}>  {/* Get Data button */}
          <Button
            variant="contained"
            fullWidth
            sx={{
              padding: '5px',
              backgroundColor: '#015200',
              '&:hover': {
                backgroundColor: '#001B4D',
              },
            }}
            onClick={handleGetData}
          >
            Get Data
          </Button>
        </Grid>
      </Grid>

      {/* Pass selected items to NewDealFormMainTable */}
      {selectedItems && (
        <NewDealFormMainTable selecteditems={selectedItems} />
      )}
    </Box>
  );
};

export default NewDealFormMain;

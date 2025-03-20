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
    <Box sx={{ backgroundColor: '#f4f4f4', padding: 3, borderRadius: 2 }}>
      <Typography variant="h5" sx={{ color: '#002060', marginBottom: 2 }}>
        New Deal Form
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Ticker Name"
            variant="outlined"
            fullWidth
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
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
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              backgroundColor: '#002060',
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

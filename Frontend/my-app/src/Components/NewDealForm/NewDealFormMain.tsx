import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Typography
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';
import NewDealFormMainTable from './NewDealFormMainTable';
import BasicInfo from './BasicInfo'; // IMPORT your new component

const NewDealFormMain: React.FC = () => {
  const [ticker, setTicker] = useState('');
  const [launchDate, setLaunchDate] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<{ ticker: string; launch_date: string } | null>(null);
  const [showNewForm, setShowNewForm] = useState(false); // <-- NEW state

  const handleGetData = () => {
    setSelectedItems({ ticker, launch_date: launchDate });
  };

  const handleAddClick = () => {
    setShowNewForm(true); // <-- Show the form below
  };

  return (
    <Box mt={2}>
      <Card sx={{ padding: 2, backgroundColor: '#f9f9f9', boxShadow: 3 }}>
        <Box
          sx={{
            position: 'relative',
            mb: 2,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
          >
            Deal Information Form
          </Typography>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleAddClick}
            sx={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              minWidth: '30px',
              height: '30px',
              padding: 0,
              borderRadius: '6px',
              border: '1px solid #1976d2',
              '& svg': {
                fontSize: '18px',
              },
              '&:hover': {
                backgroundColor: '#e3f2fd',
              },
            }}
          >
            <AddIcon />
          </Button>
        </Box>

        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={3}>
              <TextField
                label="Ticker Name"
                variant="outlined"
                fullWidth
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Launch Date"
                type="date"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={launchDate}
                onChange={(e) => setLaunchDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={2}>
              <Button
                variant="contained"
                fullWidth
                sx={{
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
        </CardContent>
      </Card>

      {/* Show table only when Get Data is clicked */}
      {selectedItems && (
        <NewDealFormMainTable selecteditems={selectedItems} />
      )}

      {/* Show form below when + is clicked */}
      {showNewForm && <BasicInfo />}
    </Box>
  );
};

export default NewDealFormMain;

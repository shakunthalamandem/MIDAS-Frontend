import React, { useState } from 'react';
import {
  Container,
  Button,
  Stack,
  Typography,
  CircularProgress
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';


interface Deal {
  ticker: string;
  expected_listing_date: string;
  pricing_date: string;
  deal_type: string;
  pricing_range_min: string;
  pricing_range_max: string;
  allocation_as_percentage_of_deal_size: string;
  deal_color: string;
  t1d_pred: string;
  writeup_available: string;
  id: number; // required for DataGrid
}

const columns: GridColDef[] = [
  { field: 'ticker', headerName: 'Ticker', flex: 1 },
  { field: 'expected_listing_date', headerName: 'Expected Listing Date', flex: 1 },
  { field: 'pricing_date', headerName: 'Pricing Date', flex: 1 },
  { field: 'deal_type', headerName: 'Deal Type', flex: 1 },
  { field: 'pricing_range_min', headerName: 'Min Price', flex: 1 },
  { field: 'pricing_range_max', headerName: 'Max Price', flex: 1 },
  { field: 'allocation_as_percentage_of_deal_size', headerName: 'Allocation %', flex: 1 },
  { field: 'deal_color', headerName: 'Deal Color', flex: 1 },
  { field: 't1d_pred', headerName: 'T1D Prediction', flex: 1 },
  { field: 'writeup_available', headerName: 'Writeup Available', flex: 1 },
];

const NewDealsUpcomingRecent: React.FC = () => {
  const [rows, setRows] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOp, setSelectedOp] = useState<string>('');
  
const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

  const fetchData = async (operation: string) => {
    setLoading(true);
    setSelectedOp(operation);

    try {
      const response = await fetch(`${apiUrl}/api/unified_upcoming_recent/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ operation }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const result = await response.json();
      const formattedRows: Deal[] = result.data.map((item: Omit<Deal, 'id'>, index: number) => ({
        ...item,
        id: index, // Required for DataGrid
      }));

      setRows(formattedRows);
      console.log('API success:', result);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        New Deals - Upcoming & Recent
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant={selectedOp === 'all upcoming' ? 'contained' : 'outlined'}
          onClick={() => fetchData('all upcoming')}
        >
          All Upcoming
        </Button>
        <Button
          variant={selectedOp === 'next 2 weeks' ? 'contained' : 'outlined'}
          onClick={() => fetchData('next 2 weeks')}
        >
          Next 2 Weeks
        </Button>
        <Button
          variant={selectedOp === 'all recent' ? 'contained' : 'outlined'}
          onClick={() => fetchData('all recent')}
        >
          All Recent
        </Button>
      </Stack>

      {loading ? (
        <CircularProgress />
      ) : (
        <DataGrid
          rows={rows}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
        />
      )}
    </Container>
  );
};

export default NewDealsUpcomingRecent;

import React, { useState } from 'react';
import {
  Container,
  Button,
  Stack,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

const apiUrl = process.env.REACT_APP_API_URL;
const token = localStorage.getItem("access_token");

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
  id: number;
}

// Format header into multiple lines if needed
const formatHeader = (label: string) => {
  const words = label.split(' ');
  return words.length === 1 ? label : (
    <span>
      {words.map((word, i) => (
        <React.Fragment key={i}>
          {word}
          {i < words.length - 1 && <br />}
        </React.Fragment>
      ))}
    </span>
  );
};

const columns: GridColDef[] = [
  {
    field: 'ticker',
    headerName: 'Ticker',
    flex: 1,
    renderHeader: () => formatHeader('Ticker'),
  },
  {
    field: 'expected_listing_date',
    headerName: 'Expected Listing Date',
    flex: 1,
    renderHeader: () => formatHeader('Expected Listing Date'),
  },
  {
    field: 'pricing_date',
    headerName: 'Pricing Date',
    flex: 1,
    renderHeader: () => formatHeader('Pricing Date'),
  },
  {
    field: 'deal_type',
    headerName: 'Deal Type',
    flex: 1,
    renderHeader: () => formatHeader('Deal Type'),
  },
  {
    field: 'pricing_range_min',
    headerName: 'Min Price',
    flex: 1,
    renderHeader: () => formatHeader('Min Price'),
  },
  {
    field: 'pricing_range_max',
    headerName: 'Max Price',
    flex: 1,
    renderHeader: () => formatHeader('Max Price'),
  },
  {
    field: 'allocation_as_percentage_of_deal_size',
    headerName: 'Allocation %',
    flex: 1,
    renderHeader: () => formatHeader('Allocation %'),
  },
  {
    field: 'deal_color',
    headerName: 'Deal Color',
    flex: 1,
    renderHeader: () => formatHeader('Deal Color'),
  },
  {
    field: 't1d_pred',
    headerName: 'T1D Prediction',
    flex: 1,
    renderHeader: () => formatHeader('T1D Prediction'),
  },
  {
    field: 'writeup_available',
    headerName: 'Writeup Available',
    flex: 1,
    renderHeader: () => formatHeader('Writeup Available'),
  },
];

const NewDealsUpcomingRecent: React.FC = () => {
  const [rows, setRows] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedOp, setSelectedOp] = useState<string>('');

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
        id: index,
      }));

      setRows(formattedRows);
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
        <Box sx={{ height: 500, width: '100%', overflow: 'auto' }}>
          <DataGrid
            rows={rows}
            columns={columns}
            checkboxSelection
            autoHeight={false}
            disableRowSelectionOnClick
            sx={{
    "& .MuiDataGrid-container--top [role='row']": {
      backgroundColor: "#002060",
      color: "#FFFFFF", 
    },
  }}
          />
        </Box>
      )}
    </Container>
  );
};

export default NewDealsUpcomingRecent;

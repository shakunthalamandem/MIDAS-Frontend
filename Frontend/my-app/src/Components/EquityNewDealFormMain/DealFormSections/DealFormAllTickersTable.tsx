import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { Box } from '@mui/material'; // MUI Box component for layout

// Define the type for the ticker data
interface TickerData {
  ticker: string;
  pricing_date: string;
  deal_colour_present: string;
  deal_captain: string;
  deal_type: string;
  allocation_deal_size_percentage: number | null;
}

const DealFormAllTickersTable: React.FC = () => {
  const [rows, setRows] = useState<any[]>([]); // We will set this properly once data is fetched
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined");

        const response = await fetch(
          `${apiUrl}/api/new_deal_ticker_list/`, {
            method: 'GET',  // Change from 'POST' to 'GET'
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }
          }
        );
        const data = await response.json();

        // Handle data if response is correct
        if (data.tickers) {
          const formattedRows = data.tickers.map((item: TickerData, index: number) => ({
            id: index + 1, // Give a unique id to each row
            ticker: item.ticker,
            pricing_date: item.pricing_date,
            deal_type: item.deal_type,
            deal_captain: item.deal_captain,
            allocation_deal_size_percentage: item.allocation_deal_size_percentage || "-",
            deal_colour_present: item.deal_colour_present,
          }));
          setRows(formattedRows);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Define the columns for the DataGrid
  const columns: GridColDef[] = [
    { field: 'ticker', headerName: 'Ticker', width: 150 },
    { field: 'pricing_date', headerName: 'Pricing Date', width: 180 },
    { field: 'deal_type', headerName: 'Deal Type', width: 120 },
    { field: 'deal_captain', headerName: 'Deal Captain', width: 180 },
    { 
      field: 'allocation_deal_size_percentage', 
      headerName: 'Allocation Deal Size %', 
      width: 220,
      renderCell: (params) => (
        <span
          style={{
            color: params.value !== '-' ? 'green' : 'red',
            display: 'inline-flex', // Make span a flex container
            alignItems: 'center',   // Vertically center content
            justifyContent: 'center',  // Center horizontally
            height: '100%'            // Ensure the span takes full height
          }}
        >
          {params.value !== '-' ? `✔ (${params.value}%)` : '✘'}
        </span>
      )
    },
    { 
      field: 'deal_colour_present', 
      headerName: 'Deal Colour Present', 
      width: 200,
      renderCell: (params) => (
        <span
          style={{
            color: params.value === 'Yes' ? 'green' : 'red',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%'
          }}
        >
          {params.value === 'Yes' ? '✔' : '✘'}
        </span>
      )
    },
  ];

  return (
    <Box sx={{ height: 400, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading} 
        autoHeight={false} // Disable auto height
      />
    </Box>
  );
};

export default DealFormAllTickersTable;

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Divider,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { motion } from "framer-motion";

interface Deal {
  first_trade_date: string;
  client_symbol: string;
  custom_group_2: string;
  deal_type: string;
  deal_size: number;
  issue_offer_price: number;
  discount_from_announcement_price: number;
  allocated_shares: number;
  allocation_deal_size_percentage: number;
  am_buy_shares: number;
  average_am_px: number;
  last_price_t1: number;
  t1d_open: number;
  t1d_high: number;
  t1d_low: number;
  t1d_return_from_bloomberg: number;
  daily_long_exposure: number;
  pnl: number;
}

const columns: GridColDef[] = [
  { field: "first_trade_date", headerName: "TradeDt", flex: 1 },
  { field: "client_symbol", headerName: "Ticker", flex: 1 },
  { field: "custom_group_2", headerName: "Sector", flex: 1 },
  { field: "fo_type", headerName: "Deal Type", flex: 1 },
  { field: "deal_size", headerName: "Deal Size", flex: 1 },
  { field: "issue_offer_price", headerName: "Issue Price", flex: 1 },
  { field: "discount_from_announcement_price", headerName: "%Discount", flex: 1 },
  { field: "allocated_shares", headerName: "IOI ", flex: 1 },
  { field: "allocation_deal_size_percentage", headerName: "Allocation % of deal size", flex: 1 },
  { field: "am_buy_shares", headerName: "AM shares", flex: 1 },
  { field: "average_am_px", headerName: "Avg AM Cost Price", flex: 1 },
  { field: "last_price_t1", headerName: "T-1 Close", flex: 1 },
  { field: "t1d_open", headerName: "T+1 Open", flex: 1 },
  { field: "t1d_high", headerName: "T+1 High", flex: 1 },
  { field: "t1d_low", headerName: "T+1 Low", flex: 1 },
  { field: "t1d_return_from_bloomberg", headerName: "T+1 Close", flex: 1 },
  { field: "last_price_t1", headerName: "Last Close", flex: 1 },
  { field: "daily_long_exposure", headerName: "Exposureas % of LMV", flex: 1 },
  { field: "pnl", headerName: "P&L", flex: 1 },
];

const DealTypeFundMain: React.FC<{ fund: string }> = ({ fund }) => {
  const [ipoDeals, setIpoDeals] = useState<Deal[]>([]);
  const [foDeals, setFoDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiUrl}/api/fund-trades-deals/`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fund }),
        });

        const data = await res.json();
        setIpoDeals(data.IPODeals || []);
        setFoDeals(data.FODeals || []);
      } catch (err) {
        console.error("Failed to fetch deals", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fund]);


const renderTable = (rows: Deal[], title: string, id: string) => (
  <Box my={4} id={id}>
    {/* Title Animation */}
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <Typography
        variant="h6"
        sx={{
          color: '#002060',
          fontWeight: 600,
          mb: 1,
        }}
      >
        {title}
      </Typography>
    </motion.div>

    <Divider sx={{ mb: 2 }} />

    {/* DataGrid Box with animation */}
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <Box
        sx={{
          height: 450,
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: 3,
          backgroundColor: '#ffffff',
          '& .MuiDataGrid-root': {
            border: 'none',
            fontSize: '0.8rem',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#e3eaf5',
            color: '#002060',
            fontWeight: 'bold',
            fontSize: '0.85rem',
          },
          '& .MuiDataGrid-row:nth-of-type(odd)': {
            backgroundColor: '#f5f8fc',
          },
          '& .MuiDataGrid-row:nth-of-type(even)': {
            backgroundColor: '#ffffff',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #e0e0e0',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#dee7f7',
            transition: 'background-color 0.3s ease',
          },
        }}
      >
        <DataGrid
          rows={rows.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          autoHeight
          disableRowSelectionOnClick
          disableColumnMenu
          hideFooterPagination
        />
      </Box>
    </motion.div>
  </Box>
);

  return (
    <>
    <Box>
      {loading ? (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {ipoDeals.length > 0 && renderTable(ipoDeals, "IPOs (New Issues or Incremental AM Participation Deals)", "ipo")}
          {foDeals.length > 0 && renderTable(foDeals, "FOs (New Issues or Incremental AM Participation Deals)", "fo")}
          {ipoDeals.length === 0 && foDeals.length === 0 && (
            <Typography align="center" color="textSecondary" mt={4}>
              No deal data available for this fund.
            </Typography>
          )}
        </>
      )}
    </Box>
    </>
  );
};

export default DealTypeFundMain;
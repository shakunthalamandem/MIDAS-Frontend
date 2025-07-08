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
  client_symbol: string;
  first_trade_date: string;
  custom_group_2: string;
  daily_long_exposure: number;
  pnl: number;
  issue_offer_price: number;
  deal_type: string;
  deal_size: number;
  fo_type?: string;
  discount_from_announcement_price: number;
  allocated_shares: number;
  allocation_deal_size_percentage: number;
  am_buy_shares: number;
  average_am_px: number;
  t1d_high: number;
  t1d_low: number;
  t1d_open: number;
  t1d_return_from_bloomberg: number;
  last_price_t1: number;
  subscription_bid_shares: number;
  allocation_price: number;
}

const columns: GridColDef[] = [
  { field: "client_symbol", headerName: "Ticker", flex: 1 },
  { field: "first_trade_date", headerName: "First Trade Date", flex: 1 },
  { field: "custom_group_2", headerName: "Group", flex: 1 },
  { field: "pnl", headerName: "PNL", type: "number", flex: 1 },
  { field: "issue_offer_price", headerName: "Issue Price", type: "number", flex: 1 },
  { field: "deal_size", headerName: "Deal Size", type: "number", flex: 1 },
  { field: "allocated_shares", headerName: "Allocated Shares", type: "number", flex: 1 },
  { field: "allocation_price", headerName: "Allocation Price", type: "number", flex: 1 },
];

type DealsResponse = {
  IPODeals: Deal[];
  FODetails: Deal[];
};

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
    <Box my={4}>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Typography variant="h6" color="primary" gutterBottom>
          {title}
        </Typography>
      </motion.div>
      <Divider />
      <Box
        sx={{
          height: 400,
          mt: 2,
          "& .MuiDataGrid-root": {
            fontSize: "0.75rem",
            backgroundColor: "#fdfdfd",
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "#f0f4f8",
            color: "#333",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#f9f9f9",
          },
        }}
      >
        <DataGrid
          rows={rows.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          disableRowSelectionOnClick
        />
      </Box>
    </Box>
  );

  return (
    <Container maxWidth="lg">
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
    </Container>
  );
};

export default DealTypeFundMain;

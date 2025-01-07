import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import axios from "axios";

// Define the structure of the response data
interface TickerData {
  year_range: number;
  pricing_date: string;
  issuer_name: string;
  ticker: string;
  region: string;
  gics_sector_from_bloomberg: string;
  deal_captain: string | null;
  broad_region: string;
  deal_type: string;
  lead_bank: string[];
  deal_size: string;
  fo_discount: string | null;
  T_plus_1M_returns: string | null;  // Allow null or string
  T_plus_1D_returns: string | null;  // Allow null or string
  allocation_deal_size: string | null; // Allow null or string
  allocation_ioi: string | null;  // Allow null or string
  average_hold_period: string | null;  // Allow null or string
  T_plus_1D_issueprice: string | null; // Allow null or string
  percentage_primary: string | null; // Allow null or string
  sponsor: string | null; // Allow null or string
}

// Define the structure of the response (the API wraps data inside a 'data' property)
interface ApiResponse {
  data: TickerData[];
}

interface SelectedTickerProps {
  ticker: string;
}

const SelectedTicker: React.FC<SelectedTickerProps> = ({ ticker }) => {
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.post<ApiResponse>(
          "http://192.168.1.59:9000/api/mdd_super_screener/",
          { ticker }
        );
        // Now TypeScript knows the structure of the response
        setData(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box sx={{ marginTop: 4, padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Selected Ticker: {ticker}
      </Typography>

      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={3} style={{ padding: "10px" }}>
              <Typography variant="h6" gutterBottom>Deal Information</Typography>
              <Typography><strong>Issuer Name:</strong> {item.issuer_name}</Typography>
              <Typography><strong>Ticker:</strong> {item.ticker}</Typography>
              <Typography><strong>Region:</strong> {item.region}</Typography>
              <Typography><strong>GICS Sector:</strong> {item.gics_sector_from_bloomberg}</Typography>
              <Typography><strong>Deal Type:</strong> {item.deal_type}</Typography>
              <Typography><strong>Deal Size:</strong> {item.deal_size}</Typography>
              <Typography><strong>Lead Bank:</strong> {item.lead_bank.join(', ')}</Typography>
              <Typography><strong>FO Discount:</strong> {item.fo_discount ?? "N/A"}</Typography>
              <Typography><strong>T+1M Returns:</strong> {item.T_plus_1M_returns ?? "N/A"}</Typography>
              <Typography><strong>T+1D Returns:</strong> {item.T_plus_1D_returns ?? "N/A"}</Typography>
              <Typography><strong>Allocation Deal Size:</strong> {item.allocation_deal_size ?? "N/A"}</Typography>
              <Typography><strong>Allocation IOI:</strong> {item.allocation_ioi ?? "N/A"}</Typography>
              <Typography><strong>Average Hold Period:</strong> {item.average_hold_period ?? "N/A"}</Typography>
              <Typography><strong>T+1D Issue Price:</strong> {item.T_plus_1D_issueprice ?? "N/A"}</Typography>
              <Typography><strong>Percentage Primary:</strong> {item.percentage_primary ?? "N/A"}</Typography>
              <Typography><strong>Sponsor:</strong> {item.sponsor ?? "N/A"}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SelectedTicker;

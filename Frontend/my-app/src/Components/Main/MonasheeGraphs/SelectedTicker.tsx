import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";

// Define the structure of the response data
interface TickerData {
  pricing_date: string;
  issuer_name: string;
  ticker_symbol: string;
  gics_sector: string;
  us_international: string;
  deal_type: string;
  deal_value: string;
  issue_price: string;
  t1m_returns: string;
  t1_return: string;
  t1d_returns_index_returns: string;
  t1m_returns_index_returns: string;
  opportunity_value_ex: string;
}

interface SelectedTickerProps {
  ticker_list: string[]; // Adjusted to accept an array of ticker symbols
}

const SelectedTicker: React.FC<SelectedTickerProps> = ({ ticker_list }) => {
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL; // Get API URL from environment variables
        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const payload = { ticker_list }; // Prepare the payload as an array
        const response = await fetch(`${apiUrl}/api/super-screener/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const result = await response.json();
          setData(
            (result.data || []).map((item: TickerData, index: number) => ({
              ...item,
              id: index + 1, // Add an ID field for internal use if needed
            }))
          );
          console.log("result", result);
        } else {
          throw new Error("Failed to fetch data");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker_list]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ marginTop: 4, padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Selected Tickers: {ticker_list.join(", ")}
      </Typography>

      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Paper elevation={3} style={{ padding: "10px" }}>
              <Typography variant="h6" gutterBottom>Deal Information</Typography>
              <Typography><strong>Pricing Date:</strong> {item.pricing_date}</Typography>
              <Typography><strong>Issuer Name:</strong> {item.issuer_name}</Typography>
              <Typography><strong>Ticker Symbol:</strong> {item.ticker_symbol}</Typography>
              <Typography><strong>GICS Sector:</strong> {item.gics_sector}</Typography>
              <Typography><strong>Region:</strong> {item.us_international}</Typography>
              <Typography><strong>Deal Type:</strong> {item.deal_type}</Typography>
              <Typography><strong>Deal Value:</strong> {item.deal_value}</Typography>
              <Typography><strong>Issue Price:</strong> {item.issue_price}</Typography>
              <Typography><strong>T+1 Month Returns:</strong> {item.t1m_returns}</Typography>
              <Typography><strong>T+1 Day Returns:</strong> {item.t1_return}</Typography>
              <Typography>
                <strong>T+1 Day Returns (Index Adjusted):</strong> {item.t1d_returns_index_returns}
              </Typography>
              <Typography>
                <strong>T+1 Month Returns (Index Adjusted):</strong> {item.t1m_returns_index_returns}
              </Typography>
              <Typography><strong>Opportunity Value Ex:</strong> {item.opportunity_value_ex}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SelectedTicker;

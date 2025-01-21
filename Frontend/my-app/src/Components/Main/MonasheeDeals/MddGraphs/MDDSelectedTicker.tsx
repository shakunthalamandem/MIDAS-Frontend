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
  last_price_t1:string;
  issue_offer_price:string;
  fo_discount: string | null;
  t1m_returns: string | null; // Allow null or string
  t1d_returns: string | null; // Allow null or string
  allocation_deal_size: string | null; // Allow null or string
  allocation_ioi: string | null; // Allow null or string
  average_hold_period: string | null; // Allow null or string
  percentage_primary: string | null; // Allow null or string
  tplus_1d_issueprice: string | null; // Allow null or string
  sponsor: string | null; // Allow null or string
}

// Define the structure of the response (the API wraps data inside a 'data' property)
interface ApiResponse {
  data: TickerData[];
}

interface MDDSelectedTickerProps {
  ticker: string;
}

const MDDSelectedTicker: React.FC<MDDSelectedTickerProps> = ({ ticker }) => {
  const [data, setData] = useState<TickerData[]>([]);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await axios.post<ApiResponse>(
          `${apiUrl}/api/mdd_screener/`,
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
      <Typography
        variant="h5"
        gutterBottom
        color="#6501c4"
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        Selected Ticker: <span style={{color:'#ff6005'}}>{ticker}</span>
      </Typography>

      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={3}
              style={{
                padding: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Typography variant="h6" color="#002060" gutterBottom>
                Deal Information for the Selected Ticker
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                <Typography>
                    <strong>Prcing Date:</strong> {item.pricing_date}
                  </Typography>
                  <Typography>
                    <strong>Issuer Name:</strong> {item.issuer_name}
                  </Typography>
                  <Typography>
                    <strong>Ticker:</strong> {item.ticker}
                  </Typography>
                  <Typography>
                    <strong>Region:</strong> {item.region}
                  </Typography>
                  <Typography>
                    <strong>GICS Sector:</strong>{" "}
                    {item.gics_sector_from_bloomberg}
                  </Typography>
                  <Typography>
                    <strong>Deal Type:</strong> {item.deal_type}
                  </Typography>
                  <Typography>
                    <strong>Deal Size:</strong> {item.deal_size}
                  </Typography>
                  <Typography>
                    <strong>Lead Bank:</strong> {item.lead_bank.join(", ")}
                  </Typography>
                  <Typography>
                    <strong>Issue Price: </strong> ${item.issue_offer_price}
                  </Typography>
                  <Typography>
                    <strong>T + 1D Issue Price:</strong> ${item.tplus_1d_issueprice}
                  </Typography>
                  <Typography>
                    <strong>Percentage Primary:</strong>{" "}
                    {item.percentage_primary ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Sponsor:</strong> {item.sponsor ?? "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                <Typography>
                    <strong>Allocation  % of Deal Size:</strong>{" "}
                    {item.allocation_deal_size ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Allocation % of  IOI:</strong>{" "}
                    {item.allocation_ioi ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Average Hold Period:</strong>{" "}
                    {item.average_hold_period ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>T+1D Returns:</strong>{" "}
                    {item["t1d_returns"] ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>T+1M Returns:</strong>{" "}
                    {item["t1m_returns"] ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>Last Price T1</strong>{" "}
                    {item["last_price_t1"] ?? "N/A"}
                  </Typography>
                  <Typography>
                    <strong>FO Discount:</strong> {item.fo_discount ?? "N/A"}
                  </Typography>
                 
                  
                  
          
                  
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MDDSelectedTicker;

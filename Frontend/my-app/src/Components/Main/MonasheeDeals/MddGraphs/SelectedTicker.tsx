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
//   T+1M_returns: string;
//   T+1D_returns: string;
//   allocation_deal_size: string;
//   allocation_ioi: string;
//   average_hold_period: string;
//   T+1D_issueprice: string;
//   percentage_primary: string;
//   sponsor: string;
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

  // Separate the data into fundamental and technical cards
  const fundamentalData = data.map((item) => ({
    issuerName: item.issuer_name,
    ticker: item.ticker,
    region: item.region,
    gicsSector: item.gics_sector_from_bloomberg,
    dealType: item.deal_type,
    dealSize: item.deal_size,
    // sponsor: item.sponsor,
  }));

  const technicalData = data.map((item) => ({
    pricingDate: item.pricing_date,
    // T1MReturns: item.T+1M_returns,
    // T1DReturns: item.T+1D_returns,
    // allocationDealSize: item.allocation_deal_size,
    // averageHoldPeriod: item.average_hold_period,
    // percentagePrimary: item.percentage_primary,
  }));

  return (
    <Box sx={{ marginTop: 4, padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Selected Ticker: {ticker}
      </Typography>
      
      <Grid container spacing={2}>
        {/* Fundamental Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: "10px" }}>
            <Typography variant="h6" gutterBottom>Fundamental Data</Typography>
            {fundamentalData.map((item, index) => (
              <Box key={index} sx={{ marginBottom: 2 }}>
                <Typography><strong>Issuer Name:</strong> {item.issuerName}</Typography>
                <Typography><strong>Region:</strong> {item.region}</Typography>
                <Typography><strong>GICS Sector:</strong> {item.gicsSector}</Typography>
                <Typography><strong>Deal Type:</strong> {item.dealType}</Typography>
                <Typography><strong>Deal Size:</strong> {item.dealSize}</Typography>
                {/* <Typography><strong>Sponsor:</strong> {item.sponsor}</Typography> */}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Technical Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: "10px" }}>
            <Typography variant="h6" gutterBottom>Technical Data</Typography>
            {technicalData.map((item, index) => (
              <Box key={index} sx={{ marginBottom: 2 }}>
                <Typography><strong>Pricing Date:</strong> {item.pricingDate}</Typography>
                {/* <Typography><strong>T+1M Returns:</strong> {item.T1MReturns}</Typography>
                <Typography><strong>T+1D Returns:</strong> {item.T1DReturns}</Typography>
                <Typography><strong>Allocation Deal Size:</strong> {item.allocationDealSize}</Typography>
                <Typography><strong>Average Hold Period:</strong> {item.averageHoldPeriod} days</Typography>
                <Typography><strong>Percentage Primary:</strong> {item.percentagePrimary}</Typography> */}
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SelectedTicker;

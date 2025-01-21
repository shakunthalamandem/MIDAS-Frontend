import React, { useEffect, useState } from "react";
import axios from "axios";
import { Box, Paper, Grid, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";

// Define the structure of the response data
interface TickerData {
  year_range: number;
  pricing_date: string;
  issuer_name: string;
  ticker: string;
  gics_sector_from_bloomberg: string;
  deal_captain: string | null;
  broad_region: string;
  deal_type: string;
  lead_bank: string[];
  deal_size: string;
  last_price_t1: string;
  issue_offer_price: string;
  discount_from_announcement_price: string | null;
  t1m_excess_returns: string | null;
  t1d_return_from_bloomberg: string | null;
  allocation_deal_size_percentage: string | null;
  allocation_percentage: string | null;
  average_hold_period: string | null;
  percentage_primary: string | null;
  sponsor_yn: string | null;
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
        Selected Ticker: <span style={{ color: '#ff6005' }}>{ticker}</span>
      </Typography>

      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper elevation={3} sx={{ padding: "20px", backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
              <Grid container spacing={2}>
                {/* Table 1 */}
                <Grid item xs={12} sm={6}>
                  <TableContainer>
                    <Table size="small" aria-label="Deal Info Table 1">
                      <TableBody>
                        {[
                          { label: "Pricing Date:", value: item.pricing_date },
                          { label: "Issuer Name:", value: item.issuer_name },
                          { label: "Ticker:", value: item.ticker },
                          { label: "Year Range:", value: item.year_range },
                          { label: "GICS Sector (Bloomberg):", value: item.gics_sector_from_bloomberg },
                          { label: "Region:", value: item.broad_region },
                          { label: "Deal Type:", value: item.deal_type },
                          { label: "Deal Size:", value: item.deal_size },
                          { label: "Issue Offer Price:", value: item.issue_offer_price },
                          { label: "Deal Captain:", value: item.deal_captain ?? "N/A" },
                        ].map((row, i) => (
                          <TableRow key={i}>
                            <TableCell sx={{ fontWeight: "bold" }}>{row.label}</TableCell>
                            <TableCell>{row.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Table 2 */}
                <Grid item xs={12} sm={6}>
                  <TableContainer>
                    <Table size="small" aria-label="Deal Info Table 2">
                      <TableBody>
                        {[
                          { label: "T+1M Excess Returns:", value: item.t1m_excess_returns ?? "N/A" },
                          { label: "Percentage Primary:", value: item.percentage_primary ?? "N/A" },
                          { label: "T+1D Return (Bloomberg):", value: item.t1d_return_from_bloomberg ?? "N/A" },
                          { label: "Discount from Announcement Price:", value: item.discount_from_announcement_price ?? "N/A" },
                          { label: "Allocation Deal Size %:", value: item.allocation_deal_size_percentage ?? "N/A" },
                          { label: "Average Hold Period:", value: item.average_hold_period ?? "N/A" },
                          { label: "Last Price T1:", value: item.last_price_t1 },
                          { label: "Allocation Percentage:", value: item.allocation_percentage ?? "N/A" },
                          { label: "Sponsor Y/N:", value: item.sponsor_yn ?? "N/A" },
                        ].map((row, i) => (
                          <TableRow key={i}>
                            <TableCell sx={{ fontWeight: "bold" }}>{row.label}</TableCell>
                            <TableCell>{row.value}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
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
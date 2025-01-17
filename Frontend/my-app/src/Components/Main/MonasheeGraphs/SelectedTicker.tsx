import React, { useEffect, useState } from "react";
import { Box, Paper, Typography ,Grid,

  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow, } from "@mui/material";

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
        const response = await fetch(`${apiUrl}/api/super_screener/`, {
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
      <Typography
        variant="h5"
        gutterBottom
        color="#6501c4"
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        Selected Ticker: <span style={{color:'#ff6005'}}>{ticker_list.join(", ")}</span>
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
              {/* Table 1 */}
              <Grid item xs={12} sm={6}>
                <TableContainer>
                  <Table size="small" aria-label="Deal Info Table 1">
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc",border: "1px solid #ccc" }}><strong>Pricing Date:</strong></TableCell>
                        <TableCell  style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc",border: "1px solid #ccc" }}>{item.pricing_date}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc",borderTop: "1px solid #ccc" }}><strong>Issuer Name:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.issuer_name}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>Ticker Symbol:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.ticker_symbol}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>GICS Sector:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.gics_sector}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>Region:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.us_international}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>Deal Type:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.deal_type}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>Deal Value:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.deal_value}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Table 2 */}
              <Grid item xs={12} sm={6}>
                <TableContainer>
                  <Table size="small" aria-label="Deal Info Table 2">
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc",borderTop: "1px solid #ccc" }}><strong>Issue Price:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc",borderTop: "1px solid #ccc"}}>{item.issue_price}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>T+1 Month Returns:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.t1m_returns}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>T+1 Day Returns:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.t1_return}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>T+1 Day Returns (Index Adjusted):</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.t1d_returns_index_returns}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>T+1 Month Returns (Index Adjusted):</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.t1m_returns_index_returns}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}><strong>Opportunity Value Ex:</strong></TableCell>
                        <TableCell style={{ borderRight: "1px solid #ccc",borderLeft: "1px solid #ccc" }}>{item.opportunity_value_ex}</TableCell>
                      </TableRow>
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

export default SelectedTicker;

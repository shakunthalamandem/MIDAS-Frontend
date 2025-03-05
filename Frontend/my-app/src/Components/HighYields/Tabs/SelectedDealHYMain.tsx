import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Container,
  CircularProgress,
} from "@mui/material";
import { Label } from "recharts";
interface SelectedIssuerProps {
  issuer_name: string;
}

interface IssuerData {
  pricing_date: string;
  issuer_name: string;
  isin: string;
  sp_init_rtg: string;
  maturity: string;
  issue_price: number;
  price_30: number;  // Changed from price_30d
  orig_amt_sold: number;
  cpn: number;
  opportunity_value: number;
  sector: string;
}

const SelectedDealHYMain: React.FC<SelectedIssuerProps> = ({ issuer_name }) => {
  const [data, setData] = useState<IssuerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!apiUrl) throw new Error("API URL is not defined");

        const payload = { issuer_name };
        const response = await fetch(`${apiUrl}/api/hy_deal_search/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorMessage = await response.text();
          throw new Error(`Failed to fetch data: ${response.status} - ${errorMessage}`);
        }

        const result = await response.json();
        console.log("Fetched data:", result);

        // Ensure response data is valid
        if (!result.data || !Array.isArray(result.data)) {
          throw new Error("Invalid data format received");
        }

        setData(result.data);
      } catch (err: any) {
        console.error("Fetch Error:", err.message);
        setError(err.message || "An error occurred while fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [issuer_name, apiUrl, token]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2 }}>Loading... Please Wait</Typography>
      </Box>
    );
  }

  if (error) return <Typography color="error">{error}</Typography>;
  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
  
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{ fontWeight: "bold", color: "#6501c4", textTransform: "uppercase" }}
        >
         Issuer Name: <span style={{ color: "red" }}>{issuer_name}</span>
        </Typography>
        <Grid container spacing={2}>
          {data.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={3} sx={{ padding: 3, backgroundColor: "#f9f9f9", borderRadius: 2 }}>
                <Typography variant="h6" color="#002060" align="center" gutterBottom>
                  Deal Information for{" "}
                  <span style={{ fontWeight: "bold", color: "#0073e6" }}>{item.issuer_name}</span> on{" "}
                  <span style={{ fontWeight: "bold", color: "#0073e6" }}>{new Date(item.pricing_date).toLocaleDateString()}</span>
                </Typography>
                <Grid container spacing={2}>
                  {/* First Table */}
                  <Grid item xs={12} sm={6}>
                                    <TableContainer>
                                      <Table size="small" aria-label="high yield deal table1">
                                        <TableBody>
                                          {[
                                         
                                            { label: "Issuer Name", value: item.issuer_name },
                                            { label: "PricingDate", value: item.pricing_date },
                                            {
                                              label: "ISIN",
                                              value: item.isin,
                                            },
                                            { label: "S&P Rating", value: item.sp_init_rtg },
                                            { label: "Maturity", value: item.maturity },
                                            { label: "Sector", value: item.sector },
                                          ].map((row, i) => (
                                            <TableRow
                                              key={i}
                                              sx={{
                                                backgroundColor:
                                                  i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                                                "&:hover": {
                                                  backgroundColor: "#e0f7fa",
                                                },
                                              }}
                                            >
                                              <TableCell
                                                sx={{
                                                  border: "1px solid #ccc",
                                                  fontWeight: "bold",
                                                  color: "#333",
                                                }}
                                              >
                                                {row.label}
                                              </TableCell>
                                              <TableCell
                                                sx={{
                                                  border: "1px solid #ccc",
                                                }}
                                              >
                                                {row.value}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  </Grid>
                

                  {/* Second Table */}
                   <Grid item xs={12} sm={6}>
                                      <TableContainer>
                                        <Table size="small" aria-label="high yield deal table2">
                                          <TableBody>
                                            {[
                                              { label: "Issue Price", value: item.issue_price },
                                              { label: "Price 30", value: item.price_30 },
                                              { label: "Original Amount Sold", value: item.orig_amt_sold },
                                              { label: "Coupon", value: item.cpn },
                                              {
                                                label: "Opportunity Value",
                                                value: item.opportunity_value,
                                              },
                                            ].map((row, i) => (
                                              <TableRow
                                                key={i}
                                                sx={{
                                                  backgroundColor:
                                                    i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                                                  "&:hover": {
                                                    backgroundColor: "#e0f7fa",
                                                  },
                                                }}
                                              >
                                                <TableCell
                                                  sx={{
                                                    border: "1px solid #ccc",
                                                    fontWeight: "bold",
                                                    color: "#333",
                                                  }}
                                                >
                                                  {row.label}
                                                </TableCell>
                                                <TableCell
                                                  sx={{
                                                    border: "1px solid #ccc",
                                                  }}
                                                >
                                                  {row.value}
                                                </TableCell>
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
  
    </Container>
  );

};

export default SelectedDealHYMain;

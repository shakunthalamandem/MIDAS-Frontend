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
  snp_rating: string;
  maturity_date: string;
  modified_issue_price: number;
  price_30: number;  // Changed from price_30d
  original_amount_sold: number;
  coupon: number;
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
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4,marginTop: 4 }}>
  
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
                <Typography variant="h6" color="#002060" align="center" gutterBottom sx={{ marginBottom: 2}}>
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
                                         
                                            { label: "Issuer Name", value: item.issuer_name?? "N/A"  },
                                            { label: "PricingDate", value: item.pricing_date?? "N/A"  },
                                            {
                                              label: "ISIN",
                                              value: item.isin?? "N/A" ,
                                            },
                                            { label: "S&P Rating", value: item.snp_rating ?? "N/A" },
                                            { label: "Maturity Date", value: item.maturity_date?? "N/A"  },
                                            { label: "Sector", value: item.sector?? "N/A"  },
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
                                         { label: "Issue Price", value: item.modified_issue_price ? item.modified_issue_price.toLocaleString(undefined, { style: 'currency', currency: 'USD',minimumFractionDigits: 0  }) : "N/A" },
                                         { label: "30 day price", value: item.price_30 ? item.price_30.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : "N/A" },
                                         { label: "Deal Size", value: item.original_amount_sold ? item.original_amount_sold.toLocaleString(undefined,{style:"currency",currency:'USD' ,minimumFractionDigits: 0,maximumFractionDigits:0}) : "N/A" },
                                         { label: "Coupon", value: `${item.coupon ?? "N/A"}%` },
                                         { label: "Opportunity Value", value: item.opportunity_value ? item.opportunity_value.toLocaleString(undefined, { style: 'currency', currency: 'USD' ,minimumFractionDigits: 0,maximumFractionDigits:0}) : "N/A" },
                                         
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

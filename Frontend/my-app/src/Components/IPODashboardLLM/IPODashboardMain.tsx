import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  List,
  ListItem,
  CircularProgress,
  Container,
  Card,
  CardContent,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import FinancialForecastTable from "./IPOFinancialTableMain";
import IPODashboardMainTable from "./IPODashboardMainTable";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord"; // bullet icon

const cardStyle = {
  background: "#fff",
  border: "1px solid #e0e0e0",
  borderRadius: 2,
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  padding: 2.5,
  minHeight: 320,
  width: "100%",
  display: "flex",
  flexDirection: "column" as const,
};

const formatPriceRange = (lower: number | null, upper: number | null) => {
  if (lower && upper) return `$${lower} - $${upper}`;
  if (lower) return `$${lower}`;
  if (upper) return `$${upper}`;
  return "N/A";
};
const cardColors = [
  "#f3f6f9",
  "#fdf5e6",
  "#e6f7f1",
  "#fff0f6",
  "#f0f5ff",
  "#f9f0ff",
];
const IPODashboardMain: React.FC = () => {
  const [ipoData, setIpoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");
        if (!apiUrl)
          throw new Error("API URL is not defined in environment variables");

        const response = await fetch(`${apiUrl}/api/writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: "CRWV" }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(
            errData.error || `HTTP error! status: ${response.status}`
          );
        }

        const jsonData = await response.json();
        setIpoData(jsonData);
      } catch (err: any) {
        console.error("Failed to fetch IPO data", err);
        setError("Failed to fetch IPO data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  console.log("IPO Data:", ipoData);
  return (
    <Box sx={{ px: 2 }}>
      {ipoData && (
        <>
        

          {/* Info Table */}
          <Container maxWidth="xl" sx={{ mb: 2 }}>
              <Typography
            variant="h5"
            color="#002060"
            sx={{ fontWeight: 600, mt: 2, mb: 2 }}
          >
            {ipoData.company_name} ({ipoData.ticker_name} | {ipoData.exchange})
          </Typography>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f6fa" }}>
                <TableRow>
                  {[
                    "Pricing Date",
                    "Price Range",
                    "Deal Size",
                    "Industry",
                    "Shares Offered",
                    "No. Shares Out (NoSH)",
                    "Established",
                    "Bookrunners",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        fontWeight: 600,
                        textAlign: "center",
                        fontSize: 15,
                        color: "#006164",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell align="center">
                    {ipoData.pricing_date || "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {formatPriceRange(ipoData.lower_bound, ipoData.upper_bound)}
                  </TableCell>
                  <TableCell align="center">
                    {ipoData.deal_size
                      ? `$${ipoData.deal_size.toLocaleString()}`
                      : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {ipoData.industry || "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {ipoData.shares_offered
                      ? ipoData.shares_offered.toLocaleString()
                      : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {ipoData.nosh ? ipoData.nosh.toLocaleString() : "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {ipoData.established_year || "N/A"}
                  </TableCell>
                  <TableCell align="center">
                    {ipoData.bookrunners
                      ? ipoData.bookrunners.join(", ")
                      : "N/A"}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Container>

          {/* Cards Section */}

          <Container maxWidth="xl" sx={{ mb: 3 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {[
                { title: "Business Overview", data: ipoData.business_overview },
                { title: "Key Highlights", data: ipoData.key_highlights },
                { title: "Strengths", data: ipoData.strengths },
                { title: "Concerns", data: ipoData.concerns },
                {
                  title: "Principal Stockholders (pre-IPO)",
                  data: ipoData.principal_stockholders_preipo,
                },
                {
                  title: "Key Management Personnel",
                  data: ipoData.key_management_personnel,
                },
              ].map((section, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card
                    sx={{
                      backgroundColor: cardColors[index % cardColors.length],
                      borderRadius: 2,
                      boxShadow: 3,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <CardContent sx={{ overflowY: "auto", flex: 1 }}>
                      <Typography variant="h6" sx={{ color: "#002060", mb: 1,fontWeight:'bold' }} align="center">
                        {section.title}
                      </Typography>
                      <List dense>
                        {section.data?.map((item: string, idx: number) => (
                          <ListItem
                            key={idx}
                            alignItems="flex-start"
                            sx={{ pl: 0 }}
                          >
                            <ListItemIcon sx={{ minWidth: 24, mt: "5px" }}>
                              <FiberManualRecordIcon
                                sx={{ fontSize: 8, color: "#002060" }}
                              />
                            </ListItemIcon>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </Grid>
              ))}

              {/* Full-width Components */}
              <Grid item xs={12}>
                <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                  <FinancialForecastTable defaultTicker="CRWV" />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
                  <IPODashboardMainTable />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </>
      )}
    </Box>
  );
};

export default IPODashboardMain;

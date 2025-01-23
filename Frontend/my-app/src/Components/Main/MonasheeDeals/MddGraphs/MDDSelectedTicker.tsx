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
  selected_bank: string[];
  deal_size: string;
  last_price_t1: string;
  issue_offer_price: string;
  fo_discount: string | null;
  t1m_returns: string | null;
  t1d_returns: string | null;
  allocation_deal_size: string | null;
  allocation_ioi: string | null;
  average_hold_period: string | null;
  percentage_primary: string | null;
  sponsor: string | null;
  percentage_total_return: string | null;
}

// Define the structure of the response (the API wraps data inside a 'data' property)
interface ApiResponse {
  data: TickerData[];
}

interface MDDSelectedTickerProps {
  ticker: string;
}

const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-GB", options);
  const day = date.getDate();
  return formattedDate.replace(
    `${day}`,
    `${day}${getOrdinalSuffix(day)}`
  );
};

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
        Historical Monashee participated on{" "}
        <span style={{ color: "#ff6005", fontStyle: "italic" }}>
          {ticker} - {data.length} deals
        </span>
      </Typography>

      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item xs={12} key={index}>
            <Paper
              elevation={3}
              sx={{
                padding: "20px",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              <Typography
                variant="h6"
                color="#002060"
                align="center"
                gutterBottom
                sx={{
                  fontWeight: "bold",
                  color: "#0073e6",
                }}
              >
                Deal Information for{" "}
                <span style={{ fontWeight: "bold", color: "#0073e6" }}>
                  {item.ticker}
                </span>{" "}
                on{" "}
                <span style={{ fontWeight: "bold", color: "#0073e6" }}>
                  {formatDate(item.pricing_date)}
                </span>
              </Typography>

              <Grid container spacing={2}>
                {/* Table 1 */}
                <Grid item xs={12} sm={6}>
                  <TableContainer>
                    <Table size="small" aria-label="Deal Info Table 1">
                      <TableBody>
                        {[
                          { label: "Pricing Date", value: item.pricing_date },
                          { label: "Issuer Name", value: item.issuer_name },
                          { label: "Ticker", value: item.ticker },
                          {
                            label: "GICS Sector (Bloomberg)",
                            value: item.gics_sector_from_bloomberg,
                          },
                          { label: "Region", value: item.broad_region },
                          { label: "Deal Type", value: item.deal_type },
                          { label: "Deal Size", value: item.deal_size
                            ? `$${new Intl.NumberFormat('en-US', {}).format(Number(item.deal_size))}`
                            : "N/A" },
                          {
                            label: "Issue Offer Price",
                            value: "$" + item.issue_offer_price,
                          },
                          {
                            label: "Deal Captain",
                            value: item.deal_captain ?? "N/A",
                          },
                        ].map((row, i) => (
                          <TableRow
                            key={i}
                            sx={{
                              backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
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

                {/* Table 2 */}
                <Grid item xs={12} sm={6}>
                  <TableContainer>
                    <Table size="small" aria-label="Deal Info Table 2">
                      <TableBody>
                        {[
                          {
                            label: "Sponsor Y/N",
                            value: item.sponsor ?? "N/A",
                          },
                          {
                            label: "Percentage Primary",
                            value: item.percentage_primary ? (item.percentage_primary) + "%"  : "0%",
                          },
                          {
                            label: "Discount from Announcement Price",
                            value: item.fo_discount ? (Number(item.fo_discount)).toFixed(0) + "%" : "0%",
                          },
                          {
                            label: "Allocation Deal Size %",
                            value: item.t1m_returns ? (Number(item.allocation_deal_size)).toFixed(2) + "%" : "N/A",
                          },
                          {
                            label: "Allocation Percentage",
                            value: item.allocation_ioi ? (Number(item.allocation_ioi)).toFixed(2) + "%": "N/A",
                          },
                          {
                            label: "Average Hold Period",
                            value: item.average_hold_period ? (item.average_hold_period) + " days": "N/A",
                          },
                          {
                            label: "T+1D Return (Bloomberg)",
                            value: item.t1d_returns ? (Number(item.t1d_returns)).toFixed(2) + "%" : "N/A",
                          },
                          {
                            label: "T+1M Excess Returns",
                            (<span
                              style={{
                                backgroundColor: Number(item.t1m_returns) > 0
                                  ? "#85A947" // Light green for positive returns
                                  : Number(item.t1m_returns) < 0
                                  ? "#FF8080" // Light red for negative returns
                                  : "#f8f9fa", // Light gray for neutral returns
                                color: "#000", // Keep text color black for readability
                                padding: "4px 8px", // Add some padding for better appearance
                                borderRadius: "4px", // Rounded corners for styling
                                display: "inline-block",
                              }}
                            >
                              {Number(item.t1m_returns).toFixed(2)}%
                            </span>)
                          },
                          {
                            label: "Total Return Earned",
                            value: (<span
                            style={{
                              backgroundColor: Number(item.percentage_total_return) > 0
                                ? "#85A947" // Light green for positive returns
                                : Number(item.percentage_total_return) < 0
                                ? "#FF8080" // Light red for negative returns
                                : "#f8f9fa", // Light gray for neutral returns
                              color: "#000", // Keep text color black for readability
                              padding: "4px 8px", // Add some padding for better appearance
                              borderRadius: "4px", // Rounded corners for styling
                              display: "inline-block",
                            }}
                          >
                            {Number(item.percentage_total_return).toFixed(2)}%
                          </span>)
                          },
                        ].map((row, i) => (
                          <TableRow
                            key={i}
                            sx={{
                              backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
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
    </Box>
  );
};

export default MDDSelectedTicker;

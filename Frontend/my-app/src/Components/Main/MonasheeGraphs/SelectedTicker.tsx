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
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

// Define the structure of the response data
interface TickerData {
  pricing_date: string;
  issuer_name: string;
  ticker_symbol: string;
  gics_sector: string;
  broad_region: string;
  deal_type: string;
  deal_value: string;
  issue_offer_price: string;
  t_plus_1m_returns: string;
  t_plus_1d_return: string;
  t1d_excess_return: string;
  t1m_excess_returns: string;
  opportunity_value_excess: string;
  left_lead_bank: string;
}

interface SelectedTickerProps {
  ticker: string; // Adjusted to accept an array of ticker symbols
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
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-GB", options);
  const day = date.getDate();
  return formattedDate.replace(`${day}`, `${day}${getOrdinalSuffix(day)}`);
};

const SelectedTicker: React.FC<SelectedTickerProps> = ({ ticker }) => {
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

        const payload = { ticker }; // Prepare the payload as an array
        const response = await fetch(`${apiUrl}/api/dealogic_search_ticker/`, {
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
  }, [ticker]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ marginTop: 4, padding: 2 }}>
        <Typography
          variant="h5"
          gutterBottom
          align="center"
          sx={{
            fontWeight: "bold",
            color: "#6501c4",
            textTransform: "uppercase",
          }}
        >
          Historical Deals Overview for{" "}
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
                >
                  Deal Information for{" "}
                  <span style={{ fontWeight: "bold", color: "#0073e6" }}>
                    {item.ticker_symbol}
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
                            {
                              label: "Ticker Symbol",
                              value: item.ticker_symbol,
                            },
                            { label: "GICS Sector", value: item.gics_sector },
                            { label: "Region", value: item.broad_region },
                            { label: "Deal Type", value: item.deal_type },
                            {
                              label: "Deal Size",
                              value: item.deal_value
                                ? `$${new Intl.NumberFormat("en-US", {}).format(Number(item.deal_value))}`
                                : "N/A",
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

                  {/* Table 2 */}
                  <Grid item xs={12} sm={6}>
                    <TableContainer>
                      <Table size="small" aria-label="Deal Info Table 2">
                        <TableBody>
                          {[
                            {
                              label: "Issue / Price",
                              value:
                                "$" + Number(item.issue_offer_price).toFixed(2),
                            },
                            {
                              label: "T+1 Day Returns",
                              value:
                                item.t_plus_1d_return !== undefined ? (
                                  <span
                                    style={{
                                      display: "inline-flex", // Align the text and icon on the same line
                                      alignItems: "center", // Vertically align the text with the icon
                                      color:
                                        Number(item.t_plus_1d_return) > 0
                                          ? "green" // Green for positive returns
                                          : Number(item.t_plus_1d_return) < 0
                                            ? "red" // Red for negative returns
                                            : "black", // Black for neutral (0%) returns
                                    }}
                                  >
                                    {Number(item.t_plus_1d_return).toFixed(2)}%
                                    {Number(item.t_plus_1d_return) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.t_plus_1d_return) < 0 ? (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "red",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "black",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    )}
                                  </span>
                                ) : (
                                  "N/A"
                                ),
                            },
                            {
                              label: "T+1 Day Excess Returns",
                              value:
                                item.t1d_excess_return !== undefined ? (
                                  <span
                                    style={{
                                      display: "inline-flex", // Align the text and icon on the same line
                                      alignItems: "center", // Vertically align the text with the icon
                                      color:
                                        Number(item.t1d_excess_return) > 0
                                          ? "green" // Green for positive returns
                                          : Number(item.t1d_excess_return) < 0
                                            ? "red" // Red for negative returns
                                            : "black", // Black for neutral (0%) returns
                                    }}
                                  >
                                    {Number(item.t1d_excess_return).toFixed(2)}%
                                    {Number(item.t1d_excess_return) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.t1d_excess_return) < 0 ? (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "red",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "black",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    )}
                                  </span>
                                ) : (
                                  "N/A"
                                ),
                            },
                            {
                              label: "T+1 Month Returns",
                              value:
                                item.t_plus_1m_returns !== undefined ? (
                                  <span
                                    style={{
                                      display: "inline-flex", // Align the text and icon on the same line
                                      alignItems: "center", // Vertically align the text with the icon
                                      color:
                                        Number(item.t_plus_1m_returns) > 0
                                          ? "green" // Green for positive returns
                                          : Number(item.t_plus_1m_returns) < 0
                                            ? "red" // Red for negative returns
                                            : "black", // Black for neutral (0%) returns
                                    }}
                                  >
                                    {Number(item.t_plus_1m_returns).toFixed(2)}%
                                    {Number(item.t_plus_1m_returns) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.t_plus_1m_returns) < 0 ? (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "red",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "black",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    )}
                                  </span>
                                ) : (
                                  "N/A"
                                ),
                            },
                            {
                              label: "T+1 Month Excess Returns",
                              value:
                                item.t1m_excess_returns !== undefined ? (
                                  <span
                                    style={{
                                      display: "inline-flex", // Align the text and icon on the same line
                                      alignItems: "center", // Vertically align the text with the icon
                                      color:
                                        Number(item.t1m_excess_returns) > 0
                                          ? "green" // Green for positive returns
                                          : Number(item.t1m_excess_returns) < 0
                                            ? "red" // Red for negative returns
                                            : "black", // Black for neutral (0%) returns
                                    }}
                                  >
                                    {Number(item.t1m_excess_returns).toFixed(2)}
                                    %
                                    {Number(item.t1m_excess_returns) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.t1m_excess_returns) < 0 ? (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "red",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "black",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    )}
                                  </span>
                                ) : (
                                  "N/A"
                                ),
                            },

                            {
                              label: "Opportunity Value (T + 1M Excess)",
                              value: item.opportunity_value_excess
                                ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "USD",
                                    minimumFractionDigits: 0,
                                  }).format(
                                    Number(item.opportunity_value_excess)
                                  )
                                : "N/A",
                            },
                            {
                              label: "Left Lead Bank",
                              value: item.left_lead_bank,
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
      </Box>
    </Container>
  );
};

export default SelectedTicker;

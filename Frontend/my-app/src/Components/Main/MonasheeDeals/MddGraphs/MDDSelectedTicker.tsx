import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Paper,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Container,CircularProgress
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import MDDSearchSummary from "./MDDSearchSummary";
import { useNavigate } from "react-router-dom";

// Define the structure of the response data
interface TickerData {
  all_bank: string;
  year_range: number;
  pricing_date: string;
  issuer_name: string;
  ticker: string;
  gics_sector_from_bloomberg: string;
  deal_captain: string | null;
  broad_region: string;
  deal_type: string;
  deal_size: string;
  issue_offer_price: string;
  fo_discount: string | null;
  total_committed_capital: string | null;
  allocation_deal_size: string | null;
  allocation_ioi: string | null;
  average_hold_period: string | null;
  percentage_primary: string | null;
  sponsor: string | null;
  percentage_total_return: string | null;
  t1m_return_from_bloomberg: string | null;
  total_return: string | null;
  fo_type: string | null;
}

interface ApiResponse {
  data: TickerData[];
  summary: any;
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
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const formattedDate = date.toLocaleDateString("en-GB", options);
  const day = date.getDate();
  return formattedDate.replace(`${day}`, `${day}${getOrdinalSuffix(day)}`);
};

const MDDSelectedTicker: React.FC<MDDSelectedTickerProps> = ({ ticker }) => {
  const [data, setData] = useState<TickerData[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const navigate = useNavigate(); 

  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post<ApiResponse>(
          `${apiUrl}/api/mdd_deal_search_ticker/`,
          { ticker },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            }}
        );
        setData(response.data.data);
        setSummary(response.data.summary);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        navigate("/error");  


        setLoading(false);
      }
    };
    fetchData();
  }, [ticker]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh', 
        }}
      >
        <CircularProgress color="primary" />
        <Typography sx={{ mt: 2, color: "#555", fontSize: "1.2rem" }}>
          Loading... Please Wait
        </Typography>
      </Box>
    );
  }
  
  

  

  
  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 4 }}>
      <Box sx={{ marginTop: 4, padding: 2 }}>
        <Typography
          variant="h5"
          gutterBottom
          color="#6501c4"
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          Monashee participation in{" "}
          <span style={{ color: "#ff6005", fontStyle: "italic" }}>
            {ticker} - {data.length} deals
          </span>
        </Typography>
        {data.length > 1 && summary && <MDDSearchSummary summary={summary} />}
        <Grid container spacing={2} maxWidth="lg">
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
                              label: "Sector ",
                              value: item.gics_sector_from_bloomberg,
                            },
                            { label: "Region", value: item.broad_region },
                            {
                              label: "Deal Type",
                              value:
                                item.deal_type +
                                (item.fo_type ? ` (${item.fo_type})` : ""),
                            },
                            {
                              label: "Deal Size",
                              value: item.deal_size
                                ? `$${new Intl.NumberFormat("en-US", {}).format(Number(item.deal_size))}`
                                : "N/A",
                            },
                            {
                              label: "Issue / Offer Price",
                              value: "$" + item.issue_offer_price,
                            },
                            {
                              label: "Deal Captain",
                              value:
                                item.deal_captain === "none"
                                  ? "Not Available"
                                  : item.deal_captain,
                            },
                            {
                              label: "Sponsor Y/N",
                              value: item.sponsor ?? "N/A",
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
                              label: "Discount from Announcement Price",
                              value:
                                item.fo_discount !== undefined ? (
                                  <span
                                    style={{
                                      color:
                                        Number(item.fo_discount) === 0
                                          ? "black"
                                          : Number(item.fo_discount) < 0
                                            ? "red"
                                            : "green",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {Number(item.fo_discount).toFixed(2) + "%"}
                                    {Number(item.fo_discount) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.fo_discount) < 0 ? (
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
                              label: "Primary %",
                              value: item.percentage_primary
                                ? item.percentage_primary + "%"
                                : "0%",
                            },
                            {
                              label: "Allocation as % of Deal Size",
                              value:
                                item.allocation_deal_size !== undefined ? (
                                  <span
                                    style={{
                                      color:
                                        Number(item.allocation_deal_size) === 0
                                          ? "black"
                                          : Number(item.allocation_deal_size) <
                                              0
                                            ? "red"
                                            : "green",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {Number(item.allocation_deal_size).toFixed(
                                      2
                                    ) + "%"}
                                    {Number(item.allocation_deal_size) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.allocation_deal_size) <
                                      0 ? (
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
                              label: "Allocation as % of IOI",
                              value:
                                item.allocation_ioi !== undefined ? (
                                  <span
                                    style={{
                                      color:
                                        Number(item.allocation_ioi) === 0
                                          ? "black"
                                          : Number(item.allocation_ioi) < 0
                                            ? "red"
                                            : "green",
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {Number(item.allocation_ioi).toFixed(2) +
                                      "%"}
                                    {Number(item.allocation_ioi) > 0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.allocation_ioi) < 0 ? (
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
                              label: "Average Hold Period",
                              value: item.average_hold_period
                                ? item.average_hold_period + " days"
                                : "N/A",
                            },
                            {
                              label: "Monashee Capital Committed",
                              // value: item.total_committed_capital ? "$" + (Number(item.total_committed_capital)).toFixed(2) : "N/A",
                              value: item.total_committed_capital
                                ? `$${new Intl.NumberFormat("en-US", {}).format(Number(item.total_committed_capital))}`
                                : "N/A",
                            },
                            {
                              label: "Monashee PNL Gross",
                              value:
                                item.total_return !== undefined ? (
                                  <span
                                    style={{
                                      color:
                                        Number(item.total_return) < 0
                                          ? "red"
                                          : "green",
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {Number(item.total_return) < 0 ? "-" : ""}$
                                    {new Intl.NumberFormat("en-US", {}).format(
                                      Math.abs(
                                        Number(
                                          Number(item.total_return).toFixed(0)
                                        )
                                      )
                                    )}
                                    {Number(item.total_return) < 0 ? (
                                      <ArrowDropDownIcon
                                        sx={{
                                          color: "red",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    )}
                                  </span>
                                ) : (
                                  "N/A"
                                ),
                              style: {
                                color:
                                  Number(item.total_return) < 0
                                    ? "red"
                                    : "green",
                              },
                            },
                            {
                              label: "Return on Invested Capital",
                              value:
                                item.percentage_total_return !== undefined ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center", // Align the icon with the text
                                      color:
                                        Number(item.percentage_total_return) > 0
                                          ? "green" // Green for positive
                                          : Number(
                                                item.percentage_total_return
                                              ) < 0
                                            ? "red" // Red for negative
                                            : "black", // Black for neutral (0%)
                                    }}
                                  >
                                    {Number(
                                      item.percentage_total_return
                                    ).toFixed(2)}
                                    %
                                    {Number(item.percentage_total_return) >
                                    0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.percentage_total_return) <
                                      0 ? (
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
                              label: "Market T+1M Absolute Return",
                              value:
                                item.t1m_return_from_bloomberg !== undefined ? (
                                  <span
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center", // Align the icon with the text
                                      color:
                                        Number(item.t1m_return_from_bloomberg) >
                                        0
                                          ? "green" // Green for positive returns
                                          : Number(
                                                item.t1m_return_from_bloomberg
                                              ) < 0
                                            ? "red" // Red for negative returns
                                            : "black", // Black for neutral (0%)
                                    }}
                                  >
                                    {Number(
                                      item.t1m_return_from_bloomberg
                                    ).toFixed(2)}
                                    %
                                    {Number(item.t1m_return_from_bloomberg) >
                                    0 ? (
                                      <ArrowDropUpIcon
                                        sx={{
                                          color: "green",
                                          marginLeft: "4px",
                                          fontSize: 20,
                                        }}
                                      />
                                    ) : Number(item.t1m_return_from_bloomberg) <
                                      0 ? (
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
                            { label: "Left Lead Bank", value: item.all_bank },
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

export default MDDSelectedTicker;

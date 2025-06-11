import React from "react";
import {
  Grid,
  Paper,
  Typography,
  TableContainer,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { formatDate } from "./tickerUtils";
import MDDSearchSummary from "../MonasheeDeals/MddGraphs/MDDSearchSummary";



// adjust this path if needed

const ArrowValue = ({ value }: { value: number | null | undefined }) => {
    if (value === null || value === undefined) return <>N/A</>;

    const color = value > 0 ? "green" : value < 0 ? "red" : "black";
    const Icon = value > 0 ? ArrowDropUpIcon : value < 0 ? ArrowDropDownIcon : ArrowDropDownIcon;

    return (
        <span style={{ color, display: "flex", alignItems: "center" }}>
            {value.toFixed(2)}%
            <Icon sx={{ color, ml: 0.5, fontSize: 20 }} />
        </span>
    );
};


export const renderMonasheeDeals = (data: any, ticker: string) => {
  const mddDeals = data?.mdd_data?.data;

  if (!Array.isArray(mddDeals) || mddDeals.length === 0) {
    return (
      <Grid item xs={12} md={6}>
        <Typography
          variant="body1"
          sx={{
            textAlign: "center",
            color: "red",
            fontWeight: "bold",
          }}
        >
          No Monashee participation on this {ticker} ticker.
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid >
      <Typography variant="h6" gutterBottom sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
        Monashee participation in{" "}
        <span style={{ color: "#ff6005", fontStyle: "italic" }}>
          {ticker} - {mddDeals.length} deals
        </span>
      </Typography>

      {mddDeals.length > 1 && data.mdd_data.summary && (
        <MDDSearchSummary summary={data.mdd_data.summary} />
      )}

      {mddDeals.map((item: any, idx: number) => (
        <Paper key={idx} sx={{ mb: 3, p: 2, bgcolor: "#ffffff", borderRadius: 1 }} elevation={1}>
          <Typography variant="subtitle1" sx={{ textAlign: "center", fontWeight: "bold", mb: 1 }}>
            Deal Information for{" "}
            <span style={{ color: "#0073E6" }}>{item.ticker || "N/A"}</span> on{" "}
            <span style={{ color: "#0073E6" }}>{formatDate(item.pricing_date)}</span>
          </Typography>

          <Grid container spacing={2}>
            {/* Left Table */}
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {[
                      { label: "Pricing Date", value: item.pricing_date || "N/A" },
                      { label: "Issuer Name", value: item.issuer_name || "N/A" },
                      { label: "Ticker", value: item.ticker || "N/A" },
                      {
                        label: "Sector",
                        value: item.gics_sector_from_bloomberg || "N/A",
                      },
                      { label: "Region", value: item.broad_region || "N/A" },
                      { label: "Deal Type", value: item.deal_type || "N/A" },
                      {
                        label: "Deal Size",
                        value: item.deal_size ? `$${Number(item.deal_size).toLocaleString()}` : "N/A",
                      },
                      { label: "Issue / Offer Price", value: item.issue_offer_price || "N/A" },
                      { label: "Deal Captain", value: item.deal_captain || "N/A" },
                      {
                        label: "Sponsor Y/N",
                        value: item.sponsor === "0" ? "N" : item.sponsor || "N/A",
                      },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                          "&:hover": { backgroundColor: "#e0f7fa" },
                        }}
                      >
                        <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold", color: "#333" }}>
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Right Table */}
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {[
                      { label: "Discount from Announcement Price", value: <ArrowValue value={item.fo_discount} /> },
                      {
                        label: "Primary %",
                        value: item.percentage_primary != null ? `${item.percentage_primary}%` : "0%",
                      },
                      { label: "Allocation as % of Deal Size", value: <ArrowValue value={item.allocation_deal_size} /> },
                      { label: "Allocation as % of IOI", value: <ArrowValue value={item.allocation_ioi} /> },
                      {
                        label: "Average Hold Period",
                        value: item.average_hold_period != null ? `${item.average_hold_period} days` : "N/A",
                      },
                      {
                        label: "Monashee Capital Committed",
                        value:
                          item.total_committed_capital != null
                            ? `$${item.total_committed_capital.toLocaleString()}`
                            : "N/A",
                      },
                      {
                        label: "Monashee PNL Gross",
                        value:
                          item.total_return != null ? (
                            <span
                              style={{
                                color: item.total_return < 0 ? "red" : "green",
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              {item.total_return < 0 ? "-" : ""}$
                              {Math.abs(item.total_return).toLocaleString()}
                              {item.total_return < 0 ? (
                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                              ) : (
                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                              )}
                            </span>
                          ) : (
                            "N/A"
                          ),
                      },
                      {
                        label: "Return on Invested Capital",
                        value:
                          item.percentage_total_return != null ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                color:
                                  item.percentage_total_return > 0
                                    ? "green"
                                    : item.percentage_total_return < 0
                                    ? "red"
                                    : "black",
                              }}
                            >
                              {item.percentage_total_return.toFixed(2)}%
                              {item.percentage_total_return > 0 ? (
                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                              ) : item.percentage_total_return < 0 ? (
                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                              ) : (
                                <ArrowDropDownIcon sx={{ color: "black", ml: 0.5, fontSize: 20 }} />
                              )}
                            </span>
                          ) : (
                            "N/A"
                          ),
                      },
                      {
                        label: "Market T+1M Absolute Return",
                        value:
                          item.t1m_return_from_bloomberg != null ? (
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                color:
                                  item.t1m_return_from_bloomberg > 0
                                    ? "green"
                                    : item.t1m_return_from_bloomberg < 0
                                    ? "red"
                                    : "black",
                              }}
                            >
                              {item.t1m_return_from_bloomberg.toFixed(2)}%
                              {item.t1m_return_from_bloomberg > 0 ? (
                                <ArrowDropUpIcon sx={{ color: "green", ml: 0.5, fontSize: 20 }} />
                              ) : item.t1m_return_from_bloomberg < 0 ? (
                                <ArrowDropDownIcon sx={{ color: "red", ml: 0.5, fontSize: 20 }} />
                              ) : (
                                <ArrowDropDownIcon sx={{ color: "black", ml: 0.5, fontSize: 20 }} />
                              )}
                            </span>
                          ) : (
                            "N/A"
                          ),
                      },
                      { label: "Left Lead Bank", value: item.all_bank || "N/A" },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                          "&:hover": { backgroundColor: "#e0f7fa" },
                        }}
                      >
                        <TableCell sx={{ border: "1px solid #ccc", fontWeight: "bold", color: "#333" }}>
                          {row.label}
                        </TableCell>
                        <TableCell sx={{ border: "1px solid #ccc" }}>{row.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </Paper>
      ))}
    </Grid>
  );
};

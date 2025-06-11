import React from "react";
import {
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { formatDate, formatNumber } from "./tickerUtils";

const HistoricalDealogicCards = (
  ticker: string,
  deals: any[]
): React.ReactNode => {
  if (!deals || deals.length === 0) {
    return (
      <Typography
        variant="body1"
        sx={{
          textAlign: "center",
          color: "red",
          fontWeight: "bold",
          mt: 4,
        }}
      >
        No historical deals for this {ticker} ticker.
      </Typography>
    );
  }

  return (
    <>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
      >
        Historical Deals Overview for{" "}
        <span style={{ color: "#ff6005", fontStyle: "italic" }}>
          {ticker} - {deals.length} deals
        </span>
      </Typography>

      {deals.map((deal, idx) => (
        <Paper
          key={idx}
          sx={{ mb: 3, p: 2, bgcolor: "#ffffff", borderRadius: 1 }}
          elevation={1}
        >
          <Typography
            variant="subtitle1"
            sx={{ textAlign: "center", fontWeight: "bold", mb: 1 }}
          >
            Deal Information for{" "}
            <span style={{ color: "#0073E6" }}>{ticker}</span> on{" "}
            <span style={{ color: "#0073E6" }}>
              {formatDate(deal.pricing_date)}
            </span>
          </Typography>

          <Grid container spacing={2}>
            {/* Left Table */}
            <Grid item xs={12} md={6}>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    {[
                      {
                        label: "Pricing Date",
                        value: deal.pricing_date || "N/A",
                      },
                      {
                        label: "Issuer Name",
                        value: deal.issuer_name || "N/A",
                      },
                      {
                        label: "Ticker Symbol",
                        value: deal.ticker_symbol || "N/A",
                      },
                      {
                        label: "GICS Sector",
                        value: deal.gics_sector || "N/A",
                      },
                      { label: "Region", value: deal.broad_region || "N/A" },
                      { label: "Deal Type", value: deal.deal_type || "N/A" },
                      {
                        label: "Deal Size",
                        value:
                          deal.deal_value != null
                            ? `$${Number(deal.deal_value).toLocaleString()}`
                            : "N/A",
                      },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                          "&:hover": { backgroundColor: "#e0f7fa" },
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
                        <TableCell sx={{ border: "1px solid #ccc" }}>
                          {row.value}
                        </TableCell>
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
                      {
                        label: "Issue / Price",
                        value: formatNumber(deal.issue_offer_price) || "N/A",
                      },
                      {
                        label: "T+1 Day Returns",
                        value: renderArrowCell(deal.t_plus_1d_return),
                      },
                      {
                        label: "T+1 Day Excess Returns",
                        value: renderArrowCell(deal.t1d_excess_return),
                      },
                      {
                        label: "T+1 Month Returns",
                        value: renderArrowCell(deal.t_plus_1m_returns),
                      },
                      {
                        label: "T+1 Month Excess Returns",
                        value: renderArrowCell(deal.t1m_excess_returns),
                      },
                      {
                        label: "Opportunity Value (T + 1M Excess)",
                        value:
                          deal.opportunity_value_excess != null
                            ? `${deal.opportunity_value_excess < 0 ? "-$" : "$"}${Math.abs(deal.opportunity_value_excess).toLocaleString()}`
                            : "N/A",
                      },
                      {
                        label: "Left Lead Bank",
                        value: deal.left_lead_bank || "N/A",
                      },
                    ].map((row, i) => (
                      <TableRow
                        key={i}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                          "&:hover": { backgroundColor: "#e0f7fa" },
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
                        <TableCell sx={{ border: "1px solid #ccc" }}>
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
      ))}
    </>
  );
};

// Helper function to render percentage + arrow
const renderArrowCell = (value: number | null | undefined) => {
  if (value === null || value === undefined) return "N/A";
  const isNegative = value < 0;
  const color = isNegative ? "red" : "green";
  const ArrowIcon = isNegative ? ArrowDropDownIcon : ArrowDropUpIcon;
  return (
    <span
      style={{
        color,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {isNegative ? "-" : ""}
      {Math.abs(value).toFixed(2)}%
      <ArrowIcon sx={{ color, ml: 0.5, fontSize: 20 }} />
    </span>
  );
};

export default HistoricalDealogicCards;

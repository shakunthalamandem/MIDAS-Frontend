import React, { useState } from "react";
import {
  Container,
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import axios from "axios";

// Row type definition
interface Row {
  label: string;
  key: string;
  type?: "text" | "number" | "select" | "date";
  options?: string[];
}

const tableLeft1: Row[] = [
  { label: "Pricing Date", key: "launch_date", type: "date" },
  { label: "Issuer Name", key: "vendor_issuer" },
  { label: "Ticker", key: "ticker" },
  { label: "Region", key: "region", type: "select", options: ["US", "EMEA", "APAC", "Non-US America"] },
  { label: "Deal Type", key: "deal_type", type: "select", options: ["IPO", "FO"] },
  { label: "FO Type", key: "fo_type", type: "select", options: ["Marketed", "Overnight", "Block"] },
  { label: "Sector", key: "sector", type: "select", options: [ "Health Care",
    "Information Technology",
    "Financials",
    "Consumer Staples",
    "Real Estate",
    "Materials",
    "Industrials",
    "Energy",
    "Utilities",
    "Consumer Discretionary",
    "Communication Services"] },
  { label: "Deal Size Amount (USD)", key: "deal_size_amount_usd", type: "number" },
  { label: "Deal Size Shares", key: "deal_size_shares", type: "number" },
  { label: "Deal Captain", key: "deal_captain", type: "select", options: ['Robin','Tom','Block', 'HC', 'Jay','Others'] },
  { label: "Lead Bank", key: "invitation_bank" },
  { label: "Sponsors (Y/N)", key: "sponsor", type: "select", options: ["Y", "N"] },
  { label: "Primary %", key: "percentage_primary", type: "number" },
];

const tableRight1: Row[] = [
  { label: "Price (Local Currency)", key: "price_local_currency", type: "number" },
  { label: "Discount %", key: "discount_percentage", type: "number" },
  { label: "Last Close Price", key: "last_close_price", type: "number" },
  { label: "Initial Range", key: "initial_range" },
  { label: "Final Indication Amount (USD)", key: "final_indication_amount_usd", type: "number" },
  { label: "Final Indication Shares", key: "final_indication_shares", type: "number" },
  { label: "Final Indication Deal %", key: "final_indication_deal_percentage", type: "number" },
  { label: "Allocation Amount (USD)", key: "allocation_amount_usd", type: "number" },
  { label: "Allocation Shares", key: "allocation_shares", type: "number" },
  { label: "Allocation % of Deal Size", key: "allocation_deal_size_percentage", type: "number" },
  { label: "Allocation % of IOI", key: "allocation_percentage", type: "number" },
];

const tableLeft2: Row[] = [
  { label: "% of Free Float (Current Float)", key: "percent_of_free_float_current_float" },
  { label: "% of Free Float (Pre-Deal)", key: "percent_of_free_float_pre_deal" },
  { label: "Short Interest (Shares)", key: "short_interest_shares" },
  { label: "Short Interest (Dollar Amount)", key: "short_interest_dollar_amount" },
  { label: "Short Interest (Percentage of Deal)", key: "short_interest_percentage_of_deal" },
  { label: "Shares Outstanding Pre-Deal", key: "shares_outstanding_pre_deal", type: "number" },
  { label: "Market Cap Pre-Deal (USD)", key: "market_cap_pre_deal_usd", type: "number" },
  { label: "Market Cap Pre-Deal (CHF)", key: "market_cap_pre_deal_chf", type: "number" },
  { label: "Launch Date", key: "launch_date", type: "date" },
  { label: "Trade Date", key: "trade_date", type: "date" },
  { label: "Settlement Date", key: "settlement_date", type: "date" },
  { label: "Next Results Date", key: "next_results_date", type: "date" },
  { label: "Percent Change Last 7 Days", key: "percent_change_last_7_days" },
  { label: "52 Week High", key: "week_52_high", type: "number" },
  { label: "Percent Below 52 Week High", key: "percent_below_52_week_high" },
  { label: "3M ADTV (EU) USD", key: "three_month_adtv_eu_usd" },
];

const tableRight2: Row[] = [
  { label: "3M ADTV (EU) Shares", key: "three_month_adtv_eu_shares" },
  { label: "3M ADTV (Local) USD", key: "three_month_adtv_local_usd" },
  { label: "3M ADTV (Local) Shares", key: "three_month_adtv_local_shares" },
  { label: "Beta (SMI)", key: "beta_smi", type: "number" },
  { label: "3M Volatility", key: "three_month_volatility", type: "number" },
  { label: "RSI (14D)", key: "rsi_14d", type: "number" },
  { label: "RSI (30D)", key: "rsi_30d", type: "number" },
  { label: "DMI (14D)", key: "dmi_14d", type: "number" },
  { label: "MACD (9D)", key: "macd_9d", type: "number" },
  { label: "Stock Relative to MA (20D)", key: "stock_relative_to_ma_20d" },
  { label: "Stock Relative to MA (50D)", key: "stock_relative_to_ma_50d" },
  { label: "Stock Relative to MA (100D)", key: "stock_relative_to_ma_100d" },
  { label: "Stock Relative to MA (200D)", key: "stock_relative_to_ma_200d" },
];

const tableLeft3: Row[] = [
  { label: "Deal Color", key: "deal_color" },
  { label: "Institutional Allocation (%)", key: "institutional_allocation_percent", type: "number" },
  { label: "Retail Allocation (%)", key: "retail_allocation_percent", type: "number" },
  { label: "Long Only Allocation (%)", key: "long_only_allocation_percent", type: "number" },
  { label: "Hedge Funds Allocation (%)", key: "hedge_funds_allocation_percent", type: "number" },
  { label: "Local Allocation (%)", key: "local_allocation_percent", type: "number" },
  { label: "International Allocation (%)", key: "international_allocation_percent", type: "number" },
  { label: "Top 10 Allocation Concentration (%)", key: "top_10_allocation_concentration_percent", type: "number" },
];

const tableRight3: Row[] = [
  { label: "Aftermarket Order", key: "aftermarket_order" },
  { label: "Aftermarket Strategy", key: "aftermarket_strategy" },
  { label: "Target Price (Local)", key: "target_price_local", type: "number" },
  { label: "Target Price % Above Issue", key: "target_price_percentage_above_issue", type: "number" },
  { label: "Stop Price (Local)", key: "stop_price_local", type: "number" },
  { label: "Stop Price % Below Issue", key: "stop_price_percentage_below_issue", type: "number" },
];

function flattenObject(obj: any, result: Record<string, any> = {}): Record<string, any> {
  for (let key in obj) {
    if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], result);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

const Basci1: React.FC = () => {
  const defaultData = {
    pricing_date: "",
    vendor_issuer: "",
    ticker: "",
    region: "",
    deal_type: "",
    fo_type: "",
    sector: "",
    deal_size_amount_usd: 0,
    deal_size_shares: 0,
    deal_captain: "",
    invitation_bank: "",
    sponsor: "",
    percentage_primary: 0,
    price_local_currency: 0,
    discount_percentage: 0,
    last_close_price: 0,
    initial_range: "",
    final_indication_amount_usd: 0,
    final_indication_shares: 0,
    final_indication_deal_percentage: 0,
    allocation_amount_usd: 0,
    allocation_shares: 0,
    allocation_deal_size_percentage: 0,
    allocation_percentage: 0,
    // Add more default fields for the second and third table
    percent_of_free_float_current_float: "",
    percent_of_free_float_pre_deal: "",
    short_interest_shares: "",
    short_interest_dollar_amount: "",
    short_interest_percentage_of_deal: "",
    shares_outstanding_pre_deal: 0,
    market_cap_pre_deal_usd: 0,
    market_cap_pre_deal_chf: 0,
    launch_date: "",
    trade_date: "",
    settlement_date: "",
    next_results_date: "",
    percent_change_last_7_days: "",
    week_52_high: 0,
    percent_below_52_week_high: "",
    three_month_adtv_eu_usd: "",
    // Add more fields for the third table
    deal_color: "",
    institutional_allocation_percent: 0,
    retail_allocation_percent: 0,
    long_only_allocation_percent: 0,
    hedge_funds_allocation_percent: 0,
    local_allocation_percent: 0,
    international_allocation_percent: 0,
    top_10_allocation_concentration_percent: 0,
    aftermarket_order: "",
    aftermarket_strategy: "",
    target_price_local: 0,
    target_price_percentage_above_issue: 0,
    stop_price_local: 0,
    stop_price_percentage_below_issue: 0,
  };

  const [formData, setFormData] = useState(defaultData);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">("success");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string | number>) => {
    const name = e.target.name as string;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) throw new Error("API URL is not defined");
      if (!token) throw new Error("Access token is missing");

      const flattenedData = flattenObject(formData);

      const sanitizedPayload = Object.fromEntries(
        Object.entries(flattenedData).filter(([_, val]) => val !== "" && val !== null)
      );

      const response = await axios.post(`${apiUrl}/api/create_deal_form/`, sanitizedPayload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Saved:", response.data);
      setSnackbarMessage("Data saved successfully and Email sent!");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
    } catch (err) {
      console.error("Save failed:", err);
      setSnackbarMessage("Deal form already exists.");
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const isDataAvailable = (key: string) =>
    formData[key as keyof typeof formData] !== undefined &&
    formData[key as keyof typeof formData] !== "";

  return (
    <Container maxWidth="lg" sx={{ padding: 0, marginBottom: 2 }}>
      {/* First Table in Card */}
      <Card sx={{ marginTop: 2 }}>
        
        <CardContent>
       
          <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom color="#002060" align="center" sx={{ fontWeight: "bold" }}>
              Basic Info
            </Typography>
          </Box>
         
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableLeft1.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff",
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>{row.label}</TableCell>
                        <TableCell>
                          {row.type === "select" ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || "text"}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableRight1.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff",
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>{row.label}</TableCell>
                        <TableCell>
                          {row.type === "select" ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || "text"}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: "right", marginTop: 4 }}>
        <Button variant="contained" sx={{bgcolor:'#002060'}} onClick={handleSave}>
          Save Data
        </Button>
      </Box>
        </CardContent>
      </Card>

      {/* Second Table in Card */}
      <Card sx={{ marginTop: 4 }}>
        <CardContent>
        <Box sx={{ textAlign: "right", marginTop: 4 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Data
        </Button>
      </Box>
          <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom color="#002060" align="center" sx={{ fontWeight: "bold" }}>
              Market Data
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableLeft2.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff",
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>{row.label}</TableCell>
                        <TableCell>
                          {row.type === "select" ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || "text"}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableRight2.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff",
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>{row.label}</TableCell>
                        <TableCell>
                          {row.type === "select" ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || "text"}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Third Table in Card */}
      <Card sx={{ marginTop: 4 }}>
        <CardContent>
        <Box sx={{ textAlign: "right", marginTop: 4 }}>
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Data
        </Button>
      </Box>
          <Box sx={{ padding: 2 }}>
            <Typography variant="h5" gutterBottom color="#002060" align="center" sx={{ fontWeight: "bold" }}>
              Model Color
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableLeft3.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff",
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>{row.label}</TableCell>
                        <TableCell>
                          {row.type === "select" ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || "text"}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableBody>
                    {tableRight3.map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{
                          backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff",
                        }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>{row.label}</TableCell>
                        <TableCell>
                          {row.type === "select" ? (
                            <Select
                              fullWidth
                              size="small"
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleSelectChange}
                            >
                              {row.options?.map((opt) => (
                                <MenuItem key={opt} value={opt}>
                                  {opt}
                                </MenuItem>
                              ))}
                            </Select>
                          ) : (
                            <TextField
                              fullWidth
                              size="small"
                              type={row.type || "text"}
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

     

      {/* Snackbar Message */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Basci1;

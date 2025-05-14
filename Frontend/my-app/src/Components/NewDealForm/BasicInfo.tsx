import React, { useRef, useState } from "react";
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
  Tab,
  Tabs,
  CircularProgress,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";
import axios from "axios";

interface Row {
  label: string;
  key: string;
  type?: "text" | "number" | "select" | "date";
  options?: string[];
}

const tableLeft1: Row[] = [
  { label: "Ticker", key: "ticker" },
  { label: "Pricing Date", key: "pricing_date", type: "date" },
  { label: "Issuer Name", key: "vendor_issuer" },
  {
    label: "Region",
    key: "region",
    type: "select",
    options: ["US", "EMEA", "APAC", "Non-US America"],
  },
  {
    label: "Deal Type",
    key: "deal_type",
    type: "select",
    options: ["IPO", "FO"],
  },
  {
    label: "FO Type",
    key: "fo_type",
    type: "select",
    options: ["Marketed", "Overnight", "Block"],
  },
  {
    label: "Sector",
    key: "sector",
    type: "select",
    options: [
      "Health Care",
      "Information Technology",
      "Financials",
      "Consumer Staples",
      "Real Estate",
      "Materials",
      "Industrials",
      "Energy",
      "Utilities",
      "Consumer Discretionary",
      "Communication Services",
    ],
  },
  { label: "Deal Size ($ Million)", key: "deal_size_amount_usd", type: "number" },
  { label: "Deal Size Shares", key: "deal_size_shares", type: "number" },
  {
    label: "Deal Captain",
    key: "deal_captain",
    type: "select",
    options: ["Robin", "Tom", "Block", "HC", "Jay", "Others"],
  },
  { label: "Lead Bank", key: "invitation_bank" },
  {
    label: "Sponsors (Y/N)",
    key: "sponsor",
    type: "select",
    options: ["Y", "N"],
  },
];

const tableRight1: Row[] = [
  { label: "Primary %", key: "percentage_primary", type:"number" },
  { label: "Issue Price ($)", key: "price_local_currency", type: "number" },
  {
    label: "Discount from Announcement Price (%)",
    key: "discount_percentage",
    type: "number",
  },
  { label: "Last Close Price ($)", key: "last_close_price", type: "number" },
  {
    label: " IOI Amount ($ Million) ",
    key: "final_indication_amount_usd",
    type: "number",
  },
  { label: " IOI Shares", key: "final_indication_shares", type: "number" },
  {
    label: " IOI as % of Deal Size",
    key: "final_indication_deal_percentage",
    type: "number",
  },
  {
    label: "Allocation Amount ($ Million)",
    key: "allocation_amount_usd",
    type: "number",
  },
  { label: "Allocation Shares", key: "allocation_shares", type: "number" },
  {
    label: "Allocation as % of Deal Size",
    key: "allocation_deal_size_percentage",
    type: "number",
  },
  {
    label: "Allocation as % of IOI",
    key: "allocation_percentage",
    type: "number",
  },
];

const tableLeft2: Row[] = [
  { label: "Ltm Dividend Yield (%)", key: "ltm_dividend_yield",type: "number" },

  { label: "% of Free Float ", key: "percent_of_free_float_current_float",type: "number" },
  { label: "Short Interest (Shares)", key: "short_interest_shares" ,type: "number"},
  { label: "Short Interest ($ Million)", key: "short_interest_dollar_amount",type: "number" },
  {
    label: "Short Interest as % of Deal Size",
    key: "short_interest_percentage_of_deal",type: "number"
  },
  {
    label: "Shares Outstanding ",
    key: "shares_outstanding_pre_deal",
    type: "number",
  },
  {
    label: "Market Cap ($ Million)",
    key: "market_cap_pre_deal_usd",
    type: "number",
  },
  { label: "Launch Date", key: "launch_date", type: "date" },
  { label: "Trade Date", key: "trade_date", type: "date" },
  { label: "Settlement Date", key: "settlement_date", type: "date" },
  { label: "Next Results Date", key: "next_results_date", type: "date" },
  {
    label: "Percentage Change in Last 7 Days",
    key: "percent_change_last_7_days",type: "number"
  },
  { label: "52 Week High($)", key: "week_52_high", type: "number" },
  {
    label: "Percent Change from 52 Week High",
    key: "percent_below_52_week_high",type :"number"
  },
];

const tableRight2: Row[] = [
  { label: "Ltm Fcf Yield (%)", key: "ltm_fcf_yield" , type: "number"},
  { label: "3M ADTV  ($ Million)", key: "three_month_adtv_local_usd", type: "number" },
  { label: "3M ADTV  Shares", key: "three_month_adtv_local_shares", type: "number" },
  { label: "Beta (S&P500)", key: "beta_smi", type: "number" },
  { label: "3M Volatility", key: "three_month_volatility", type: "number" },
  { label: "RSI (14D)", key: "rsi_14d", type: "number" },
  { label: "RSI (30D)", key: "rsi_30d", type: "number" },
  { label: "DMI (14D)", key: "dmi_14d", type: "number" },
  { label: "MACD (9D)", key: "macd_9d", type: "number" },
  { label: "DMA 20 ", key: "stock_relative_to_ma_20d", type: "number" },
  { label: "DMA 50", key: "stock_relative_to_ma_50d" , type: "number"},
  { label: "DMA 100", key: "stock_relative_to_ma_100d" , type: "number"},
  { label: "DMA 200", key: "stock_relative_to_ma_200d" , type: "number"},
];

const tableLeft3: Row[] = [
  { label: "Deal Colour", key: "deal_color" },
  {
    label: "Institutional Allocation (%)",
    key: "institutional_allocation_percent",
    type: "number",
  },
  {
    label: "Retail Allocation (%)",
    key: "retail_allocation_percent",
    type: "number",
  },
  {
    label: "Long Only Allocation (%)",
    key: "long_only_allocation_percent",
    type: "number",
  },
  {
    label: "Hedge Funds Allocation (%)",
    key: "hedge_funds_allocation_percent",
    type: "number",
  },
  // {
  //   label: "Local Allocation (%)",
  //   key: "local_allocation_percent",
  //   type: "number",
  // },
    {
    label: "Aftermarket Order (T/F)",
    key: "aftermarket_order",
    type: "select",
    options: ["True", "False"],
  },
  {
    label: "International Allocation (%)",
    key: "international_allocation_percent",
    type: "number",
  },
];

const tableRight3: Row[] = [

  {
    label: "Aftermarket Strategy",
    key: "aftermarket_strategy",
  },
  {
    label: "Top 10 Allocation Concentration (%)",
    key: "top_10_allocation_concentration_percent",
    type: "number",
  },
  { label: "Target Price($) ", key: "target_price_local", type: "number" },
  {
    label: "Target Price % Above Issue",
    key: "target_price_percentage_above_issue",
    type: "number",
  },
  { label: "Stop Price($) ", key: "stop_price_local", type: "number" },
  {
    label: "Stop Price % Below Issue",
    key: "stop_price_percentage_below_issue",
    type: "number",
  },
];

function flattenObject(
  obj: any,
  result: Record<string, any> = {}
): Record<string, any> {
  for (let key in obj) {
    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      flattenObject(obj[key], result);
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

const BasicInfo: React.FC = () => {
  const defaultData = {
    pricing_date: "",
    vendor_issuer: "",
    ticker: "",
    region: "",
    deal_type: "",
    fo_type: "",
    sector: "",
    deal_size_amount_usd: "",
    deal_size_shares: "",
    deal_captain: "",
    invitation_bank: "",
    sponsor: "",
    percentage_primary: "",
    price_local_currency: "",
    discount_percentage: "",
    last_close_price: "",
    initial_range: "",
    final_indication_amount_usd: "",
    final_indication_shares: "",
    final_indication_deal_percentage:"" ,
    allocation_amount_usd: "",
    allocation_shares: "",
    allocation_deal_size_percentage: "",
    allocation_percentage: "",
    // Add more default fields for the second and third table
    percent_of_free_float_current_float: "",
    percent_of_free_float_pre_deal: "",
    short_interest_shares: "",
    short_interest_dollar_amount: "",
    short_interest_percentage_of_deal: "",
    shares_outstanding_pre_deal: "",
    market_cap_pre_deal_usd: "",
    market_cap_pre_deal_chf: "",
    three_month_adtv_local_usd:"",
    ltm_fcf_yield:"",
    ltm_dividend_yield:"",
    percent_change_last_7_days: "",
    week_52_high: "",
    percent_below_52_week_high: "",
    three_month_adtv_eu_usd: "",
    stock_relative_to_ma_200d:"",
    stock_relative_to_ma_100d:"",
    stock_relative_to_ma_50d:"",
    stock_relative_to_ma_20d:"",
    macd_9d:"",
    dmi_14d:"",
    rsi_30d:"",
    rsi_14d:"",
    three_month_volatility:"",
    deal_color: "",
    institutional_allocation_percent: "",
    retail_allocation_percent: "",
    long_only_allocation_percent: "",
    hedge_funds_allocation_percent: "",
    local_allocation_percent:"",
    international_allocation_percent: "",
    top_10_allocation_concentration_percent: "",
    aftermarket_order: "",
    aftermarket_strategy: "",
    target_price_local: "",
    target_price_percentage_above_issue: "",
    stop_price_local: "",
    stop_price_percentage_below_issue: "",
  };

  const [formData, setFormData] = useState(defaultData);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success"
  );
  const [tabIndex, setTabIndex] = useState(0);

  const basicInfoRef = useRef<HTMLDivElement>(null);
  const marketDataRef = useRef<HTMLDivElement>(null);
  const dealColorRef = useRef<HTMLDivElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
    const refs = [basicInfoRef, marketDataRef, dealColorRef];
    refs[newValue]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };
  const [isLoading, setIsLoading] = useState(false);


  const handleReset = () => {
    setFormData(defaultData); 
  };
  
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
    setIsLoading(true); 
    
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) throw new Error("API URL is not defined");
    if (!token) throw new Error("Access token is missing");

    const flattenedData = flattenObject(formData);

    const sanitizedPayload = Object.fromEntries(
      Object.entries(flattenedData).filter(
        ([_, val]) => val !== "" && val !== null
      )
    );

    const response = await axios.post(
      `${apiUrl}/api/create_deal_form/`,
      sanitizedPayload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("Saved:", response.data);
    setSnackbarMessage("Data saved successfully and Email sent!");
    setSnackbarSeverity("success");
    setOpenSnackbar(true);
  } catch (err) {
    console.error("Save failed:", err);
    setSnackbarMessage("Deal form already exists.");
    setSnackbarSeverity("error");
    setOpenSnackbar(true);
  } finally {
    setIsLoading(false); 
  }
};

  const isDataAvailable = (key: string) =>
    formData[key as keyof typeof formData] !== undefined &&
    formData[key as keyof typeof formData] !== "";

  return (
<Container maxWidth="lg" sx={{ padding: 0, marginBottom: 2 }}>
  {/* Sticky Tabs */}
  <Box
    sx={{
      position: "sticky",
      top: 0,
      zIndex: 10,
      backgroundColor: "#fff",
      borderBottom: "1px solid #ccc",
      mt: 2,
    }}
  >
    <Box style={{ display: "flex", width: "100%", alignItems: "center" }}>
      <Box style={{ width: "90%", textAlign: "center" }}>
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          centered
          TabIndicatorProps={{
            style: { display: "none" },
          }}
          sx={{
            display: "flex",
            justifyContent: "center",
            margin: "10px 0",
            "& .MuiTab-root": {
              backgroundColor: "#E3E6F0", 
              color: "#002060", 
              borderRadius: "12px",
              padding: "10px 20px",
              fontSize: "0.9rem",
              fontWeight: "600",
              margin: "0 5px",
              textTransform: "none", 
              transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
              "&:hover": {
                backgroundColor: "#DCE6F0", 
                transform: "translateY(-2px)",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              },
            },
            "& .Mui-selected": {
              backgroundColor: "#013e3a", 
              color: "#ffffff !important", 
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", 
            },
          }}
        >
          <Tab label="Basic Info" />
          <Tab label="Market Data" />
          <Tab label="Deal Color" />
        </Tabs>
      </Box>
   <Button
  variant="contained"
  sx={{ bgcolor: "#002060" }}
  onClick={handleSave}
  disabled={isLoading} // Disable button while loading
>
  {isLoading ? (
    <CircularProgress size={24} sx={{ color: "white" }} />
  ) : (
    "Save"
  )}
</Button>

<Button 
  onClick={handleReset} 
  variant="outlined" 
  color="secondary" 
  sx={{ ml: 2 }}  // adds margin-left
>
  Reset
</Button>


    </Box>
  </Box>

  {/* Scrollable Sections */}
    {/* Basic Info Card */}
    <div ref={basicInfoRef}>
      <Card sx={{ marginTop: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" color="#002060" sx={{ fontWeight: "bold" }}>
            Basic Info
          </Typography>
          <Grid container spacing={2} mt={2}>
            {[tableLeft1, tableRight1].map((tableData, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TableContainer component={Paper}>
                  <Table size="small">
                  <TableBody>
  {tableData.map((row, i) => (
    <TableRow key={row.key} sx={{ backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff" }}>
      <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>
        {row.label}
      </TableCell>
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
            name={row.key}
            value={formData[row.key as keyof typeof formData]}
            onChange={handleChange}
            type={row.type}  // Add this line to use the correct input type
          />
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>

                  </Table>
                </TableContainer>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </div>

    {/* Market Data Card */}
    <div ref={marketDataRef}>
      <Card sx={{ marginTop: 4 }}>
        <CardContent>
          <Typography variant="h5" align="center" color="#002060" sx={{ fontWeight: "bold" }}>
            Market Data
          </Typography>
          <Grid container spacing={2} mt={2}>
            {[tableLeft2, tableRight2].map((tableData, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <TableContainer component={Paper}>
                  <Table size="small">
                  <TableBody>
  {tableData.map((row, i) => (
    <TableRow key={row.key} sx={{ backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff" }}>
      <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>
        {row.label}
      </TableCell>
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
            name={row.key}
            value={formData[row.key as keyof typeof formData]}
            onChange={handleChange}
            type={row.type}  // Add this line to use the correct input type
          />
        )}
      </TableCell>
    </TableRow>
  ))}
</TableBody>
                  </Table>
                </TableContainer>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </div>

   {/* Deal Color Card */}
<div ref={dealColorRef}>
  <Card sx={{ marginTop: 4 }}>
    <CardContent>
      <Typography variant="h5" align="center" color="#002060" sx={{ fontWeight: "bold" }}>
        Deal Color
      </Typography>
      <Grid container spacing={2} mt={2}>
        
        {/* 🔵 Full-width Deal Color Row */}
        <Grid item xs={12}>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableBody>
                {(() => {
                  const allRows = [...tableLeft3, ...tableRight3];
                  const dealColorRow = allRows.find((row) => row.key === "deal_color");
                  if (!dealColorRow) return null;
                  return (
                    <TableRow sx={{ backgroundColor: "#f3f3f3" }}>
                      <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem", width: '20%' }}>
                        {dealColorRow.label}
                      </TableCell>
                      <TableCell>
                        {dealColorRow.type === "select" ? (
                          <Select
                            fullWidth
                            size="small"
                            name={dealColorRow.key}
                            value={formData[dealColorRow.key as keyof typeof formData]}
                            onChange={handleSelectChange}
                          >
                            {dealColorRow.options?.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </Select>
                        ) : (
                          <TextField
                            fullWidth
                            size="small"
                            name={dealColorRow.key}
                            value={formData[dealColorRow.key as keyof typeof formData]}
                            onChange={handleChange}
                            type={dealColorRow.type}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })()}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>

        {/* 🟦 Two-column Remaining Table Rows */}
        {[tableLeft3, tableRight3].map((tableData, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableBody>
                  {tableData
                    .filter((row) => row.key !== "deal_color")
                    .map((row, i) => (
                      <TableRow
                        key={row.key}
                        sx={{ backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#fff" }}
                      >
                        <TableCell sx={{ fontWeight: "bold", fontSize: "0.85rem" }}>
                          {row.label}
                        </TableCell>
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
                              name={row.key}
                              value={formData[row.key as keyof typeof formData]}
                              onChange={handleChange}
                              type={row.type}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        ))}

      </Grid>
    </CardContent>
  </Card>
</div>


  {/* Snackbar */}
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

export default BasicInfo;

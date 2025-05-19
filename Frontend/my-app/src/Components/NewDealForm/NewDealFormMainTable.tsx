import {
  Box,
  Typography,
  TextField,
  Button,
  Container,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  MenuItem,
  Select,
  Tab,
  Tabs,
  IconButton,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { SelectChangeEvent } from "@mui/material/Select";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert, { AlertColor } from "@mui/material/Alert";
import { useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import AddCircleIcon from "@mui/icons-material/AddCircle";

interface NewDealFormMainTableProps {
  selecteditems: any;
}

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
const fieldLabels: Record<string, Record<string, string>> = {
  basic_info: {
    ticker: "Ticker",
    pricing_date: "Pricing Date",
    vendor_issuer: "Issuer Name",
    region: "Region",
    deal_type: "Deal Type",
    fo_type: "FO Type",
    sector: "Sector",
    deal_size_amount_usd: "Deal Size ($ Million)",
    deal_size_shares: "Deal Size Shares",
    deal_captain: "Deal Captain",
    invitation_bank: "Lead Bank",
    sponsor: "Sponsor (Y/N)",
    percentage_primary: "Primary %",
    price_local_currency: "Issue Price ($)",
    discount_percentage: "Discount from Announcement Price (%)",
    last_close_price: "Last Close Price($)",
    initial_range: "Initial Range",
    final_indication_amount_usd: "IOI Amount ($ Million)",
    final_indication_shares: "IOI Shares",
    final_indication_deal_percentage: "IOI as % of Deal Size",
    allocation_amount_usd: "Allocation Amount ($ Million)",
    allocation_shares: "Allocation Shares",
    allocation_deal_size_percentage: "Allocation as % Deal Size",
    allocation_percentage: "Allocation as % of IOI",
  },
  market_data: {
    percent_of_free_float_current_float: "% of Free Float ",
    short_interest_shares: "Short Interest (Shares)",
    short_interest_dollar_amount: "Short Interest ($ Million)",
    short_interest_percentage_of_deal: "Short Interest as % of Deal Size",
    shares_outstanding_pre_deal: "Shares Outstanding ",
    market_cap_pre_deal_usd: "Market Cap ($ Million)",
    launch_date: "Launch Date",
    trade_date: "Trade Date",
    settlement_date: "Settlement Date",
    next_results_date: "Next Results Date",
    percent_change_last_7_days: "Percent Change in Last 7 Days",
    week_52_high: "52 Week High ($)",
    percent_below_52_week_high: "Percent Change from 52 Week High",
    three_month_adtv_local_usd: "3M ADTV ($ Million)",
    three_month_adtv_local_shares: "3M ADTV Shares",
    beta_smi: "Beta (S&P500)",
    three_month_volatility: "3M Volatility",
    rsi_14d: "RSI (14D)",
    rsi_30d: "RSI (30D)",
    dmi_14d: "DMI (14D)",
    macd_9d: "MACD (9D)",
    stock_relative_to_ma_20d: "DMA 20",
    stock_relative_to_ma_50d: "DMA 50",
    stock_relative_to_ma_100d: "DMA 100",
    stock_relative_to_ma_200d: "DMA 200",
  },
  deal_color: {
    deal_colour: "Deal Colour",
    institutional_allocation_percent: "Institutional Allocation (%)",
    retail_allocation_percent: "Retail Allocation (%)",
    long_only_allocation_percent: "Long Only Allocation (%)",
    hedge_funds_allocation_percent: "Hedge Funds Allocation (%)",
    local_allocation_percent: "Local Allocation (%)",
    international_allocation_percent: "International Allocation (%)",
    top_10_allocation_concentration_percent:
      "Top 10 Allocation Concentration (%)",
    aftermarket_order: "Aftermarket Order (T/F)",
    aftermarket_strategy: "Aftermarket Strategy",
    target_price_local: "Target Price ($)",
    target_price_percentage_above_issue: "Target Price % Above Issue",
    stop_price_local: "Stop Price ($)",
    stop_price_percentage_below_issue: "Stop Price % Below Issue",
  },

  // You can add 'market_data' and 'deal_color' labels similarly if needed
};

const fieldFormatters: Record<
  string,
  Record<string, "currency" | "percentage" | "float">
> = {
  basic_info: {
    // Currency fields
    price_local_currency: "currency",
    deal_size_amount_usd: "currency",
    final_indication_amount_usd: "currency",
    allocation_amount_usd: "currency",

    // Percentage fields
    discount_percentage: "percentage",
    percentage_primary: "percentage",
    final_indication_deal_percentage: "percentage",
    allocation_deal_size_percentage: "percentage",
    allocation_percentage: "percentage",

    // Float fields
    last_close_price: "float",
  },
};

const dropdownOptions: Record<string, string[]> = {
  aftermarket_order: ["True", "False"],
  region: ["US", "EMEA", "APAC", "Non-US America"],
  deal_type: ["IPO", "FO"],
  fo_type: ["Marketed", "Overnight", "Block"],
  sector: [
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
  deal_captain: ["Robin", "Tom", "Block", "HC", "Jay", "Others"],
  sponsor: ["Y", "N"],
  invitation_bank: [
    "ABN AMRO Bank",
    "Bank of America",
    "Barclays",
    "BMO Capital Markets",
    "BNP Paribas",
    "Canaccord Genuity",
    "CIBC World Markets",
    "Citigroup Global Markets Inc",
    "Commerzbank Group",
    "Cowen & Company LLC",
    "Credit Suisse",
    "Deutsche Bank",
    "Evercore Inc",
    "Goldman Sachs",
    "HSBC",
    "Jefferies LLC",
    "JMP Securities LLC",
    "JPMorgan",
    "Keefe Bruyette & Woods",
    "Lazard Capital Markets",
    "Leerink Partners LLC",
    "Morgan Stanley",
    "Needham & Co LLC",
    "Nomura Securities Co Ltd",
    "Oppenheimer & Co Inc",
    "Raymond James & Associates Inc",
    "RBC Capital Markets",
    "Robert W Baird & Co",
    "SG Corporate & Investment Banking",
    "Stifel",
    "SunTrust Robinson Humphrey Inc",
    "SVB Securities LLC",
    "TD Securities Inc",
    "UBS",
    "William Blair & Co LLC",
    "Others",
  ],
};

const NewDealFormMainTable: React.FC<NewDealFormMainTableProps> = ({
  selecteditems,
}) => {
  const [formData, setFormData] = useState<any>({});
  const [isEditable, setIsEditable] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] =
    useState<AlertColor>("success");
  const [tabIndex, setTabIndex] = useState(0); // State to manage active tab
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const dateFields = [
    "launch_date",
    "trade_date",
    "settlement_date",
    "next_results_date",
    "pricing_date",
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl)
          throw new Error("API URL is not defined in environment variables");
        if (!token) throw new Error("Access token is missing");

        const response = await axios.post(
          `${apiUrl}/api/equity_deal_form/`,
          selecteditems,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setFormData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [selecteditems]);

  const handleSnackbarClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<any> | SelectChangeEvent<any>,
    section: string,
    key: string
  ) => {
    if (!isEditMode) {
      setSnackbarMessage('Please click "Edit" to make changes');
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const updatedFormData = { ...formData };
    updatedFormData[section][key] = e.target.value;
    setFormData(updatedFormData);
  };

  const handleDateChange = (date: any, section: string, key: string) => {
    const updatedFormData = { ...formData };
    updatedFormData[section][key] = date;
    setFormData(updatedFormData);
  };
  const navigate = useNavigate();

  const handleIconClick = () => {
    navigate("/equity/create_form");
  };

  const formatFieldValue = (
    section: string,
    key: string,
    value: any
  ): string => {
    const formatType = fieldFormatters[section]?.[key];

    if (formatType === "currency") {
      const number = parseFloat(value);
      return isNaN(number)
        ? value
        : `$${number.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }

    if (formatType === "percentage") {
      const number = parseFloat(value);
      return isNaN(number) ? value : `${number.toFixed(2)}%`;
    }

    if (formatType === "float") {
      const number = parseFloat(value);
      return isNaN(number) ? value : number.toFixed(2);
    }

    return value?.toString() || "";
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl)
        throw new Error("API URL is not defined in environment variables");
      if (!token) throw new Error("Access token is missing");

      const flattenedData = flattenObject(formData);
      const { company_details, ...payloadData } = flattenedData;

      const sanitizedPayloadData = Object.keys(payloadData).reduce(
        (acc: Record<string, any>, key) => {
          const value = payloadData[key];
          if (typeof value === "string") {
            const trimmedValue = value.trim();
            acc[key] = trimmedValue !== "" ? trimmedValue : "";
          } else if (value !== null && value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      const payload = {
        ticker: selecteditems.ticker,
        ...sanitizedPayloadData,
      };

      const response = await axios.post(`${apiUrl}/api/update_data/`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // setSelectedTicker(ResponsiveContainer.ticker)
      setIsEditMode(false);
      setIsEditable(false);

      setSnackbarMessage("Form updated successfully!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating data:", error);
      setSnackbarMessage("An error occurred while updating the form.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditClick = () => {
    setIsEditMode(true);
    setIsEditable(true);
  };

  const capitalizeLabel = (section: string, key: string): string => {
    return (
      fieldLabels[section]?.[key] ||
      key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    );
  };
  const renderInputField = (section: string, key: string, value: any) => {
  const isDropdown = Object.keys(dropdownOptions).includes(key);
  const isDateField = dateFields.includes(key);

  const handleFieldClick = () => {
    if (!isEditMode) {
      setSnackbarMessage('Please click "Edit" to make changes');
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
    }
  };

  const labelText = capitalizeLabel(section, key);

  if (isDropdown) {
    return (
      <TextField
        id="standard-basic"
        select
        label={labelText}
        value={value || ""}
        onClick={handleFieldClick}
        onChange={(e) => handleInputChange(e, section, key)}
        fullWidth
        variant="standard"
        disabled={!isEditable}
        InputLabelProps={{
          shrink: true,
          sx: { fontSize: "20px", color: "#000" }, // 👈 Bigger label
        }}
        InputProps={{
          sx: { fontSize: "20" },
        }}
        SelectProps={{
          MenuProps: {
            PaperProps: {
              sx: { fontSize: "20px" },
            },
          },
        }}
      >
        {dropdownOptions[key].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
    <TextField
      id="standard-basic"
      label={labelText}
      type={isDateField ? "date" : "text"}
      value={value || ""}
      onClick={handleFieldClick}
      onChange={(e) => handleInputChange(e, section, key)}
      fullWidth
      variant="standard"
      disabled={!isEditable}
      InputLabelProps={{
        shrink: true,
        sx: { fontSize: "16px", color: "#000" },
      }}
      InputProps={{
        sx: { fontSize: "14px" },
      }}
    />
  );
};


const renderFormFields = (section: string, sectionData: any) => {
  if (!sectionData) return null;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, 1fr)",
          md: "repeat(3, 1fr)",
        },
        gap: 2,
        backgroundColor: "#e6f2ff",
        borderRadius: 2,
        p: 2,
        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        width: "100%",
        ml: "-18.5px",
      }}
    >
      {Object.entries(sectionData).map(([key, value]) => (
        <Box key={key}>{renderInputField(section, key, value)}</Box>
      ))}
    </Box>
  );
};



  const renderSection = (title: string, sectionKey: string) => (
    <Container maxWidth="lg">
      <Card
        sx={{
          mt: 4,
          backgroundColor: "#e6f2ff",
          borderRadius: 3,
          p: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          border: "1px solid #e0e0e0",
          width: "100%",
          maxWidth: "2000px",
          mx: "auto", // centers horizontally
        }}
      >
        <CardContent sx={{ px: 3, py: 2, backgroundColor: "#e6f2ff" }}>
          <Typography
            variant="h5"
            align="center"
            color="#002060"
            sx={{ fontWeight: "bold", mb: 2 }}
          >
            {title}
          </Typography>
          {renderFormFields(sectionKey, formData[sectionKey])}
        </CardContent>
      </Card>
    </Container>
  );

  return (
    <Box
      sx={{
        marginTop: 0,
        padding: 2,
        width: "100%",
        minHeight: "90vh",
        backgroundColor: "#fafafa",
      }}
    >
      {/* Tabs component to manage different sections */}

      <Tabs
        value={tabIndex}
        onChange={(e, newTabIndex) => setTabIndex(newTabIndex)}
        centered
        TabIndicatorProps={{
          style: { display: "none" },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "10px 0",
          "& .MuiTab-root": {
            backgroundColor: "#E3E6F0", // Neutral background for unselected tabs
            color: "#002060", // Dark blue text for contrast
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: "600",
            margin: "0 5px",
            textTransform: "none", // Avoid all caps
            transition:
              "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#DCE6F0", // Slightly lighter shade on hover
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#013e3a", // Vibrant orange for selected tab
            color: "#ffffff !important", // White text for selected tab
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Stronger shadow for selected tab
          },
        }}
      >
        <Box style={{ display: "flex", width: "100%", alignItems: "center" }}>
          <Box style={{ width: "90%", textAlign: "center" }}>
            <Tabs
              value={tabIndex}
              onChange={(e, newTabIndex) => setTabIndex(newTabIndex)}
              centered
              TabIndicatorProps={{ style: { display: "none" } }} // Hides the default indicator
            >
              <Tab label="Basic Info" />
              <Tab label="Market Data" />
              <Tab label="Deal Color" />
            </Tabs>
          </Box>

          <Button
            onClick={handleIconClick}
            startIcon={<AddCircleIcon />}
            variant="outlined"
            color="secondary"
            sx={{
              backgroundColor: "#00732d",
              textTransform: "none",
              color: "#FFFFFF",
              borderRadius: 2,
              mr: 2,
              "&:hover": { backgroundColor: "#001540" },
            }}
          >
            Create
          </Button>

          <Button
            variant="contained"
            startIcon={isEditMode ? <AddCircleIcon /> : <EditIcon />}
            color={isEditMode ? "success" : "primary"}
            onClick={isEditMode ? handleSave : handleEditClick}
            sx={{
              backgroundColor: "#002060",
              textTransform: "none",
              borderRadius: 2,
              "&:hover": { backgroundColor: "#001540" },
            }}
          >
            {isEditMode ? "Save" : "Edit"}
          </Button>
        </Box>
      </Tabs>

      {/* Conditionally render content based on selected tab */}
      {tabIndex === 0 && renderSection("Basic Info", "basic_info")}
      {tabIndex === 1 && renderSection("Market Data", "market_data")}
      {tabIndex === 2 && renderSection("Deal Color", "deal_color")}

      {/* Snackbar component for feedback */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MuiAlert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default NewDealFormMainTable;

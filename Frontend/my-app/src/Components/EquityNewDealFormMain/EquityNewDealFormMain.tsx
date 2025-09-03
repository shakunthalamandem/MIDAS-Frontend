import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Paper,
  Alert,
  CircularProgress,
  Typography,
  Fade,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import { SelectedOption } from "../../types/NewDealFormData";
import DealFormSectionMainTable from "./DealFormSections/DealFormSectionMainTable";
import DealFormAllTickersTable from "./DealFormSections/DealFormAllTickersTable";
import { useNavigate } from "react-router-dom";
import DealsDropdown from "../Main/UnifiedDealsDataMain/DesignUiPath/DealsDropdown";


function formatDateSimple(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

type ApiResponse = {
  tickers: TickerOption[];
  default_ticker: string;
  total_deal_colour_yes: number;
  total_deal_colour_no: number;
};

type TickerOption = {
  ticker: string;
  pricing_date: string;
  deal_colour_present: "Yes" | "No";
};

type TickerData = {
  ticker: string;
  pricing_date: string;
  deal_colour_present: string; // note: string here, could be "Yes" or "No" or other string
  deal_captain: string;
  deal_type: string;
  allocation_as_percentage_of_deal_size: number | null;
};

const EquityNewDealFormMain: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    null
  );
  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const [totalDealColourNo, setTotalDealColourNo] = useState<number>(0);
    const navigate = useNavigate();


  // Fetch data from API and set options
  const handleSearchClick = async () => {
    setLoading(true);
    setError(null);
    try {
 const response = await axios.post<ApiResponse>(
  `${apiUrl}/api/unified_new_deal_data/`,
  {
    type: "ticker_list",
  },
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  }
);

      const { tickers, default_ticker, total_deal_colour_no } = response.data;

      setOptions(tickers);
      setTotalDealColourNo(total_deal_colour_no);

      // Set default selected option only if no selection exists
      if (!selectedOption) {
        const defaultDeal = tickers.find(
          (item) => item.ticker === default_ticker
        );
        if (defaultDeal) {
          setSelectedOption({ ...defaultDeal, create: false });
          return; // exit early so we don't override with CTRI below
        }
        // If no default ticker found, fallback to CTRI
        const fallbackDeal = tickers.find((item) => item.ticker === "CTRI");
        if (fallbackDeal) {
          setSelectedOption({ ...fallbackDeal, create: false });
        }
      }
    } catch (err) {
      console.error("API call failed:", err);
      setError("API call failed, showing demo data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearchClick();
  }, []);

  const handleCreateClick = () => {
    setSelectedOption({
      ticker: "",
      pricing_date: "",
      create: true,
      deal_colour_present: "",
    });
    if (autoCompleteRef.current) {
      autoCompleteRef.current.value = "";
    }
  };

  const handleAutocompleteChange = (
    _event: any,
    value: TickerOption | null
  ) => {
    if (value) {
      setSelectedOption({ ...value, create: false });
    } else {
      setSelectedOption(null);
    }
  };

  // NEW: handle click on row in DealFormAllTickersTable
  const handleTickerRowClick = (row: TickerData) => {
    // Convert TickerData to TickerOption shape (deal_colour_present must be "Yes" | "No")
    const option: TickerOption = {
      ticker: row.ticker,
      pricing_date: row.pricing_date,
      deal_colour_present: row.deal_colour_present === "Yes" ? "Yes" : "No",
    };
    setSelectedOption({ ...option, create: false });
  };

  return (
    <Fade in timeout={500}>
      <Paper
        elevation={4}
        sx={{
          p: 4,
          borderRadius: 4,
          background: "linear-gradient(145deg, #f4f8ff, #ffffff)",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={3}
        >
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 600, color: "#002060", mb: 0.5 }}
            >
              Equity New Deal Form
            </Typography>

            {/* Pass the onRowClick handler here */}
            

            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              Create or search for an equity deal by ticker and pricing date to
              get the complete deal form.
            </Typography>
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={2}
            mt={{ xs: 2, sm: 0 }}
            flexWrap="wrap"
            justifyContent="flex-end"
          >
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateClick}
              sx={{
                minWidth: 100,
                textTransform: "none",
                background: "linear-gradient(to right, #002060, #004aad)",
                color: "#fff",
                fontWeight: 500,
                px: 2,
                boxShadow: "0 3px 6px rgba(0, 0, 0, 0.2)",
                "&:hover": {
                  background: "linear-gradient(to right, #003080, #0055cc)",
                },
              }}
            >
              Create New
            </Button>

            <Autocomplete
              options={options}
              getOptionLabel={(option) =>
                `${option.ticker} - ${formatDateSimple(option.pricing_date)}`
              }
              onChange={handleAutocompleteChange}
              onOpen={handleSearchClick}
              loading={loading}
              value={
                selectedOption?.ticker
                  ? options.find(
                      (opt) =>
                        opt.ticker === selectedOption.ticker &&
                        opt.pricing_date === selectedOption.pricing_date
                    ) || null
                  : null
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Ticker"
                  variant="outlined"
                  size="small"
                  inputRef={autoCompleteRef}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <SearchIcon sx={{ color: "#666", mr: 1 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loading && (
                          <CircularProgress
                            color="inherit"
                            size={20}
                            sx={{ mr: 1 }}
                          />
                        )}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    minWidth: 300,
                    backgroundColor: "#fff",
                    borderRadius: 1,
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  gap={0.5}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="flex-start"
                    gap={1}
                    width="100%"
                  >
                    <Typography fontWeight="bold">{option.ticker}</Typography>

                    <Box
                      sx={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        backgroundColor:
                          option.deal_colour_present === "Yes"
                            ? "green"
                            : "red",
                        mt: "2px",
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "left", width: "100%" }}
                  >
                    {formatDateSimple(option.pricing_date)}
                  </Typography>
                </Box>
              )}
            />
            <DealsDropdown />
          
            <Box width="100%" display="flex" justifyContent="flex-end" mt={1}>
              <Typography variant="caption" color="red">
                🔴 {totalDealColourNo} deal colour
                {totalDealColourNo > 1 ? "s" : ""} are missing
              </Typography>

           </Box>
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <DealFormAllTickersTable onRowClick={handleTickerRowClick} />
        <DealFormSectionMainTable selectedOption={selectedOption} />
      </Paper>
    </Fade>
  );
};

export default EquityNewDealFormMain;

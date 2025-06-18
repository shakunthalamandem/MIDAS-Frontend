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
import { SelectedOption, TickerOption } from "../../types/NewDealFormData";
import DealFormSectionMainTable from "./DealFormSections/DealFormSectionMainTable";

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
};

const EquityNewDealFormMain: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(null);
  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoCompleteRef = useRef<HTMLInputElement>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSearchClick = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get<ApiResponse>(`${apiUrl}/api/new_deal_ticker_list/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const { tickers, default_ticker } = response.data;

      setOptions(tickers);

      if (!selectedOption && default_ticker) {
        const defaultDeal = tickers.find(
          (item) => item.ticker === default_ticker
        );
        if (defaultDeal) {
          setSelectedOption({ ...defaultDeal, create: false });
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
    setSelectedOption({ ticker: "", pricing_date: "", create: true });
    if (autoCompleteRef.current) {
      autoCompleteRef.current.value = "";
    }
  };

  const handleAutocompleteChange = (_event: any, value: TickerOption | null) => {
    if (value) {
      setSelectedOption({ ...value, create: false });
    } else {
      setSelectedOption(null);
    }
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
            <Typography variant="body1" color="text.secondary">
              Create or search for an equity deal by ticker and pricing date to get the complete deal form.
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
                          <CircularProgress color="inherit" size={20} sx={{ mr: 1 }} />
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
                <Box component="li" {...props}>
                  <Box>
                    <Typography fontWeight="bold">{option.ticker}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDateSimple(option.pricing_date)}
                    </Typography>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="warning" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <DealFormSectionMainTable selectedOption={selectedOption} />
      </Paper>
    </Fade>
  );
};

export default EquityNewDealFormMain;

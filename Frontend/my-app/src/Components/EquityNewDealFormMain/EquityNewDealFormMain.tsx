import React, { useEffect, useRef, useState } from "react";
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

// Helper: safe-format date for display / searching
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

// Debounce hook (small local implementation)
function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

type ApiResponse = {
  tickers: TickerOption[];
  default_ticker?: string;
  total_deal_colour_yes?: number;
  total_deal_colour_no?: number;
};

type TickerOption = {
  ticker: string;
  pricing_date: string;
  deal_colour_present: "Yes" | "No" | string;
};

type TickerData = {
  ticker: string;
  pricing_date: string;
  deal_colour_present: string;
  deal_captain?: string;
  deal_type?: string;
  allocation_as_percentage_of_deal_size?: number | null;
};

const EquityNewDealFormMain: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<SelectedOption | null>(
    null
  );
  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [totalDealColourNo, setTotalDealColourNo] = useState<number>(0);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const navigate = useNavigate();

  // keep track if we've fetched at least once (so we don't overwrite user selection unexpectedly)
  const fetchedOnceRef = useRef(false);

  // Debounced input used to filter list (avoids excessive re-renders)
  const debouncedInput = useDebounce(inputValue, 250);

  // Fetch tickers from server (call on mount and when user explicitly refreshes)
  const fetchTickers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post<ApiResponse>(
        `${apiUrl}/api/unified_new_deal_data/`,
        { type: "ticker_list" },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const tickers = response.data.tickers || [];

      // Deduplicate by ticker + pricing_date
      const uniqueMap = new Map<string, TickerOption>();
      for (const t of tickers) {
        const key = `${t.ticker}||${t.pricing_date}`;
        if (!uniqueMap.has(key)) uniqueMap.set(key, t);
      }
      const uniqueTickers = Array.from(uniqueMap.values());

      setOptions(uniqueTickers);
      setTotalDealColourNo(response.data.total_deal_colour_no ?? 0);

      // Only set a default selection the first time we fetch and only if user hasn't picked anything
      if (!fetchedOnceRef.current) {
        fetchedOnceRef.current = true;
        const defaultTicker = response.data.default_ticker;
        if (!selectedOption) {
          let defaultDeal = uniqueTickers.find(
            (t) => t.ticker === defaultTicker
          );
          if (!defaultDeal)
            defaultDeal = uniqueTickers.find((t) => t.ticker === "CTRI");
          if (defaultDeal) setSelectedOption({ ...defaultDeal, create: false });
        }
      }
    } catch (err) {
      console.error("API call failed:", err);
      setError("API call failed, showing demo data");
    } finally {
      setLoading(false);
    }
  };

  // initial fetch
  useEffect(() => {
    fetchTickers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the user has selected something that isn't in the options list (eg. created manually), ensure it's present so Autocomplete can display it
  useEffect(() => {
    if (selectedOption && !selectedOption.create) {
      const exists = options.some(
        (o) =>
          o.ticker === selectedOption.ticker &&
          o.pricing_date === selectedOption.pricing_date
      );
      if (!exists) {
        setOptions((prev) => [
          {
            ticker: selectedOption.ticker,
            pricing_date: selectedOption.pricing_date,
            deal_colour_present: selectedOption.deal_colour_present ?? "No",
          },
          ...prev,
        ]);
      }
    }
  }, [selectedOption, options]);

  const handleCreateClick = () => {
    setSelectedOption({
      ticker: "",
      pricing_date: "",
      create: true,
      deal_colour_present: "",
    });
    setInputValue("");
  };

  const handleAutocompleteChange = (_: any, value: TickerOption | null) => {
    if (value) {
      setSelectedOption({ ...value, create: false });
    } else {
      setSelectedOption(null);
    }
  };

  // This handler is used by the table rows
  const handleTickerRowClick = (row: TickerData) => {
    const option: TickerOption = {
      ticker: row.ticker,
      pricing_date: row.pricing_date,
      deal_colour_present: row.deal_colour_present === "Yes" ? "Yes" : "No",
    };
    setSelectedOption({ ...option, create: false });
  };

  // Filtering logic for Autocomplete — uses debounced input to reduce chattiness
  const filteredOptions = React.useMemo(() => {
    const q = debouncedInput.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const tickerMatch = o.ticker.toLowerCase().includes(q);
      const dateMatch = formatDateSimple(o.pricing_date)
        .toLowerCase()
        .includes(q);
      const rawDateMatch = (o.pricing_date || "").toLowerCase().includes(q);
      return tickerMatch || dateMatch || rawDateMatch;
    });
  }, [options, debouncedInput]);

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

            {/* Autocomplete is now controlled via inputValue so searches are predictable. We also removed automatic fetching on open. */}
            <Autocomplete
              sx={{ minWidth: 300, backgroundColor: "#fff", borderRadius: 1 }}
              options={filteredOptions}
              getOptionLabel={(option) =>
                `${option.ticker} - ${formatDateSimple(option.pricing_date)}`
              }
              onChange={handleAutocompleteChange}
              value={
                selectedOption
                  ? ((options.find(
                      (opt) =>
                        opt.ticker === selectedOption.ticker &&
                        opt.pricing_date === selectedOption.pricing_date
                    ) as TickerOption) ?? null)
                  : null
              }
              inputValue={inputValue}
              onInputChange={(_, newValue) => setInputValue(newValue)}
              loading={loading}
              isOptionEqualToValue={(option, value) =>
                option.ticker === value.ticker &&
                option.pricing_date === value.pricing_date
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Search Ticker"
                  variant="outlined"
                  size="small"
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
                />
              )}
              renderOption={(props, option) => (
                <Box
                  component="li"
                  {...props}
                  key={`${option.ticker}-${option.pricing_date}`}
                  display="flex"
                  flexDirection="column"
                  alignItems="flex-start"
                  gap={0.5}
                >
                  <Box display="flex" alignItems="center" gap={1} width="100%">
                    <Typography fontWeight="bold">{option.ticker}</Typography>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
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
            {/* 
            <Button variant="outlined" onClick={fetchTickers} startIcon={<SearchIcon />} sx={{ height: 40 }}>
              Refresh
            </Button> */}

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
          <Alert
            severity="warning"
            onClose={() => setError(null)}
            sx={{ mb: 2 }}
          >
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

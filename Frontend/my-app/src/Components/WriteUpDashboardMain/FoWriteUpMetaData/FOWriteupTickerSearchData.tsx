import React, { useEffect, useMemo, useState } from "react";
import {
  Autocomplete,
  Box,
  CircularProgress,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type TickerOption = {
  ticker: string;
  issuer_name?: string | null;
  pricing_date: string | null;
  deal_colour_present?: string | null;
  deal_captain?: string | null;
  deal_type?: string | null;
  allocation_as_percentage_of_deal_size?: number | null;
  region?: string | null;
  exchange?: string | null;
  deal_id?: string | null;
  unique_deal_id?: string | null;
  flag_for_writeup?: string | null;
};

type FOWriteupTickerSearchDataProps = {
  selectedTicker?: string;
  onSelect: (option: TickerOption | null) => void;
};

const formatPricingDate = (value: string | null) => {
  if (!value) return "TBA";
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) return value;
  const date = new Date(parsed);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const FOWriteupTickerSearchData: React.FC<
  FOWriteupTickerSearchDataProps
> = ({ selectedTicker, onSelect }) => {
  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!apiUrl) return;
    let isActive = true;
    const fetchTickers = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/unified_writeup_details/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
          body: JSON.stringify({
            deal_type: "FO",
            // flag_for_writeup: "Y",
          }),
        });
        if (!response.ok) throw new Error("Failed to fetch tickers");
        const data = await response.json();
        const list = Array.isArray(data) ? data : [];
        if (isActive) {
          setOptions(list);
        }
      } catch (error) {
        console.error("Ticker list fetch failed", error);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchTickers();
    return () => {
      isActive = false;
    };
  }, [apiUrl]);

  const sortedOptions = useMemo(() => {
    return [...options].sort((a, b) => {
      const aTime = a.pricing_date ? Date.parse(a.pricing_date) : NaN;
      const bTime = b.pricing_date ? Date.parse(b.pricing_date) : NaN;
      const aValid = !Number.isNaN(aTime);
      const bValid = !Number.isNaN(bTime);
      if (!aValid && !bValid) return 0;
      if (!aValid) return 1;
      if (!bValid) return -1;
      return bTime - aTime;
    });
  }, [options]);

  return (
    <Box sx={{ minWidth: { xs: "100%", sm: 320 } }}>
      <Autocomplete
        size="small"
        options={sortedOptions}
        loading={loading}
        filterOptions={(options, state) => {
          const query = state.inputValue.trim().toLowerCase();
          if (!query) return options;
          return options.filter((option) => {
            const ticker = option.ticker?.toLowerCase() ?? "";
            const date = option.pricing_date?.toLowerCase() ?? "";
            const issuer = option.issuer_name?.toLowerCase() ?? "";
            return (
              ticker.includes(query) ||
              date.includes(query) ||
              issuer.includes(query)
            );
          });
        }}
        value={sortedOptions.find((opt) => opt.ticker === selectedTicker) || null}
        onChange={(_, newValue) => {
          onSelect(newValue);
          setSearchText("");
        }}
        inputValue={searchText}
        onInputChange={(_, newInputValue) => setSearchText(newInputValue)}
        getOptionLabel={(option) =>
          `${option.ticker} (${formatPricingDate(option.pricing_date)})`
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder="Search Company or Ticker..."
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress size={18} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={`${option.ticker}-${option.pricing_date ?? ""}`}>
            <Box sx={{ width: "100%" }}>
              <Typography sx={{ fontWeight: 700, color: "#002060" }}>
                {option.ticker} ({formatPricingDate(option.pricing_date)})
              </Typography>
              <Typography variant="caption" sx={{ color: "#15803d", fontWeight: 600, fontSize: "0.7rem" }}>
                {option.issuer_name || "Issuer name unavailable"}
              </Typography>
            </Box>
          </li>
        )}
      />
    </Box>
  );
};

export default FOWriteupTickerSearchData;

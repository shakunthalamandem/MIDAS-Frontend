import React, { useState } from "react";
import { Autocomplete, TextField, CircularProgress, Box, Typography, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface FSCompetitorSearchProps {
  onSelect: (ticker: string) => void;
}

interface TickerOption {
  id: number;
  ticker: string;
  company: string;
  exchange: string;
}

const FSCompetitorSearch: React.FC<FSCompetitorSearchProps> = ({ onSelect }) => {
  const [options, setOptions] = useState<TickerOption[]>([]);
  const [loading, setLoading] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleSearch = async (query: string) => {
    if (!query) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const res = await fetch(`${apiUrl}/api/fs_ticker_search/?search=${query}`, {
        headers: getHeaders(),
      });

      if (!res.ok) throw new Error("Failed to fetch tickers");

      const data: TickerOption[] = await res.json();
      setOptions(data);
    } catch (error) {
      console.error("Error fetching tickers:", error);
      setOptions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : `${option.ticker} - ${option.company}`
      }
      onInputChange={(_, value) => handleSearch(value)}
      onChange={(_, value) => {
        if (value && typeof value !== "string") {
          onSelect(value.ticker);
        }
      }}
      loading={loading}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          sx={{
            display: "flex",
            flexDirection: "column",
            py: 0.5,
          }}
        >
          <Typography sx={{ fontWeight: "bold", color: "red", fontSize: 14 }}>
            {option.ticker}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "grey.500" }}>
            {option.company}
          </Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          size="small"
          label="Search Tickers or Companies"
          variant="outlined"
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <>
                {loading ? <CircularProgress size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      sx={{ width: 400, marginBottom: 3 }}
    />
  );
};

export default FSCompetitorSearch;

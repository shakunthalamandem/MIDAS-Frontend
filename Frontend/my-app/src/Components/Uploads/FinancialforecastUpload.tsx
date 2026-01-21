import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

type TickerItem = {
  ticker: string;
  pricing_date?: string | null;
  deal_type?: string | null;
  deal_id?: string | null;
  flag_for_writeup?: string | null;
};

const formatDateSimple = (dateString?: string | null): string => {
  if (!dateString) return "TBA";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const FinancialforecastUpload: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [options, setOptions] = useState<TickerItem[]>([]);
  const [selected, setSelected] = useState<TickerItem | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTickers = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!apiUrl) {
          throw new Error("REACT_APP_API_URL is not set.");
        }
        const res = await fetch(`${apiUrl}/api/unified_new_deal_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ type: "ticker_list" }),
        });

        if (!res.ok) {
          throw new Error("Failed to load ticker list.");
        }
        const data = await res.json();
        const items = Array.isArray(data?.tickers) ? (data.tickers as TickerItem[]) : [];
        setOptions(items);
      } catch (err: any) {
        setError(err?.message || "Unable to load ticker list.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickers();
  }, [apiUrl, token]);

  const filteredOptions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => (o.ticker || "").toLowerCase().includes(q));
  }, [options, inputValue]);

  const handleSearch = () => {
    const q = inputValue.trim().toLowerCase();
    if (!q) {
      setSelected(null);
      setError("Enter a ticker to search.");
      return;
    }
    const exactMatch = options.find((o) => (o.ticker || "").toLowerCase() === q);
    const fallbackMatch = options.find((o) => (o.ticker || "").toLowerCase().includes(q));
    const match = exactMatch || fallbackMatch || null;
    setSelected(match);
    if (!match) {
      setError("No matching ticker found.");
    } else {
      setError(null);
    }
  };

  return (
    <Box sx={{ px: { xs: 2, md: 4 }, py: 3 }}>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            Financial Forecast Upload - Ticker Search
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Search a ticker to view the unified deal details returned by the API.
          </Typography>

          <Stack spacing={2}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
              <Autocomplete
                sx={{ flex: 1, minWidth: 260 }}
                options={filteredOptions}
                getOptionLabel={(option) =>
                  `${option.ticker} - ${formatDateSimple(option.pricing_date)}`
                }
                onChange={(_, value) => {
                  setSelected(value);
                  setError(null);
                }}
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
                          {loading && <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <Button
                variant="contained"
                onClick={handleSearch}
                sx={{ minWidth: 120, textTransform: "none" }}
                disabled={loading}
              >
                Search
              </Button>
            </Stack>

            {error && (
              <Alert severity="warning" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {selected && (
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
                    Deal Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Stack spacing={1}>
                    <Typography variant="body2">
                      <strong>Ticker:</strong> {selected.ticker || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Pricing Date:</strong> {formatDateSimple(selected.pricing_date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Deal Type:</strong> {selected.deal_type || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Deal ID:</strong> {selected.deal_id || "-"}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Flag for Writeup:</strong> {selected.flag_for_writeup ?? "-"}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Box>

  );
};

export default FinancialforecastUpload;

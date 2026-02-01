import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CircularProgress,
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

const RedFlagAnalysisUpload: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [options, setOptions] = useState<TickerItem[]>([]);
  const [selected, setSelected] = useState<TickerItem | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [runMessage, setRunMessage] = useState<string | null>(null);

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
        const items = Array.isArray(data?.tickers)
          ? (data.tickers as TickerItem[])
          : [];
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
    const exactMatch = options.find(
      (o) => (o.ticker || "").toLowerCase() === q
    );
    const fallbackMatch = options.find((o) =>
      (o.ticker || "").toLowerCase().includes(q)
    );
    const match = exactMatch || fallbackMatch || null;
    setSelected(match);
    if (!match) {
      setError("No matching ticker found.");
    } else {
      setError(null);
    }
  };

  const handleRun = async () => {
    setRunError(null);
    setRunMessage(null);

    if (!apiUrl) {
      setRunError("REACT_APP_API_URL is not set.");
      return;
    }

    const tickerValue = selected?.ticker ?? inputValue.trim();
    if (!tickerValue) {
      setRunError("Please search and select a ticker.");
      return;
    }

    setRunning(true);
    try {
      const res = await fetch(`${apiUrl}/api/s1_redflags/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticker: tickerValue }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Request failed.");
      }

      setRunMessage("Red flag analysis started.");
    } catch (err: any) {
      setRunError(err?.message || "Request failed. Please retry.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Box sx={{ maxWidth: 620, mx: "auto", mt: 3 }}>
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            background:
              "linear-gradient(to bottom, rgb(243, 235, 191), rgb(240, 169, 230))",
          }}
        >
          <Typography
            variant="h6"
            gutterBottom
            color="primary"
            align="center"
            sx={{ fontWeight: 600 }}
          >
            Upload Data
          </Typography>

          <Stack spacing={2.5} sx={{ mt: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems="center"
            >
              <Autocomplete
                sx={{
                  flex: 1,
                  minWidth: 240,
                  backgroundColor: "#fff",
                  borderRadius: 1,
                }}
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
                renderOption={(props, option) => (
                  <li
                    {...props}
                    key={`${option.ticker}-${option.pricing_date}`}
                  >
                    <span
                      style={{
                        fontWeight: 700,
                        color: "#002060",
                        marginRight: 6,
                      }}
                    >
                      {option.ticker}
                    </span>
                    <span
                      style={{
                        color: "#1e5700ff",
                        fontWeight: 500,
                      }}
                    >
                      ({formatDateSimple(option.pricing_date)})
                    </span>
                  </li>
                )}
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
                          {loading && (
                            <CircularProgress
                              color="inherit"
                              size={18}
                              sx={{ mr: 1 }}
                            />
                          )}
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
            {runError && (
              <Alert severity="error" onClose={() => setRunError(null)}>
                {runError}
              </Alert>
            )}
            {runMessage && (
              <Alert severity="success" onClose={() => setRunMessage(null)}>
                {runMessage}
              </Alert>
            )}

            <Button
              onClick={handleRun}
              fullWidth
              variant="contained"
              color="success"
              disabled={running}
              sx={{ textTransform: "none" }}
            >
              {running ? "Running..." : "Run Red Flag Analysis"}
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default RedFlagAnalysisUpload;

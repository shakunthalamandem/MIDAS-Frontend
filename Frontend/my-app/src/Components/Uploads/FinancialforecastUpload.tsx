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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

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
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
    setUploadError(null);
    setUploadMessage(null);
  };

  const handleUpload = async () => {
    setUploadError(null);
    setUploadMessage(null);

    if (!apiUrl) {
      setUploadError("REACT_APP_API_URL is not set.");
      return;
    }
    if (!file) {
      setUploadError("Please choose a file before submitting.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("ticker", selected?.ticker ?? "");
    formData.append("deal_id", selected?.deal_id ?? "");
    formData.append("deal_type", selected?.deal_type ?? "");
    formData.append("pricing_date", selected?.pricing_date ?? "");
    formData.append(
      "flag_for_writeup",
      selected?.flag_for_writeup === null ||
        selected?.flag_for_writeup === undefined
        ? ""
        : String(selected.flag_for_writeup)
    );

    setUploading(true);
    try {
      const res = await fetch(`${apiUrl}/api/financial_forecast_insert/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Upload failed.");
      }

      setUploadMessage("File uploaded successfully.");
      setFile(null);
    } catch (err: any) {
      setUploadError(err?.message || "Upload failed. Please retry.");
    } finally {
      setUploading(false);
    }
  };

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

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              gap={2}
              sx={{
                border: "1px solid",
                borderRadius: 2,
                p: 3,
                background:
                  "linear-gradient(to bottom, rgba(243, 235, 191, 0.85), rgba(240, 169, 230, 0.85))",
              }}
            >
              <CloudUploadIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              <input
                accept=".xlsx,.xls"
                style={{ display: "none" }}
                id="forecast-file-upload"
                type="file"
                onChange={handleFileChange}
              />
              <label htmlFor="forecast-file-upload">
                <Button variant="contained" component="span">
                  Choose File
                </Button>
              </label>
              {file && (
                <Typography sx={{ mt: 1 }} color="#000000">
                  <strong>Selected:</strong> {file.name}
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="warning" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}
            {uploadError && (
              <Alert severity="error" onClose={() => setUploadError(null)}>
                {uploadError}
              </Alert>
            )}
            {uploadMessage && (
              <Alert severity="success" onClose={() => setUploadMessage(null)}>
                {uploadMessage}
              </Alert>
            )}

            <Button
              onClick={handleUpload}
              fullWidth
              variant="contained"
              color="success"
              disabled={uploading}
              sx={{ textTransform: "none" }}
            >
              {uploading ? "Uploading..." : "Submit"}
            </Button>
          </Stack>
        </Card>
      </Box>
    </Box>
  );
};

export default FinancialforecastUpload;

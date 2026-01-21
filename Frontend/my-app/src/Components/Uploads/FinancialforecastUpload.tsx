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
    formData.append(
      "data",
      JSON.stringify({
        ticker: selected?.ticker ?? "",
        deal_id: selected?.deal_id ?? "",
        deal_type: selected?.deal_type ?? "",
        pricing_date: selected?.pricing_date ?? "",
        flag_for_writeup: selected?.flag_for_writeup ?? null,
      })
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
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 6, px: { xs: 2, md: 4 } }}>
      <Box sx={{ maxWidth: 980, mx: "auto" }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b3d91", mb: 1 }}>
          Financial Forecast Upload
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
          Search a ticker and upload the corresponding financial forecast file.
        </Typography>

        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            p: { xs: 2, md: 3 },
            background: "linear-gradient(to right, #c2e9fb, #a1c4fd)",
          }}
        >
          <Typography variant="h6" align="center" color="success.main" sx={{ fontWeight: 600, mb: 2 }}>
            Upload Financial Forecasts
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Box sx={{ maxWidth: 620, mx: "auto", mt: 3 }}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                p: { xs: 2, md: 3 },
                background: "linear-gradient(to bottom, rgb(243, 235, 191), rgb(240, 169, 230))",
              }}
            >
              <Typography variant="h6" gutterBottom color="primary" align="center" sx={{ fontWeight: 600 }}>
                Upload Data
              </Typography>

              <Stack spacing={2.5} sx={{ mt: 2 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems="center">
                  <Autocomplete
                    sx={{ flex: 1, minWidth: 240, backgroundColor: "#fff", borderRadius: 1 }}
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
                              {loading && (
                                <CircularProgress color="inherit" size={18} sx={{ mr: 1 }} />
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
                    <Typography sx={{ mt: 1 }} color="text.secondary">
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
        </Card>

        {/* {selected && (
          <Card variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
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
        )} */}
      </Box>
    </Box>

  );
};

export default FinancialforecastUpload;

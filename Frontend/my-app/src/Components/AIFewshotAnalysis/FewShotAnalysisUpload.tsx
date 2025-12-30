import React, { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Alert,
  Snackbar,
  CircularProgress,
  IconButton,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DescriptionIcon from "@mui/icons-material/Description";
import RefreshIcon from "@mui/icons-material/Refresh";

type ApiState = "idle" | "loading" | "success" | "error";

type TickerItem = {
  ticker: string;
  pricing_date?: string | null;
  deal_colour_present?: string;
  deal_captain?: string;
  deal_type?: string;
  allocation_as_percentage_of_deal_size?: number;
};

const formatFileSize = (bytes: number) => {
  if (!bytes) return "0 KB";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
};

const formatPricingDate = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  return dateStr; // API gives YYYY-MM-DD
};

/**
 * Customize this to your auth approach:
 * - If you store token in localStorage: localStorage.getItem("token")
 * - If you store JWT elsewhere: adapt accordingly
 */
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token"); // change key if needed
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const FewShotAnalysisUpload: React.FC = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [tickersState, setTickersState] = useState<ApiState>("idle");

  // Autocomplete selected option (search inside dropdown)
  const [selectedTicker, setSelectedTicker] = useState<TickerItem | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [submitState, setSubmitState] = useState<ApiState>("idle");
  const [responseSummary, setResponseSummary] = useState<string | null>(null);

  // Snackbar (toast)
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState<"success" | "error" | "info" | "warning">("info");

  const showToast = (message: string, severity: typeof snackSeverity = "info") => {
    setSnackMessage(message);
    setSnackSeverity(severity);
    setSnackOpen(true);
  };

  const loadTickers = async () => {
    setTickersState("loading");
    try {
      if (!API_URL) throw new Error("REACT_APP_API_URL is not set.");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_URL}/api/unified_new_deal_data/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "ticker_list" }),
      });

      // safer parse
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) throw new Error(data?.error || data?.detail || "Failed to load tickers");

      const items = Array.isArray(data?.tickers) ? (data.tickers as TickerItem[]) : [];
      setTickers(items);
      setTickersState("success");

      // If currently selected ticker no longer exists, clear it
      setSelectedTicker((prev) => {
        if (!prev) return prev;
        const stillExists = items.some(
          (t) => t.ticker === prev.ticker && (t.pricing_date ?? "") === (prev.pricing_date ?? "")
        );
        return stillExists ? prev : null;
      });
    } catch (err: any) {
      console.error("Error fetching tickers:", err);
      setTickersState("error");
      showToast(err?.message || "Could not load tickers. Please retry.", "error");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      showToast("REACT_APP_API_URL is not set.", "error");
      return;
    }
    loadTickers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    const isTxt = nextFile.type === "text/plain" || nextFile.name.toLowerCase().endsWith(".txt");
    if (!isTxt) {
      showToast("TXT files only. Please upload a .txt pre-listing document.", "error");
      event.target.value = "";
      return;
    }

    setFile(nextFile);
    setResponseSummary(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedTicker?.ticker) {
      showToast("Pick a ticker before uploading.", "warning");
      return;
    }
    if (!file) {
      showToast("Upload the pre-listing TXT file to continue.", "warning");
      return;
    }

    const formData = new FormData();
    formData.append("ticker", selectedTicker.ticker);
    formData.append("pricing_date", selectedTicker.pricing_date ?? "");
    formData.append("pre_listing_file", file);

    setSubmitState("loading");
    setResponseSummary(null);

    try {
      if (!API_URL) throw new Error("REACT_APP_API_URL is not set.");

      const headers: Record<string, string> = {
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_URL}/api/few_shot_ai_analysis/`, {
        method: "POST",
        headers,
        body: formData,
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!res.ok) throw new Error(data?.error || data?.detail || "Upload failed");

      setSubmitState("success");
      setResponseSummary(typeof data === "string" ? data : data?.message || "Analysis triggered successfully.");
      showToast("Analysis requested. Your file was sent for few-shot AI analysis.", "success");
    } catch (err: any) {
      console.error(err);
      setSubmitState("error");
      setResponseSummary(err?.message || "Could not process the request.");
      showToast(err?.message || "Request failed. Please try again.", "error");
    }
  };

  const fileLabel = useMemo(() => {
    if (!file) return "No file selected";
    return `${file.name} • ${formatFileSize(file.size)}`;
  }, [file]);

  const isSubmitting = submitState === "loading";
  const isTickersLoading = tickersState === "loading";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        mt: 5,
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1000, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              height: 44,
              width: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              opacity: 0.9,
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 600, letterSpacing: 1 }}>
              Few-shot AI Analysis
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.1 }}>
              Upload pre-listing notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a ticker and upload a .txt file to trigger the analysis workflow.
            </Typography>
          </Box>
        </Box>

        <Card elevation={6} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                <UploadFileIcon color="primary" fontSize="small" />
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Upload and run
                </Typography>
              </Box>
            }
            sx={{ textAlign: "center", pb: 1 }}
          />

          <CardContent>
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ maxWidth: 640, mx: "auto", display: "flex", flexDirection: "column", gap: 4 }}
            >
              {/* Ticker dropdown with search inside + refresh */}
              <Box sx={{ textAlign: "center" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5 }}>
                  <Autocomplete
                    options={tickers}
                    loading={isTickersLoading}
                    value={selectedTicker}
                    onChange={(_, value) => setSelectedTicker(value)}
                    filterOptions={(options, state) => {
                      const q = state.inputValue.trim().toLowerCase();
                      if (!q) return options;
                      return options.filter((o) => {
                        const t = (o.ticker || "").toLowerCase();
                        const d = (o.pricing_date || "").toLowerCase();
                        return t.includes(q) || d.includes(q);
                      });
                    }}
                    getOptionLabel={(option) => `${option.ticker} • ${formatPricingDate(option.pricing_date)}`}
                    isOptionEqualToValue={(opt, val) =>
                      opt.ticker === val.ticker && (opt.pricing_date ?? "") === (val.pricing_date ?? "")
                    }
                    renderOption={(props, option) => (
                      <li {...props} key={`${option.ticker}-${option.pricing_date ?? ""}`}>
                        <Box sx={{ display: "flex", width: "100%", justifyContent: "space-between", gap: 2 }}>
                          <Typography sx={{ fontWeight: 700 }}>{option.ticker}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatPricingDate(option.pricing_date)}
                          </Typography>
                        </Box>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ticker"
                        placeholder={isTickersLoading ? "Loading..." : "Search ticker or date..."}
                        fullWidth
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {isTickersLoading ? <CircularProgress color="inherit" size={18} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    sx={{ minWidth: 260, width: "100%" }}
                    disabled={isTickersLoading}
                  />

                  <IconButton
                    aria-label="Refresh ticker list"
                    onClick={loadTickers}
                    disabled={isTickersLoading}
                    sx={{ flexShrink: 0 }}
                  >
                    {isTickersLoading ? <CircularProgress size={20} /> : <RefreshIcon />}
                  </IconButton>
                </Box>
              </Box>

              {/* File picker */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Pre-listing TXT file
                </Typography>

                <Box
                  component="label"
                  htmlFor="prelisting-file"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    minHeight: 160,
                    maxWidth: 640,
                    borderRadius: 3,
                    border: "2px dashed",
                    borderColor: "rgba(100,116,139,0.35)",
                    bgcolor: "rgba(148,163,184,0.12)",
                    px: 2,
                    py: 3,
                    cursor: "pointer",
                    transition: "all 150ms ease",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "rgba(25,118,210,0.06)",
                    },
                  }}
                >
                  <input id="prelisting-file" type="file" accept=".txt,text/plain" hidden onChange={handleFileChange} />

                  <Box
                    sx={{
                      height: 48,
                      width: 48,
                      borderRadius: "999px",
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      display: "grid",
                      placeItems: "center",
                      boxShadow: 1,
                    }}
                  >
                    <DescriptionIcon color="primary" />
                  </Box>

                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Drag & drop or click to upload
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Only .txt files are accepted
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mt: 0.5, fontWeight: 700, color: "text.primary" }}
                    >
                      {fileLabel}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Submit */}
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, textAlign: "center" }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                  startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeIcon />}
                  sx={{ borderRadius: 999, px: 3, py: 1.2, fontWeight: 800 }}
                >
                  Send to analysis
                </Button>
              </Box>

              {/* Response */}
              {responseSummary && (
                <Alert severity={submitState === "error" ? "error" : "success"} sx={{ whiteSpace: "pre-wrap" }}>
                  {responseSummary}
                </Alert>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={snackOpen}
        autoHideDuration={4000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity} variant="filled" sx={{ width: "100%" }}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FewShotAnalysisUpload;

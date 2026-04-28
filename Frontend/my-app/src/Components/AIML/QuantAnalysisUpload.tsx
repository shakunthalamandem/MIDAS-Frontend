import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Autocomplete,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

interface PortfolioTicker {
  ticker: string;
  pricing_date: string | null;
  region: string;
  deal_type: string;
  unique_deal_id: string;
  issuer_name: string;
  sector: string;
}

interface FormData {
  ticker: string;
  deal_type: string;
  region: string;
  sector: string;
  pricing_date: string;
  unique_deal_id: string;
  issuer_name: string;
  quant_analysis: string;
}

interface TickerOption {
  label: string;
  data: PortfolioTicker;
}

const QuantAnalysisUpload: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
  const [portfolioTickers, setPortfolioTickers] = useState<TickerOption[]>([]);
  const [loadingPortfolio, setLoadingPortfolio] = useState(false);
  const [selectedTicker, setSelectedTicker] = useState<TickerOption | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ticker: "",
    deal_type: "",
    region: "",
    sector: "",
    pricing_date: "",
    unique_deal_id: "",
    issuer_name: "",
    quant_analysis: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolioTickers();
  }, []);

  const fetchPortfolioTickers = async () => {
    if (!apiUrl) {
      setError("API URL is not configured.");
      return;
    }

    setLoadingPortfolio(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${apiUrl}/api/quant_agent/current_portfolio/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || "Failed to fetch portfolio");
      }

      const allTickers = [
        ...(data.current_portfolio?.data || []),
        ...(data.recently_traded?.data || []),
        ...(data.upcoming?.data || []),
      ];

      const options: TickerOption[] = allTickers.map((ticker) => ({
        label: `${ticker.ticker} (${ticker.deal_type}) - ${ticker.unique_deal_id}`,
        data: ticker,
      }));

      setPortfolioTickers(options);
      console.log("Fetched portfolio tickers:", options);
    } catch (err: any) {
      const msg = err?.message || "Failed to load portfolio tickers.";
      console.error("Portfolio fetch error:", err);
      setError(msg);
    } finally {
      setLoadingPortfolio(false);
    }
  };

  const handleTickerSelect = (option: TickerOption | null) => {
    setSelectedTicker(option);

    if (option) {
      const tickerData = option.data;
      setFormData({
        ticker: tickerData.ticker,
        deal_type: tickerData.deal_type,
        region: tickerData.region,
        sector: tickerData.sector,
        pricing_date: tickerData.pricing_date || "",
        unique_deal_id: tickerData.unique_deal_id,
        issuer_name: tickerData.issuer_name,
        quant_analysis: "",
      });
      setError(null);
    } else {
      setFormData({
        ticker: "",
        deal_type: "",
        region: "",
        sector: "",
        pricing_date: "",
        unique_deal_id: "",
        issuer_name: "",
        quant_analysis: "",
      });
    }
  };

  const handleAnalysisChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      quant_analysis: e.target.value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.ticker.trim()) {
      setError("Please select a ticker.");
      return false;
    }
    if (!formData.quant_analysis.trim()) {
      setError("Quant analysis is required.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    if (!apiUrl) {
      setError("API URL is not configured.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        ticker: formData.ticker.trim(),
        deal_type: formData.deal_type.trim(),
        region: formData.region.trim(),
        sector: formData.sector.trim(),
        pricing_date: formData.pricing_date.trim(),
        unique_deal_id: formData.unique_deal_id.trim(),
        issuer_name: formData.issuer_name.trim(),
        quant_analysis: formData.quant_analysis.trim(),
      };

      console.log("Uploading payload:", payload);

      const response = await fetch(`${apiUrl}/api/quant_agent/upload/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || data?.detail || `Upload failed with status ${response.status}`);
      }

      console.log("Upload successful:", data);
      setSuccess(true);
      setSelectedTicker(null);
      setFormData({
        ticker: "",
        deal_type: "",
        region: "",
        sector: "",
        pricing_date: "",
        unique_deal_id: "",
        issuer_name: "",
        quant_analysis: "",
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      const msg = err?.message || "Failed to upload quant analysis.";
      console.error("Upload error:", err);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: "auto",
        px: { xs: 2, sm: 3, md: 4 },
        py: { xs: 3, md: 4 },
      }}
    >
      {/* Title */}
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#1e293b",
          mb: 1,
          fontSize: { xs: "1.5rem", md: "2rem" },
        }}
      >
        Upload Quant Analysis
      </Typography>
      <Typography
        sx={{
          fontSize: "0.95rem",
          color: "#64748b",
          mb: 3,
        }}
      >
        Select a ticker and paste the quant analysis outputs
      </Typography>

      {/* Success Alert */}
      {success && (
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          sx={{
            mb: 3,
            borderRadius: 1.5,
            border: "1px solid #86efac",
            fontSize: "0.9rem",
          }}
          onClose={() => setSuccess(false)}
        >
          Quant analysis uploaded successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: 1.5,
            border: "1px solid #fecaca",
            fontSize: "0.9rem",
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* Ticker Selection with Search */}
        <Autocomplete
          options={portfolioTickers}
          value={selectedTicker}
          onChange={(event, newValue) => handleTickerSelect(newValue)}
          loading={loadingPortfolio}
          disabled={loadingPortfolio || loading}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select ticker"
              placeholder="Search ticker"
              variant="outlined"
              size="medium"
              InputProps={{
                ...params.InputProps,
                endAdornment: (
                  <>
                    {loadingPortfolio && <CircularProgress color="inherit" size={20} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  fontSize: "0.95rem",
                  "&:hover fieldset": {
                    borderColor: "#0ea5e9",
                  },
                },
              }}
            />
          )}
          sx={{
            "& .MuiAutocomplete-listbox": {
              fontSize: "0.9rem",
            },
          }}
        />

        {/* Auto-filled Fields (Read-only) */}
        {selectedTicker && (
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField
              label="Deal Type"
              value={formData.deal_type}
              variant="outlined"
              size="small"
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#f8fafc",
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              label="Region"
              value={formData.region}
              variant="outlined"
              size="small"
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#f8fafc",
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              label="Sector"
              value={formData.sector}
              variant="outlined"
              size="small"
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#f8fafc",
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              label="Pricing Date"
              value={formData.pricing_date}
              variant="outlined"
              size="small"
              disabled
              sx={{
                "& .MuiOutlinedInput-root": {
                  background: "#f8fafc",
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              fullWidth
              label="Unique Deal ID"
              value={formData.unique_deal_id}
              variant="outlined"
              size="small"
              disabled
              sx={{
                gridColumn: { xs: "1", sm: "1 / -1" },
                "& .MuiOutlinedInput-root": {
                  background: "#f8fafc",
                  borderRadius: 1,
                },
              }}
            />

            <TextField
              fullWidth
              label="Issuer Name"
              value={formData.issuer_name}
              variant="outlined"
              size="small"
              disabled
              sx={{
                gridColumn: "1 / -1",
                "& .MuiOutlinedInput-root": {
                  background: "#f8fafc",
                  borderRadius: 1,
                },
              }}
            />
          </Box>
        )}

        {/* Quant Analysis - Only Editable Field */}
        {selectedTicker && (
          <>
            <TextField
              fullWidth
              label="Quant Analysis (JSON)"
              value={formData.quant_analysis}
              onChange={handleAnalysisChange}
              placeholder='[{"row": 1, "type": "text", "column": 1, "content": "..."}]'
              variant="outlined"
              multiline
              minRows={12}
              maxRows={18}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1,
                  "&:hover fieldset": { borderColor: "#0ea5e9" },
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                },
              }}
            />

            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: -1 }}>
              Enter valid JSON array of blocks
            </Typography>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: "#0ea5e9",
                color: "#fff",
                py: 1.3,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: 1,
                textTransform: "none",
                mt: 1,
                "&:hover": {
                  background: "#0284c7",
                },
                "&:disabled": {
                  background: "#cbd5e1",
                  color: "#94a3b8",
                },
              }}
            >
              {loading ? "Uploading..." : "Upload Analysis"}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
};

export default QuantAnalysisUpload;

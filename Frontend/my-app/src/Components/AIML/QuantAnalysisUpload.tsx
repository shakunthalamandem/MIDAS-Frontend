import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const DEAL_TYPES = ["IPO", "FO"];

const SECTORS = [
  "Health Care",
  "Financials",
  "Information Technology",
  "Real Estate",
  "Consumer Staples",
  "Industrials",
  "Energy",
  "Materials",
  "Utilities",
  "Consumer Discretionary",
  "Communication Services",
];

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

const QuantAnalysisUpload: React.FC = () => {
  const apiUrl = process.env.REACT_APP_API_URL;
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    const requiredFields = Object.keys(formData) as (keyof FormData)[];
    for (const field of requiredFields) {
      if (!formData[field]?.trim()) {
        setError(`${field.replace(/_/g, " ")} is required.`);
        return false;
      }
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
        maxWidth: 1000,
        mx: "auto",
        px: { xs: 1, sm: 2, md: 3 },
        py: 3,
      }}
    >
      {/* Header */}
      <Card
        sx={{
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          color: "#fff",
          mb: 3,
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <CloudUploadIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Upload Quant Analysis
              </Typography>
              <Typography sx={{ fontSize: "0.9rem", opacity: 0.9 }}>
                Add new ticker analysis to the system
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Success Alert */}
      {success && (
        <Alert
          icon={<CheckCircleIcon fontSize="inherit" />}
          severity="success"
          sx={{ mb: 2.5, borderRadius: 2, border: "1px solid #86efac" }}
          onClose={() => setSuccess(false)}
        >
          Quant analysis uploaded successfully!
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2.5, borderRadius: 2, border: "1px solid #fecaca" }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 2.5,
          border: "1px solid #e2e8f0",
          background: "#ffffff",
        }}
      >
        <Grid container spacing={2.5}>
          {/* Ticker */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Ticker Symbol"
              name="ticker"
              value={formData.ticker}
              onChange={handleInputChange}
              placeholder="e.g., NKTR"
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#4f46e5" },
                },
              }}
            />
          </Grid>

          {/* Deal Type */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel>Deal Type</InputLabel>
              <Select
                name="deal_type"
                value={formData.deal_type}
                onChange={(e) => setFormData(prev => ({ ...prev, deal_type: e.target.value }))}
                label="Deal Type"
                sx={{
                  borderRadius: 1.5,
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4f46e5" },
                }}
              >
                {DEAL_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Region */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Region"
              name="region"
              value={formData.region}
              onChange={handleInputChange}
              placeholder="e.g., North America"
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#4f46e5" },
                },
              }}
            />
          </Grid>

          {/* Sector */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={loading}>
              <InputLabel>Sector</InputLabel>
              <Select
                name="sector"
                value={formData.sector}
                onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                label="Sector"
                sx={{
                  borderRadius: 1.5,
                  "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#4f46e5" },
                }}
              >
                {SECTORS.map((sector) => (
                  <MenuItem key={sector} value={sector}>
                    {sector}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Pricing Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pricing Date"
              name="pricing_date"
              type="date"
              value={formData.pricing_date}
              onChange={handleInputChange}
              variant="outlined"
              size="small"
              disabled={loading}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#4f46e5" },
                },
              }}
            />
          </Grid>

          {/* Unique Deal ID */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Unique Deal ID"
              name="unique_deal_id"
              value={formData.unique_deal_id}
              onChange={handleInputChange}
              placeholder="e.g., NKTR-UPSIZED-325M-2026"
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#4f46e5" },
                },
              }}
            />
          </Grid>

          {/* Issuer Name */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Issuer Name"
              name="issuer_name"
              value={formData.issuer_name}
              onChange={handleInputChange}
              placeholder="e.g., Nektar Therapeutics Inc."
              variant="outlined"
              size="small"
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#4f46e5" },
                },
              }}
            />
          </Grid>

          {/* Quant Analysis JSON */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Quant Analysis (JSON)"
              name="quant_analysis"
              value={formData.quant_analysis}
              onChange={handleInputChange}
              placeholder='[{"row": 1, "type": "text", "column": 1, "content": "..."}]'
              variant="outlined"
              multiline
              minRows={8}
              maxRows={15}
              disabled={loading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&:hover fieldset": { borderColor: "#4f46e5" },
                },
                "& .MuiOutlinedInput-input": {
                  fontFamily: "monospace",
                  fontSize: "0.85rem",
                },
              }}
            />
            <Typography sx={{ fontSize: "0.75rem", color: "#94a3b8", mt: 0.75 }}>
              Enter valid JSON array of blocks (text, card, chart, table, etc.)
            </Typography>
          </Grid>

          {/* Submit Button */}
          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                color: "#fff",
                py: 1.2,
                fontWeight: 600,
                fontSize: "0.95rem",
                borderRadius: 1.5,
                textTransform: "none",
                "&:hover": {
                  background: "linear-gradient(135deg, #4338ca 0%, #6d28d9 100%)",
                },
                "&:disabled": {
                  background: "#cbd5e1",
                  color: "#64748b",
                },
              }}
              startIcon={loading ? <CircularProgress size={20} /> : <CloudUploadIcon />}
            >
              {loading ? "Uploading..." : "Upload Analysis"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Info Box */}
      <Box
        sx={{
          mt: 3,
          p: 2.5,
          background: "#f0f4ff",
          border: "1px solid #c7d2fe",
          borderRadius: 2,
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", color: "#4338ca", fontWeight: 600, mb: 1 }}>
          💡 Quant Analysis JSON Format
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#4f46e5", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
          {`[
  {
    "row": 1,
    "column": 1,
    "type": "text",
    "content": "Your analysis text here",
    "total_columns": 1
  },
  {
    "row": 2,
    "column": 1,
    "type": "card",
    "title": "Card Title",
    "subtitle": "Subtitle",
    "description": "Description",
    "total_columns": 1
  }
]`}
        </Typography>
      </Box>
    </Box>
  );
};

export default QuantAnalysisUpload;

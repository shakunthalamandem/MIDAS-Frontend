import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const FOFinancialForecastUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [ticker, setTicker] = useState("");
  const [pricingDate, setPricingDate] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (!selectedFile) return;

    const lowerName = selectedFile.name.toLowerCase();
    const isExcel = lowerName.endsWith(".xls") || lowerName.endsWith(".xlsx");
    if (!isExcel) {
      setMessage("Please upload an Excel file (.xls or .xlsx)." );
      setSeverity("error");
      setSnackbarOpen(true);
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!apiUrl) {
      setMessage("API URL is not configured.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!ticker.trim()) {
      setMessage("Please enter a ticker.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!pricingDate) {
      setMessage("Please select a pricing date.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!file) {
      setMessage("Please select an Excel file.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    formData.append("ticker", ticker.trim());
    formData.append("pricing_date", pricingDate);
    formData.append("file", file);

    setLoading(true);
    setSnackbarOpen(false);

    try {
      const response = await fetch(`${apiUrl}/api/fo_financial_forecasts_upload/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Upload failed");
      }

      setMessage("FO financial forecasts uploaded successfully.");
      setSeverity("success");
      setFile(null);
      setTicker("");
      setPricingDate("");
    } catch (error) {
      console.error(error);
      setMessage("Upload failed. Please try again.");
      setSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 520, mx: "auto", mt: 4 }}>
      <Card elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            Upload FO Financial Forecasts
          </Typography>

          <TextField
            label="Ticker"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Pricing Date"
            type="date"
            value={pricingDate}
            onChange={(e) => setPricingDate(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <Box display="flex" justifyContent="center" mb={2}>
            <Button variant="outlined" component="label" startIcon={<CloudUploadIcon />}>
              Select Excel File
              <input
                type="file"
                hidden
                accept=".xls,.xlsx"
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {file && (
            <Typography variant="body2" sx={{ mb: 2, textAlign: "center" }}>
              Selected: {file.name}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || !file || !ticker.trim() || !pricingDate}
              fullWidth
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={7000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FOFinancialForecastUpload;

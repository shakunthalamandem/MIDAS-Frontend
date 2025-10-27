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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { SelectChangeEvent } from "@mui/material";

const IPOS1FileUpload: React.FC = () => {
  const [uploadType, setUploadType] = useState<"s1" | "report">("s1");
  const [files, setFiles] = useState<File[]>([]); // ✅ multiple files
  const [market, setMarket] = useState<string>("");
  const [ticker, setTicker] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [severity, setSeverity] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleUploadTypeChange = (e: SelectChangeEvent) => {
    const value = e.target.value as "s1" | "report";
    setUploadType(value);
    setFiles([]);
    setMarket("");
    setTicker("");
    setMessage("");
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const invalidFile = selectedFiles.find((f) => f.type !== "application/pdf");

    if (invalidFile) {
      setMessage("Only PDF files are allowed.");
      setSeverity("error");
      setSnackbarOpen(true);
      setFiles([]);
      return;
    }

    setFiles(selectedFiles); // ✅ store multiple files
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (files.length === 0) {
      setMessage("Please select at least one PDF file.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (!market.trim()) {
      setMessage("Please enter a market (e.g., US or HK).");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    if (uploadType === "report" && !ticker.trim()) {
      setMessage("Please enter a ticker.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f)); // ✅ append all files
    formData.append("market", market.trim());
    formData.append("ticker", ticker.trim());

    const endpoint =
      uploadType === "s1"
        ? `${apiUrl}/api/update_ipo_s1_ai/`
        : `${apiUrl}/api/upload_ipo_s1_categories/`;

    setLoading(true);
    setSnackbarOpen(false);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Files uploaded successfully.");
        setSeverity("success");
      } else {
        setMessage(data.error || "Upload failed.");
        setSeverity("error");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong during upload.");
      setSeverity("error");
    } finally {
      setLoading(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box sx={{ width: "100%", maxWidth: 500, mx: "auto", mt: 4 }}>
      <Card elevation={3} sx={{ p: 3, backgroundColor: "#f9f9f9" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom align="center" color="primary">
            Upload IPO Documents
          </Typography>

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="upload-type-label">Upload Type</InputLabel>
            <Select
              labelId="upload-type-label"
              value={uploadType}
              label="Upload Type"
              onChange={handleUploadTypeChange}
            >
              <MenuItem value="s1">S1 Upload</MenuItem>
              <MenuItem value="report">Report Card</MenuItem>
            </Select>
          </FormControl>

          <Box display="flex" justifyContent="center" mb={2}>
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
            >
              Select PDF Files
              <input
                type="file"
                hidden
                accept="application/pdf"
                multiple // ✅ allow multiple
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {files.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" align="center">
                Selected Files:
              </Typography>
              {files.map((f, idx) => (
                <Typography key={idx} variant="body2" align="center">
                  {f.name}
                </Typography>
              ))}
            </Box>
          )}

          <TextField
            label="Market (e.g., US or HK)"
            value={market}
            onChange={(e) => setMarket(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Ticker (e.g., AAPL)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            variant="outlined"
            fullWidth
            sx={{ mb: 2 }}
          />

          <Box component="form" onSubmit={handleSubmit}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={
                loading ||
                files.length === 0 ||
                !market.trim() ||
                (uploadType === "report" && !ticker.trim())
              }
              fullWidth
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Upload"
              )}
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

export default IPOS1FileUpload;

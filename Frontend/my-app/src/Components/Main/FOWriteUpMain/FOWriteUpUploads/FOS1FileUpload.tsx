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

const FOS1FileUpload: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [market, setMarket] = useState<string>("");
  const [ticker, setTicker] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [severity, setSeverity] = useState<"success" | "error" | "info">("info");
  const [loading, setLoading] = useState<boolean>(false);
  const [snackbarOpen, setSnackbarOpen] = useState<boolean>(false);

  const apiUrl = process.env.REACT_APP_API_URL;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const invalidFiles = selectedFiles.filter(file => file.type !== "application/pdf");

    if (invalidFiles.length > 0) {
      setMessage("Only PDF files are allowed.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    setFiles(selectedFiles);
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

    if (!ticker.trim()) {
      setMessage("Please enter a ticker.");
      setSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file)); // note: key "files" should be handled by backend
    formData.append("market", market.trim());
    formData.append("ticker", ticker.trim());

    const endpoint = `${apiUrl}/api/upload_s1_data/`;

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
        setFiles([]);
        setMarket("");
        setTicker("");
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
            Upload S1 Documents
          </Typography>

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
                multiple
                onChange={handleFileChange}
              />
            </Button>
          </Box>

          {files.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {files.map((file, index) => (
                <Typography key={index} variant="body2">
                  {file.name}
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
              disabled={loading || files.length === 0 || !market.trim() || !ticker.trim()}
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

export default FOS1FileUpload;

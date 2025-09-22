import React, { useState } from "react";
import { Button, Box, Typography, CircularProgress, Alert } from "@mui/material";

const UploadFactSetTickers: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) {
      setError("API URL is not defined");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      setMessage(null);
      setError(null);

      const response = await fetch(`${apiUrl}/api/upload_factset_tickers/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Upload successful");
      } else {
        setError(data.error || "Upload failed");
      }
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, border: "1px solid #ccc", borderRadius: "12px", maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Upload FactSet Tickers
      </Typography>

      <input type="file" accept=".xlsx, .xls" onChange={handleFileChange} />

      <Box mt={2}>
        <Button
          variant="contained"
          sx={{ backgroundColor: "#002060", color: "white" }}
          disabled={loading}
          onClick={handleUpload}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
        </Button>
      </Box>

      {message && <Alert severity="success" sx={{ mt: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default UploadFactSetTickers;

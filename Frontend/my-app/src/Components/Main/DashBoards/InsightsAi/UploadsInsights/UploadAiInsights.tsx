import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Divider,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const UploadAiInsights: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Please select an Excel file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) {
      setErrorMsg("API URL is not configured.");
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      const response = await fetch(`${apiUrl}/api/upload-ai-insights/`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setSuccessMsg(result.message || "Upload successful.");
      setFile(null); 
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 6,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
          bgcolor: "#fdfdfd",
        }}
      >
        <CloudUploadIcon color="primary" sx={{ fontSize: 56 }} />
        <Typography variant="h5" mt={2}>
          Upload AI Insights
        </Typography>
        <Typography variant="body2" color="#000000" mt={1}>
          Select a valid Excel file (.xls or .xlsx) containing AI insights.
        </Typography>

        <Box
          sx={{
            mt: 4,
            p: 2,
            border: "2px dashed #bbb",
            borderRadius: 2,
            bgcolor: "#f9f9f9",
            position: "relative",
          }}
        >
          <Button component="label" variant="outlined" startIcon={<InsertDriveFileIcon />}>
            {file ? file.name : "Choose Excel File"}
            <input
              type="file"
              hidden
              accept=".xls,.xlsx"
              onChange={handleFileChange}
            />
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={uploading || !file}
          size="large"
          fullWidth
        >
          {uploading ? <CircularProgress size={24} color="inherit" /> : "Upload"}
        </Button>

        {successMsg && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {errorMsg}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default UploadAiInsights;

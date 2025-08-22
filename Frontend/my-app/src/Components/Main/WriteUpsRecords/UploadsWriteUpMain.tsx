import React, { useState, ChangeEvent, FormEvent } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  TextField,
  Typography,
  InputLabel,
  FormControl,
} from "@mui/material";

type UploadType = "report" | "gapanalysis" | "customanalysis";

interface FormDataState {
  ticker: string;
  company_name: string;
  title: string;
  gap_analysis: string;
  custom_analytics: string;
}

const UploadsWriteUpMain: React.FC = () => {
  const [uploadType, setUploadType] = useState<UploadType>("report");
  const [formData, setFormData] = useState<FormDataState>({
    ticker: "",
    company_name: "",
    title: "",
    gap_analysis: "",
    custom_analytics: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const apiUrl = process.env.REACT_APP_API_URL || "";

  const API_ENDPOINTS: Record<UploadType, string> = {
    report: "/api/report-upload/",
    gapanalysis: "/api/gapanalysis-upload/",
    customanalysis: "/api/customanalysis-upload/",
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMessage("Please select a file");
      return;
    }

    const data = new FormData();
    data.append("file", file);

    if (uploadType === "report") {
      data.append("ticker", formData.ticker);
      data.append("company_name", formData.company_name);
    } else if (uploadType === "gapanalysis") {
      data.append("title", formData.title);
      data.append("gap_analysis", formData.gap_analysis);
    } else if (uploadType === "customanalysis") {
      data.append("title", formData.title);
      data.append("custom_analytics", formData.custom_analytics);
    }

    try {
      const token = localStorage.getItem("access_token");

      const response = await fetch(`${apiUrl}${API_ENDPOINTS[uploadType]}`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: data, // FormData handles multipart
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(`✅ ${result.message} | Link: ${result.link}`);
      } else {
        setMessage(`❌ ${result.error || "Upload failed"}`);
      }
    } catch (error: any) {
      setMessage(`❌ ${error.message}`);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 600,
        mx: "auto",
        mt: 4,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#fff",
      }}
    >
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Upload Reports
      </Typography>

      {/* Dropdown */}
      <FormControl fullWidth margin="normal">
        <InputLabel>Upload Type</InputLabel>
        <Select
          value={uploadType}
          onChange={(e) => setUploadType(e.target.value as UploadType)}
        >
          <MenuItem value="report">Report Upload</MenuItem>
          <MenuItem value="gapanalysis">GAP Analysis Upload</MenuItem>
          <MenuItem value="customanalysis">Custom Analysis Upload</MenuItem>
        </Select>
      </FormControl>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        {/* Report Upload */}
        {uploadType === "report" && (
          <>
            <TextField
              fullWidth
              label="Ticker"
              name="ticker"
              value={formData.ticker}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Company Name"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              margin="normal"
              required
            />
          </>
        )}

        {/* GAP Analysis */}
        {uploadType === "gapanalysis" && (
          <>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Gap Analysis"
              name="gap_analysis"
              value={formData.gap_analysis}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
          </>
        )}

        {/* Custom Analysis */}
        {uploadType === "customanalysis" && (
          <>
            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Custom Analytics"
              name="custom_analytics"
              value={formData.custom_analytics}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={3}
              required
            />
          </>
        )}

        {/* File Upload */}
        <Button
          variant="outlined"
          component="label"
          fullWidth
          sx={{ mt: 2 }}
        >
          {file ? file.name : "Choose File"}
          <input type="file" hidden onChange={handleFileChange} required />
        </Button>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Upload
        </Button>
      </Box>

      {/* Message */}
      {message && (
        <Typography
          sx={{ mt: 3 }}
          variant="body2"
          color={message.startsWith("✅") ? "green" : "error"}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default UploadsWriteUpMain;

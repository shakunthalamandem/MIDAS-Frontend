import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  LinearProgress,
  Chip,
  IconButton,
  MenuItem,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const apiUrl = process.env.REACT_APP_API_URL;

const PortfolioDocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [reportDate, setReportDate] = useState<string>("");
  const [reportName, setReportName] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".json")) {
      setAlert({ type: "error", message: "Only JSON files are accepted." });
      return;
    }
    setFile(selectedFile);
    setAlert(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setAlert({ type: "error", message: "Please select a JSON file." });
      return;
    }
    if (!reportDate) {
      setAlert({ type: "error", message: "Please select a report date." });
      return;
    }
    if (!reportName.trim()) {
      setAlert({ type: "error", message: "Please enter a report name." });
      return;
    }
    if (!reportType) {
      setAlert({ type: "error", message: "Please select a report type." });
      return;
    }

    setUploading(true);
    setAlert(null);

    const token = localStorage.getItem("access_token");

    const formData = new FormData();
    formData.append("metadata_file", file);       // ✅ changed
    formData.append("date", reportDate);
    formData.append("report_name", reportName.trim()); // ✅ changed
    formData.append("report_type", reportType);   // ✅ added

    try {
      const res = await fetch(`${apiUrl}/api/ai_output/upload/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setAlert({
          type: "success",
          message: data.message || "Report uploaded successfully!",
        });
        setFile(null);
        setReportDate("");
        setReportName("");
        setReportType("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setAlert({
          type: "error",
          message: data.error || "Upload failed. Please try again.",
        });
      }
    } catch (err: any) {
      setAlert({
        type: "error",
        message: err.message || "Network error. Please try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Card sx={{ maxWidth: 560, width: "100%", borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
            Metadata JSON Upload
          </Typography>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 2 }}>
              {alert.message}
            </Alert>
          )}

          <TextField
            label="Report Name"
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          />

          <TextField
            label="Report Date"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ mb: 2 }}
          />

          {/* ✅ Added Report Type Dropdown */}
          <TextField
            select
            label="Report Type"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            fullWidth
            size="small"
            sx={{ mb: 2 }}
          >
            <MenuItem value="US Portfolio CIO AI Review">US Portfolio CIO AI Review</MenuItem>
            <MenuItem value="Portfolio AI Stock Ranking">Portfolio AI Stock Ranking</MenuItem>
            <MenuItem value="Inidividual Stock CIO AI REview">Inidividual Stock CIO AI REview</MenuItem>
          </TextField>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ marginBottom: 16 }}
          />

          {file && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2">{file.name}</Typography>
              <Chip label={formatFileSize(file.size)} size="small" />
            </Box>
          )}

          {uploading && <LinearProgress sx={{ mb: 2 }} />}

          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            disabled={uploading}
            startIcon={<CloudUploadIcon />}
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default PortfolioDocumentUpload;
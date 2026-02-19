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
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const apiUrl = process.env.REACT_APP_API_URL;

const RiskAIDocumentUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [reportDate, setReportDate] = useState<string>("");
  const [reportTitle, setReportTitle] = useState<string>("");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
    if (!reportTitle.trim()) {
      setAlert({ type: "error", message: "Please enter a report title." });
      return;
    }

    setUploading(true);
    setAlert(null);

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("date", reportDate);
    formData.append("title", reportTitle.trim());

    try {
      const res = await fetch(`${apiUrl}/api/cio_report_upload/`, {
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
        setReportTitle("");
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
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 560,
          width: "100%",
          borderRadius: 3,
          background: "rgba(30, 41, 59, 0.95)",
          border: "1px solid rgba(148, 163, 184, 0.15)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h5"
            sx={{
              color: "#f1f5f9",
              fontWeight: 700,
              mb: 0.5,
              textAlign: "center",
            }}
          >
            CIO Report Upload
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8", mb: 3, textAlign: "center" }}
          >
            Upload the daily capital allocation report (JSON)
          </Typography>

          {alert && (
            <Alert
              severity={alert.type}
              icon={alert.type === "success" ? <CheckCircleIcon /> : undefined}
              onClose={() => setAlert(null)}
              sx={{ mb: 2, borderRadius: 2 }}
            >
              {alert.message}
            </Alert>
          )}

          <TextField
            label="Report Title"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            fullWidth
            size="small"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "#f1f5f9",
                "& fieldset": { borderColor: "rgba(148, 163, 184, 0.3)" },
                "&:hover fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.5)",
                },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
              "& .MuiInputLabel-root": { color: "#94a3b8" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
            }}
          />

          <TextField
            label="Report Date"
            type="date"
            value={reportDate}
            onChange={(e) => setReportDate(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "#f1f5f9",
                "& fieldset": { borderColor: "rgba(148, 163, 184, 0.3)" },
                "&:hover fieldset": {
                  borderColor: "rgba(148, 163, 184, 0.5)",
                },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
              "& .MuiInputLabel-root": { color: "#94a3b8" },
              "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
              "& input::-webkit-calendar-picker-indicator": {
                filter: "invert(0.7)",
              },
            }}
          />

          {/* Drop Zone */}
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            sx={{
              border: `2px dashed ${dragOver ? "#3b82f6" : "rgba(148, 163, 184, 0.3)"}`,
              borderRadius: 2,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              backgroundColor: dragOver
                ? "rgba(59, 130, 246, 0.08)"
                : "rgba(15, 23, 42, 0.4)",
              "&:hover": {
                borderColor: "#3b82f6",
                backgroundColor: "rgba(59, 130, 246, 0.05)",
              },
              mb: 2,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleInputChange}
              style={{ display: "none" }}
            />
            <CloudUploadIcon
              sx={{ fontSize: 40, color: "#64748b", mb: 1 }}
            />
            <Typography variant="body2" sx={{ color: "#94a3b8" }}>
              Drag & drop your JSON file here, or click to browse
            </Typography>
          </Box>

          {/* Selected File Display */}
          {file && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <InsertDriveFileIcon sx={{ color: "#3b82f6" }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#f1f5f9",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {file.name}
                </Typography>
                <Chip
                  label={formatFileSize(file.size)}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: "0.7rem",
                    color: "#94a3b8",
                    backgroundColor: "rgba(148, 163, 184, 0.1)",
                    mt: 0.5,
                  }}
                />
              </Box>
              <IconButton size="small" onClick={handleRemoveFile}>
                <CloseIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
              </IconButton>
            </Box>
          )}

          {uploading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          <Button
            variant="contained"
            fullWidth
            onClick={handleUpload}
            disabled={uploading || !file || !reportDate || !reportTitle.trim()}
            startIcon={<CloudUploadIcon />}
            sx={{
              py: 1.2,
              borderRadius: 2,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #3b82f6, #2563eb)",
              "&:hover": {
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              },
              "&.Mui-disabled": {
                background: "rgba(148, 163, 184, 0.15)",
                color: "rgba(148, 163, 184, 0.4)",
              },
            }}
          >
            {uploading ? "Uploading..." : "Upload Report"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
};

export default RiskAIDocumentUpload;

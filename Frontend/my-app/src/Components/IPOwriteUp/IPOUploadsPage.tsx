import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Divider,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import IPOS1FileUpload from "../IPOwriteUp/IPOS1FileUpload";
import UploadDataCard from "../Uploads/UploadDataCard";

type View = "ipo" | "forecasts";

const IPOUploadsPage: React.FC = () => {
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  // Toggle between IPO and Forecasts section
  const [view, setView] = useState<View>("ipo");

  // Financial Forecast upload states
  const [activeUpload, setActiveUpload] = useState<string>("financialForecasts");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");

  const uploadConfigs = [
    {
      key: "financialForecasts",
      label: "Upload IPO S1 Financial Forecasts",
      apiEndpoint: "financial_forecasts_data_upload",
      buttonColor: "success",
    },
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file || !apiUrl) {
      setError("Please select a file before uploading.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setError("");

      await axios.post(`${apiUrl}/api/financial_forecasts_data_upload/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
        },
        // ✅ Works in all recent Axios versions
        onUploadProgress: (evt: any) => {
          if (evt.total) {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress(pct);
          }
        },
      } as any); // 👈 cast to any to avoid TS error from strict Axios typings

      setFile(null);
      setUploadedFileName("");
      setUploadProgress(0);
      alert("IPO S1 Financial Forecast uploaded successfully!");
    } catch (err) {
      console.error("Upload Error:", err);
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 6 }}>
      <Container>
        {/* 🔙 Navigation & Breadcrumbs */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Tooltip title="Back to Uploads">
            <IconButton onClick={() => navigate("/uploads")} size="small" sx={{ mr: 1 }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate("/uploads")}
              sx={{ cursor: "pointer" }}
            >
              Uploads
            </Link>
            <Typography color="text.primary">IPO Files</Typography>
          </Breadcrumbs>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b3d91", mb: 2 }}>
          IPO Files
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          Choose a section and upload the corresponding IPO documents. Only one section is visible at a time.
        </Typography>

        {/* 🧭 Horizontal Toggle */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={view}
            onChange={(_, val: View | null) => val && setView(val)}
            size="small"
          >
            <ToggleButton value="ipo">IPO Documents</ToggleButton>
            <ToggleButton value="forecasts">Financial Forecasts</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* === IPO Upload Section === */}
        {view === "ipo" && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                p: 3,
                background: "linear-gradient(to right, #ffecd2, #fcb69f)",
              }}
            >
              <Typography variant="h6" align="center" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                Upload IPO Documents
              </Typography>
              <Divider sx={{ my: 2 }} />
              <IPOS1FileUpload />
            </Card>
          </motion.div>
        )}

        {/* === Financial Forecast Upload Section === */}
        {view === "forecasts" && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                p: 3,
                background: "linear-gradient(to right, #c2e9fb, #a1c4fd)",
              }}
            >
              <Typography variant="h6" align="center" color="success.main" sx={{ fontWeight: 600, mb: 2 }}>
                Upload IPO S1 Financial Forecasts
              </Typography>
              <Divider sx={{ my: 2 }} />

              <UploadDataCard
                activeUpload={activeUpload}
                setActiveUpload={setActiveUpload}
                file={file}
                setFile={setFile}
                uploadedFileName={uploadedFileName}
                setUploadedFileName={setUploadedFileName}
                error={error}
                setError={setError}
                uploadConfigs={uploadConfigs}
                handleFileChange={handleFileChange}
                handleUpload={handleUpload}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
            </Card>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default IPOUploadsPage;

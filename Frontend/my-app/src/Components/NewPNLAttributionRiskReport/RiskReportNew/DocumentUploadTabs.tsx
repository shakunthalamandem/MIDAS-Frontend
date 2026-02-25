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
  Tabs,
  Tab,
  Container,
  Paper,
  MenuItem,
  Divider,
  Grid,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import DescriptionIcon from "@mui/icons-material/Description";

const apiUrl = process.env.REACT_APP_API_URL;

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`upload-tabpanel-${index}`}
      aria-labelledby={`upload-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

interface UploadFormProps {
  file: File | null;
  date: string;
  setDate: (date: string) => void;
  name: string;
  setName: (name: string) => void;
  type?: string;
  setType?: (type: string) => void;
  uploading: boolean;
  alert: { type: "success" | "error"; message: string } | null;
  onFileSelect: (file: File) => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isRisk?: boolean;
}

const UploadFormComponent: React.FC<UploadFormProps> = ({
  file,
  date,
  setDate,
  name,
  setName,
  type = "",
  setType = () => {},
  uploading,
  alert,
  onFileSelect,
  onUpload,
  fileInputRef,
  isRisk = false,
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <Box>
      {alert && (
        <Alert
          severity={alert.type}
          sx={{
            mb: 3,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
          icon={alert.type === "success" ? <CheckCircleIcon /> : <ErrorIcon />}
        >
          {alert.message}
        </Alert>
      )}

      {/* Form Fields - First Row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "#475569" }}>
            Report Name *
          </Typography>
          <TextField
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            placeholder="e.g., Q1 2024 Analysis"
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "#475569" }}>
            Report Date *
          </Typography>
          <TextField
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            fullWidth
            size="small"
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </Grid>

        {!isRisk && (
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "#475569" }}>
              Report Type *
            </Typography>
            <TextField
              select
              value={type}
              onChange={(e) => setType(e.target.value)}
              fullWidth
              size="small"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                },
              }}
            >
              <MenuItem value="US  Equity Portfolio AI Review">US  Equity Portfolio AI Review</MenuItem>
              <MenuItem value="Portfolio AI Stock Ranking">Portfolio AI Stock Ranking</MenuItem>
              <MenuItem value="Individual Stock CIO AI Review">Individual Stock CIO AI Review</MenuItem>
            </TextField>
          </Grid>
        )}

        {isRisk && (
          <Grid item xs={12} sm={6} md={4}>
            {/* Empty grid for spacing on risk tab */}
          </Grid>
        )}
      </Grid>

      {/* JSON File Upload - Second Row */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: "#475569" }}>
          JSON File Upload *
        </Typography>
        <Paper
          sx={{
            p: 3,
            textAlign: "center",
            border: "2px dashed #cbd5e1",
            borderRadius: 2,
            cursor: "pointer",
            transition: "all 0.3s ease",
            backgroundColor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 120,
            "&:hover": {
              borderColor: "#3b82f6",
              backgroundColor: "#eff6ff",
            },
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <DescriptionIcon sx={{ fontSize: 40, color: "#94a3b8", mb: 1 }} />
          <Typography variant="body2" sx={{ color: "#64748b", mb: 0.5 }}>
            Click to upload or drag and drop
          </Typography>
          <Typography variant="caption" sx={{ color: "#94a3b8" }}>
            JSON files only
          </Typography>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
            style={{ display: "none" }}
          />
        </Paper>
      </Box>

      {file && (
        <Box
          sx={{
            mb: 3,
            p: 2,
            backgroundColor: "#f0fdf4",
            border: "1px solid #bbf7d0",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <DescriptionIcon sx={{ color: "#16a34a", fontSize: 24 }} />
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#166534" }}>
              {file.name}
            </Typography>
            <Typography variant="caption" sx={{ color: "#65a30d" }}>
              {formatFileSize(file.size)}
            </Typography>
          </Box>
          <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 20 }} />
        </Box>
      )}

      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={50}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                background: "linear-gradient(90deg, #3b82f6, #2563eb)",
              },
            }}
          />
          <Typography variant="caption" sx={{ color: "#64748b", mt: 1, display: "block" }}>
            Uploading...
          </Typography>
        </Box>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={onUpload}
        disabled={uploading}
        startIcon={<CloudUploadIcon />}
        sx={{
          background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          color: "#fff",
          fontWeight: 600,
          py: 1.5,
          borderRadius: 2,
          textTransform: "none",
          fontSize: 16,
          "&:hover": {
            background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
          },
          "&:disabled": {
            background: "#cbd5e1",
            color: "#94a3b8",
          },
        }}
      >
        {uploading ? "Uploading..." : "Upload Report"}
      </Button>
    </Box>
  );
};

const DocumentUploadTabs: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);

  // Portfolio Upload State
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);
  const [portfolioDate, setPortfolioDate] = useState<string>("");
  const [portfolioName, setPortfolioName] = useState<string>("");
  const [portfolioType, setPortfolioType] = useState<string>("US  Equity Portfolio AI Review");
  const [portfolioUploading, setPortfolioUploading] = useState(false);
  const [portfolioAlert, setPortfolioAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Risk Upload State
  const [riskFile, setRiskFile] = useState<File | null>(null);
  const [riskDate, setRiskDate] = useState<string>("");
  const [riskName, setRiskName] = useState<string>("");
  const [riskUploading, setRiskUploading] = useState(false);
  const [riskAlert, setRiskAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const portfolioFileInputRef = useRef<HTMLInputElement>(null);
  const riskFileInputRef = useRef<HTMLInputElement>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Portfolio Upload Handlers
  const handlePortfolioFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".json")) {
      setPortfolioAlert({ type: "error", message: "Only JSON files are accepted." });
      return;
    }
    setPortfolioFile(selectedFile);
    setPortfolioAlert(null);
  };

  const handlePortfolioUpload = async () => {
    if (!portfolioFile) {
      setPortfolioAlert({ type: "error", message: "Please select a JSON file." });
      return;
    }
    if (!portfolioDate) {
      setPortfolioAlert({ type: "error", message: "Please select a report date." });
      return;
    }
    if (!portfolioName.trim()) {
      setPortfolioAlert({ type: "error", message: "Please enter a report name." });
      return;
    }

    setPortfolioUploading(true);
    setPortfolioAlert(null);

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("metadata_file", portfolioFile);
    formData.append("date", portfolioDate);
    formData.append("report_name", portfolioName.trim());
    formData.append("report_type", portfolioType);

    try {
      const res = await fetch(`${apiUrl}/api/ai_agents_data_uploads/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setPortfolioAlert({
          type: "success",
          message: data.message || "Portfolio report uploaded successfully!",
        });
        setPortfolioFile(null);
        setPortfolioDate("");
        setPortfolioName("");
        if (portfolioFileInputRef.current) {
          portfolioFileInputRef.current.value = "";
        }
      } else {
        setPortfolioAlert({
          type: "error",
          message: data.error || "Upload failed. Please try again.",
        });
      }
    } catch (err: any) {
      setPortfolioAlert({
        type: "error",
        message: err.message || "Network error. Please try again.",
      });
    } finally {
      setPortfolioUploading(false);
    }
  };

  // Risk Upload Handlers
  const handleRiskFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".json")) {
      setRiskAlert({ type: "error", message: "Only JSON files are accepted." });
      return;
    }
    setRiskFile(selectedFile);
    setRiskAlert(null);
  };

  const handleRiskUpload = async () => {
    if (!riskFile) {
      setRiskAlert({ type: "error", message: "Please select a JSON file." });
      return;
    }
    if (!riskDate) {
      setRiskAlert({ type: "error", message: "Please select a report date." });
      return;
    }
    if (!riskName.trim()) {
      setRiskAlert({ type: "error", message: "Please enter a report name." });
      return;
    }

    setRiskUploading(true);
    setRiskAlert(null);

    const token = localStorage.getItem("access_token");
    const formData = new FormData();
    formData.append("metadata_file", riskFile);
    formData.append("date", riskDate);
    formData.append("report_name", riskName.trim());
    formData.append("report_type", "Risk Report");

    try {
      const res = await fetch(`${apiUrl}/api/risk_ai_data_uploads/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setRiskAlert({
          type: "success",
          message: data.message || "Risk report uploaded successfully!",
        });
        setRiskFile(null);
        setRiskDate("");
        setRiskName("");
        if (riskFileInputRef.current) {
          riskFileInputRef.current.value = "";
        }
      } else {
        setRiskAlert({
          type: "error",
          message: data.error || "Upload failed. Please try again.",
        });
      }
    } catch (err: any) {
      setRiskAlert({
        type: "error",
        message: err.message || "Network error. Please try again.",
      });
    } finally {
      setRiskUploading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)",
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 1,
              color: "#0f172a",
              textAlign: "center",
            }}
          >
            Document Upload Center
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "#64748b",
              textAlign: "center",
              mb: 3,
            }}
          >
            Upload portfolio and risk analysis reports to analyze investment performance
          </Typography>
        </Box>

        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {/* Tabs Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
              px: 2,
            }}
          >
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="upload types"
              sx={{
                "& .MuiTabs-indicator": {
                  backgroundColor: "#3b82f6",
                  height: 3,
                },
                "& .MuiTab-root": {
                  color: "#94a3b8",
                  fontWeight: 500,
                  textTransform: "none",
                  fontSize: 15,
                  py: 2,
                  "&.Mui-selected": {
                    color: "#fff",
                  },
                },
              }}
            >
              <Tab label="Portfolio Upload" id="upload-tab-0" aria-controls="upload-tabpanel-0" />
              <Tab label="Risk Portfolio AI" id="upload-tab-1" aria-controls="upload-tabpanel-1" />
            </Tabs>
          </Box>

          <Divider sx={{ m: 0 }} />

          {/* Tab Content */}
          <CardContent sx={{ p: 4 }}>
            <TabPanel value={tabValue} index={0}>
              <UploadFormComponent
                file={portfolioFile}
                date={portfolioDate}
                setDate={setPortfolioDate}
                name={portfolioName}
                setName={setPortfolioName}
                type={portfolioType}
                setType={setPortfolioType}
                uploading={portfolioUploading}
                alert={portfolioAlert}
                onFileSelect={handlePortfolioFileSelect}
                onUpload={handlePortfolioUpload}
                fileInputRef={portfolioFileInputRef}
              />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <UploadFormComponent
                file={riskFile}
                date={riskDate}
                setDate={setRiskDate}
                name={riskName}
                setName={setRiskName}
                uploading={riskUploading}
                alert={riskAlert}
                onFileSelect={handleRiskFileSelect}
                onUpload={handleRiskUpload}
                fileInputRef={riskFileInputRef}
                isRisk={true}
              />
            </TabPanel>
          </CardContent>
        </Card>

        {/* Info Box */}
        <Paper
          sx={{
            mt: 4,
            p: 3,
            backgroundColor: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#1e40af", mb: 1 }}>
            📋 Upload Guidelines
          </Typography>
          <Typography variant="body2" sx={{ color: "#1e3a8a", lineHeight: 1.7 }}>
            • Upload JSON files containing your portfolio or risk analysis data<br />
            • Ensure all required fields are filled out before uploading<br />
            • Report dates should be in DD-MM-YYYY format<br />
            • Maximum file size is typically 50MB
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default DocumentUploadTabs;

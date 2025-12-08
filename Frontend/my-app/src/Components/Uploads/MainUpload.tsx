import React, { useState, ChangeEvent } from "react";
import {
  Box,
  Typography,
  Snackbar,
  Alert,
  Container,
  Card,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import NewDealDownloadWithFilter from "./NewDealDownloadWithFilter";
import IpoDashboardCalendar from "../Main/DashBoards/InsightsAi/UploadsInsights/IpoDashboardCalender";
import Ipos1Download from "../IPOwriteUp/Ipos1Download";
// ⛔️ Removed: IPOS1FileUpload import from this page
import UploadDataCard from "./UploadDataCard";
import LkFileUpload from "./LkFileUpload";
import DailyNoteUpload from "./DailyNoteUpload";
import FOS1FileUpload from "../Main/FOWriteUpMain/FOWriteUpUploads/FOS1FileUpload";

const uploadConfigs = [
  { key: "form", label: "Upload New Deal Data", apiEndpoint: "form_data_upload", buttonColor: "primary" },
  { key: "ai_insights", label: "Upload AI Insights Data", apiEndpoint: "upload_ai_insights", buttonColor: "secondary" },
  { key: "writeup", label: "Upload IPO writeUp Data", apiEndpoint: "writeup_data_upload", buttonColor: "error" },
  { key: "financialForecasts", label: "Upload IPO S1 FinancialForecasts", apiEndpoint: "financial_forecasts_data_upload", buttonColor: "success" },
  { key: "companymetric", label: "Upload Companymetric Data", apiEndpoint: "companymetric_data_upload", buttonColor: "warning" },
  { key: "fowriteup", label: "Upload FO writeUp Data", apiEndpoint: "fo_writeup_data_upload", buttonColor: "error" },
  { key: "focompanymetric", label: "Upload FO Companymetric Data", apiEndpoint: "fo_companymetric_data_upload", buttonColor: "warning" },
];

const monasheeUploadConfigs = [
  { key: "monashee_deals", label: "Monashee Deals Data", apiEndpoint: "monashee_deals_data_upload", buttonColor: "primary" },
  { key: "deal_logic", label: "Dealogic Data", apiEndpoint: "dealogic_data_upload", buttonColor: "secondary" },
  { key: "market_indices", label: "Market Indices", apiEndpoint: "upload_market_index", buttonColor: "success" },
  { key: "DailyNoteUpload", label: "Daily Note Upload", apiEndpoint: "daily_note_deals_upload", buttonColor: "success" },
  { key: "risk_reward_upload", label: "Risk Report Upload", apiEndpoint: "risk_report_upload", buttonColor: "success" },
];

const MainUpload: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedComponent, setSelectedComponent] = useState("newDeal");

  // General Upload States
  const [activeUpload, setActiveUpload] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");

  // Monashee Upload States
  const [monasheeActiveUpload, setMonasheeActiveUpload] = useState<string>("");
  const [monasheeFile, setMonasheeFile] = useState<File | null>(null);
  const [monasheeUploadedFileName, setMonasheeUploadedFileName] = useState<string>("");
  const [monasheeUploading, setMonasheeUploading] = useState<boolean>(false);
  const [monasheeUploadProgress, setMonasheeUploadProgress] = useState<number>(0);
  const [monasheeError, setMonasheeError] = useState<string>("");

  // Snackbar
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>, isMonashee = false) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (!selectedFile) return;

    if (isMonashee) {
      setMonasheeFile(selectedFile);
      setMonasheeUploadedFileName(selectedFile.name);
    } else {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  const handleUpload = async (isMonashee = false) => {
    const currentFile = isMonashee ? monasheeFile : file;
    const currentUpload = isMonashee ? monasheeActiveUpload : activeUpload;
    const currentConfigs = isMonashee ? monasheeUploadConfigs : uploadConfigs;

    if (!currentFile || !currentUpload) {
      isMonashee ? setMonasheeError("Please select file and upload type.") : setError("Please select file and upload type.");
      return;
    }

    const formData = new FormData();
    formData.append("file", currentFile);
    const config = currentConfigs.find((conf) => conf.key === currentUpload);
    if (!config || !apiUrl) return;

    try {
      isMonashee ? setMonasheeUploading(true) : setUploading(true);
      isMonashee ? setMonasheeError("") : setError("");
      await axios.post(`${apiUrl}/api/${config.apiEndpoint}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        onUploadProgress: (evt: ProgressEvent) => {
          const pct = Math.round((evt.loaded * 100) / (evt.total || 1));
          isMonashee ? setMonasheeUploadProgress(pct) : setUploadProgress(pct);
        },
      } as any);

      setSnackbarMessage(`${config.label} uploaded successfully.`);
      setOpenSnackbar(true);

      if (isMonashee) {
        setMonasheeFile(null);
        setMonasheeUploadedFileName("");
        setMonasheeActiveUpload("");
      } else {
        setFile(null);
        setUploadedFileName("");
        setActiveUpload("");
      }
    } catch (err) {
      console.error("Upload Error:", err);
      isMonashee ? setMonasheeError("Upload failed. Please try again.") : setError("Upload failed. Please try again.");
    } finally {
      isMonashee ? setMonasheeUploading(false) : setUploading(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    // When user clicks "IPO Files" tab (index 2), navigate to dedicated page
    if (newValue === 2) {
      navigate("/ipouploads");
      return;
    }
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 6 }}>
      <Container>
        <Typography variant="h5" align="center" sx={{ mb: 4, fontWeight: 600, color: "#b41f04" }}>
          Capital Markets Upload & Tools
        </Typography>

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          textColor="inherit"
          variant="fullWidth"
          indicatorColor="primary"
          sx={{
            background: "linear-gradient(to right, #4b6cb7, #182848)",
            borderRadius: 2,
            mb: 4,
            fontWeight: 600,
            color: "white",
            ".Mui-selected": { color: "#ffd700 !important" },
          }}
        >
          <Tab label="Monashee Data" />
          <Tab label="Upload" />
          <Tab label="IPO Files" /> {/* routes to /ipouploads */}
          <Tab label="Downloads" />
          <Tab label="Calendar" />
          <Tab label="LK File" />
          <Tab label="FO Files" />
        </Tabs>

        <Box>
          {selectedTab === 0 && (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              {monasheeActiveUpload === "daily_note_upload" ? (
                <DailyNoteUpload />
              ) : (
                <UploadDataCard
                  activeUpload={monasheeActiveUpload}
                  setActiveUpload={setMonasheeActiveUpload}
                  file={monasheeFile}
                  setFile={setMonasheeFile}
                  uploadedFileName={monasheeUploadedFileName}
                  setUploadedFileName={setMonasheeUploadedFileName}
                  error={monasheeError}
                  setError={setMonasheeError}
                  uploadConfigs={monasheeUploadConfigs}
                  handleFileChange={(e) => handleFileChange(e, true)}
                  handleUpload={() => handleUpload(true)}
                  uploading={monasheeUploading}
                  uploadProgress={monasheeUploadProgress}
                />
              )}
            </motion.div>
          )}

          {selectedTab === 1 && (
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
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
                handleFileChange={(e) => handleFileChange(e, false)}
                handleUpload={() => handleUpload(false)}
                uploading={uploading}
                uploadProgress={uploadProgress}
              />
            </motion.div>
          )}

          {/* IPO Files moved to /ipouploads */}

          {selectedTab === 3 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 3, background: "linear-gradient(to right, #c2e9fb, #a1c4fd)" }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <RadioGroup row value={selectedComponent} onChange={(e) => setSelectedComponent(e.target.value)} sx={{ justifyContent: "center" }}>
                    <FormControlLabel
                      value="newDeal"
                      control={<Radio sx={{ color: "#430077", "&.Mui-checked": { color: "#430077" } }} />}
                      label={<Box sx={{ color: "#430077", fontWeight: "bold" }}>New Deal Download</Box>}
                    />
                    <FormControlLabel
                      value="ipo"
                      control={<Radio sx={{ color: "#430077", "&.Mui-checked": { color: "#430077" } }} />}
                      label={<Box sx={{ color: "#430077", fontWeight: "bold" }}>IPO Writeup Download</Box>}
                    />
                  </RadioGroup>
                  <Divider />
                  <Box sx={{ mt: 2 }}>
                    {selectedComponent === "newDeal" ? <NewDealDownloadWithFilter /> : <Ipos1Download />}
                  </Box>
                </Box>
              </Card>
            </motion.div>
          )}

          {selectedTab === 4 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card elevation={3} sx={{ borderRadius: 3, pt: 6, p: 2, background: "linear-gradient(to top, #dfe9f3, #ffffff)" }}>
                <IpoDashboardCalendar />
              </Card>
            </motion.div>
          )}

          {selectedTab === 5 && (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card elevation={3} sx={{ borderRadius: 3, pt: 6, p: 2, background: "linear-gradient(to right, #ffecd2, #fcb69f)" }}>
                <LkFileUpload />
              </Card>
            </motion.div>
          )}

          {selectedTab === 6 && (
            <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Card elevation={3} sx={{ borderRadius: 3, p: 3, background: "linear-gradient(to right, #ffecd2, #fcb69f)" }}>
                <Typography variant="h6" align="center" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
                  Upload FO Files
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FOS1FileUpload />
              </Card>
            </motion.div>
          )}
        </Box>

        <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={() => setOpenSnackbar(false)}>
          <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: "100%" }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainUpload;

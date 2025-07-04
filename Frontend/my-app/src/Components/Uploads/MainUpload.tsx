import React, { useState, ChangeEvent } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Container,
  Card,
  LinearProgress,
  Grid,
  Divider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Tabs,
  Tab,
} from "@mui/material";
import { RadioGroup, Radio, FormControlLabel } from "@mui/material";

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { motion } from "framer-motion";

import NewDealDownloadWithFilter from "./NewDealDownloadWithFilter";
import IpoDashboardCalendar from "../Main/DashBoards/InsightsAi/UploadsInsights/IpoDashboardCalender";
import Ipos1Download from "../IPOwriteUp/Ipos1Download";
import FileUpload from "../IPOwriteUp/FileUpload";

const uploadConfigs = [
  {
    key: "form",
    label: "Upload New Deal Data",
    apiEndpoint: "form_data_upload",
    buttonColor: "primary",
  },
  {
    key: "monashee_deals",
    label: "Upload Monashee Deal Data",
    apiEndpoint: "monashee_deals_data_upload",
    buttonColor: "secondary",
  },
  {
    key: "writeup",
    label: "Upload IPO writeUp Data",
    apiEndpoint: "writeup_data_upload",
    buttonColor: "error",
  },
  {
    key: "financialForecasts",
    label: "Upload IPO S1 FinancialForecasts",
    apiEndpoint: "financial_forecasts_data_upload",
    buttonColor: "success",
  },
  {
    key: "companymetric",
    label: "Upload Companymetric Data",
    apiEndpoint: "companymetric_data_upload",
    buttonColor: "warning",
  },
];

const MainUpload: React.FC = () => {
  const [activeUpload, setActiveUpload] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [selectedComponent, setSelectedComponent] = useState("newDeal");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadedFileName(selectedFile.name);
    }
  };

  const handleUpload = async () => {
    if (!file || !activeUpload) {
      setError("Please select a file and upload type.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    const config = uploadConfigs.find((conf) => conf.key === activeUpload);
    const apiUrl = process.env.REACT_APP_API_URL;

    if (!config || !apiUrl) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      setError("");

      await axios.post(`${apiUrl}/api/${config.apiEndpoint}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setSnackbarMessage(`${config.label} uploaded successfully.`);
      setOpenSnackbar(true);
      setFile(null);
      setUploadedFileName("");
      setActiveUpload("");
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
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 4, fontWeight: 600, color: "#b41f04" }}
        >
          Capital Markets Upload & Tools
        </Typography>

        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          textColor="inherit"
          variant="fullWidth"
          indicatorColor="primary"
          sx={{
            background: "linear-gradient(to right, #4b6cb7, #182848)",
            borderRadius: 2,
            mb: 4,
            color: "white",
            ".Mui-selected": {
              color: "#ffd700 !important",
            },
          }}
        >
          <Tab label="Upload" />
          <Tab label="IPO Files" />
          <Tab label="Downloads" />
          <Tab label="Calendar" />
        </Tabs>

        {/* Tab Panels */}
        <Box>
          {selectedTab === 0 && (
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  background: "linear-gradient(to bottom, #e0eafc, #cfdef3)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  color="primary"
                  align="center"
                  sx={{ fontWeight: 600 }}
                >
                  Upload Data
                </Typography>

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel id="upload-type-label">
                    Select Upload Type
                  </InputLabel>
                  <Select
                    labelId="upload-type-label"
                    id="upload-type"
                    value={activeUpload}
                    label="Select Upload Type"
                    onChange={(e) => {
                      setActiveUpload(e.target.value);
                      setFile(null);
                      setUploadedFileName("");
                      setError("");
                    }}
                  >
                    {uploadConfigs.map((config) => (
                      <MenuItem key={config.key} value={config.key}>
                        {config.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {activeUpload && (
                  <Box sx={{ mt: 4 }}>
                    <Typography
                      variant="subtitle1"
                      align="center"
                      color="textSecondary"
                      gutterBottom
                    >
                      {
                        uploadConfigs.find((cfg) => cfg.key === activeUpload)
                          ?.label
                      }
                    </Typography>

                    <Box
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      gap={2}
                      sx={{
                        border: "2px dashed #ccc",
                        borderRadius: 2,
                        p: 3,
                        mt: 2,
                        backgroundColor: "#fdfdfd",
                      }}
                    >
                      <CloudUploadIcon
                        sx={{ fontSize: 40, color: "#1976d2" }}
                      />
                      <input
                        accept=".xlsx, .xls"
                        style={{ display: "none" }}
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                      />
                      <label htmlFor="file-upload">
                        <Button variant="contained" component="span">
                          Choose File
                        </Button>
                      </label>

                      {uploadedFileName && (
                        <Typography sx={{ mt: 1 }} color="text.secondary">
                          <strong>Selected:</strong> {uploadedFileName}
                        </Typography>
                      )}
                    </Box>

                    {error && (
                      <Typography color="error" align="center" sx={{ mt: 2 }}>
                        {error}
                      </Typography>
                    )}

                    <Button
                      onClick={handleUpload}
                      fullWidth
                      variant="contained"
                      color="success"
                      sx={{ mt: 3 }}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Submit"}
                    </Button>

                    {uploading && (
                      <Box sx={{ mt: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={uploadProgress}
                        />
                      </Box>
                    )}
                  </Box>
                )}
              </Card>
            </motion.div>
          )}

          {selectedTab === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  background: "linear-gradient(to right, #ffecd2, #fcb69f)",
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  color="primary"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Upload IPO Files
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FileUpload />
              </Card>
            </motion.div>
          )}

          {selectedTab === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  background: "linear-gradient(to right, #c2e9fb, #a1c4fd)",
                }}
              >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {/* Radio buttons */}

                  <RadioGroup
                    row
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(e.target.value)}
                    sx={{ justifyContent: "center" }} // Align center
                  >
                    <FormControlLabel
                      value="newDeal"
                      control={
                        <Radio
                          sx={{
                            color: "#430077",
                            "&.Mui-checked": { color: "#430077" },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ color: "#430077", fontWeight: "bold" }}>
                          New Deal Download
                        </Box>
                      }
                    />
                    <FormControlLabel
                      value="ipo"
                      control={
                        <Radio
                          sx={{
                            color: "#430077",
                            "&.Mui-checked": { color: "#430077" },
                          }}
                        />
                      }
                      label={
                        <Box sx={{ color: "#430077", fontWeight: "bold" }}>
                          IPO Writeup Download
                        </Box>
                      }
                    />
                  </RadioGroup>
                  <Divider />

                  {/* Conditionally show the selected component */}
                  <Box sx={{ mt: 2 }}>
                    {selectedComponent === "newDeal" ? (
                      <NewDealDownloadWithFilter />
                    ) : (
                      <Ipos1Download />
                    )}
                  </Box>
                </Box>
              </Card>
            </motion.div>
          )}

          {selectedTab === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  pt: 6,
                  p: 2,
                  background: "linear-gradient(to top, #dfe9f3, #ffffff)",
                }}
              >
                <IpoDashboardCalendar />
              </Card>
            </motion.div>
          )}
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={() => setOpenSnackbar(false)}
        >
          <Alert
            onClose={() => setOpenSnackbar(false)}
            severity="success"
            sx={{ width: "100%" }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default MainUpload;

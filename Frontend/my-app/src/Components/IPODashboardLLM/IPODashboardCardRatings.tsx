import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  TextField,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
interface IPODashboardCardRatingsProps {
  ipodata: Record<string, any>;
  selectedTicker: string;
  setIpoData: React.Dispatch<React.SetStateAction<any>>;
}

const ratingFields = [
  "profitability",
  "leverage",
  "management_quality",
  "customer_mix",
  "barriers_to_entry",
  "proprietary_solution",
  "near_term_catalyst",
  "valuation_attractiveness",
];

const infoFields: { label: string; key: string }[] = [
  { label: "Pricing Date", key: "pricing_date" },
  { label: "Price Range", key: "price_range" },
  { label: "Deal Size ($ Million)", key: "deal_size" },
  { label: "Industry", key: "industry" },
  { label: "Shares Offered", key: "shares_offered" },
  { label: "No of Shares Outstanding", key: "nosh" },
  { label: "Established", key: "established_year" },
  { label: "Bookrunners", key: "bookrunners" },
];

const formatValue = (key: string, value: any, ipodata: Record<string, any>) => {
  if (key === "price_range") {
    return ipodata.lower_bound && ipodata.upper_bound
      ? `$${ipodata.lower_bound} - $${ipodata.upper_bound}`
      : "N/A";
  }

  if (key === "deal_size" || key === "shares_offered") {
    return value ? Number(value).toLocaleString() : "N/A";
  }

  if (key === "nosh") {
    return value ? `${Number(value).toLocaleString()}M` : "N/A";
  }

  if (key === "bookrunners") {
    return Array.isArray(value) && value.length > 0 ? value.join(", ") : "N/A";
  }

  return value || "N/A";
};

const IPODashboardCardRatings: React.FC<IPODashboardCardRatingsProps> = ({
  ipodata,
  selectedTicker,
  setIpoData,
}) => {
  const [summaryEditMode, setSummaryEditMode] = useState(false);
  const [ratingsEditMode, setRatingsEditMode] = useState(false);
  const [editedSummaryData, setEditedSummaryData] = useState<Record<string, any>>({});
  const [editedRatingsData, setEditedRatingsData] = useState<Record<string, any>>({});

  if (!ipodata || Object.keys(ipodata).length === 0) return null;

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const handleSaveSummary = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");

      const payload: any = {
        ticker_name: selectedTicker,
        ...editedSummaryData,
      };

      // Format numbers for lower/upper bound
      if ("lower_bound" in editedSummaryData && editedSummaryData.lower_bound !== undefined) {
        payload.lower_bound = parseFloat(editedSummaryData.lower_bound);
      }
      if ("upper_bound" in editedSummaryData && editedSummaryData.upper_bound !== undefined) {
        payload.upper_bound = parseFloat(editedSummaryData.upper_bound);
      }

      console.log("Saving summary payload:", payload);

      const response = await axios.patch(`${apiUrl}/api/writeup_data/`, payload, {
        headers: getAuthHeaders(),
      });

      console.log("Summary saved. Response:", response.data);

      setIpoData((prev: any) => ({ ...prev, ...editedSummaryData }));
      setSummaryEditMode(false);
      setEditedSummaryData({});
    } catch (error: any) {
      console.error("Save Summary Error:", error.response?.data || error.message || error);
    }
  };

  const handleSaveRatings = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");

      const payload = {
        ticker_name: selectedTicker,
        ...editedRatingsData,
      };

      console.log("Saving ratings payload:", payload);

      const response = await axios.patch(`${apiUrl}/api/writeup_data/`, payload, {
        headers: getAuthHeaders(),
      });

      console.log("Ratings saved. Response:", response.data);

      setIpoData((prev: any) => ({ ...prev, ...editedRatingsData }));
      setRatingsEditMode(false);
      setEditedRatingsData({});
    } catch (error: any) {
      console.error("Save Ratings Error:", error.response?.data || error.message || error);
    }
  };

  const handleCancelSummary = () => {
    setEditedSummaryData({});
    setSummaryEditMode(false);
  };

  const handleCancelRatings = () => {
    setEditedRatingsData({});
    setRatingsEditMode(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* IPO Summary */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card sx={{ borderRadius: 4, background: "linear-gradient(#f0f5ff)", boxShadow: "0 12px 24px rgba(0,0,0,0.1)", p: 2 }}>
              <CardContent>
 <Box position="relative" mb={2} display="flex" justifyContent="center" alignItems="center">
  {/* Centered title */}
  <Typography variant="h6" sx={{ fontWeight: 700, color: "#6a1b9a" }}>
    IPO Summary
  </Typography>

  {/* Right-aligned icons */}
  <Box position="absolute" right={0}>
    {summaryEditMode ? (
      <>
        <IconButton color="primary" onClick={handleSaveSummary}>
          <SaveIcon />
        </IconButton>
        <IconButton color="secondary" onClick={handleCancelSummary}>
          <CancelIcon />
        </IconButton>
      </>
    ) : (
      <IconButton onClick={() => setSummaryEditMode(true)}>
        <EditIcon />
      </IconButton>
    )}
  </Box>
</Box>


                <Grid container spacing={3}>
                  {infoFields.map((field, idx) => (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}>
                            {field.label}
                          </Typography>

                          {summaryEditMode ? (
                            field.key === "price_range" ? (
                              <Box display="flex" gap={1}>
                                <TextField
                                  label="Lower Bound"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  value={editedSummaryData.lower_bound ?? ipodata.lower_bound ?? ""}
                                  onChange={(e) =>
                                    setEditedSummaryData((prev) => ({
                                      ...prev,
                                      lower_bound: e.target.value,
                                    }))
                                  }
                                />
                                <TextField
                                  label="Upper Bound"
                                  type="number"
                                  size="small"
                                  fullWidth
                                  value={editedSummaryData.upper_bound ?? ipodata.upper_bound ?? ""}
                                  onChange={(e) =>
                                    setEditedSummaryData((prev) => ({
                                      ...prev,
                                      upper_bound: e.target.value,
                                    }))
                                  }
                                />
                              </Box>
                            ) : (
                              <TextField
                                fullWidth
                                multiline
                                size="small"
                                value={editedSummaryData[field.key] ?? ipodata[field.key] ?? ""}
                                onChange={(e) =>
                                  setEditedSummaryData((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }))
                                }
                              />
                            )
                          ) : (
                            <Typography variant="body2" sx={{ color: "#333" }}>
                              {formatValue(field.key, ipodata[field.key], ipodata)}
                            </Typography>
                          )}
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Ratings Overview */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <Card sx={{ borderRadius: 4, background: "linear-gradient(#f0f5ff)", boxShadow: "0 12px 24px rgba(0,0,0,0.1)", p: 2 }}>
              <CardContent>
          <Box position="relative" mb={2}>
  {/* Centered title */}
  <Typography
    variant="h6"
    align="center"
    sx={{ fontWeight: 700, color: "#6a1b9a" }}
  >
    Ratings Overview
  </Typography>

  {/* Icons aligned right, vertically centered */}
  <Box
    position="absolute"
    right={0}
    top="50%"
    sx={{ transform: "translateY(-50%)" }}
  >
    {ratingsEditMode ? (
      <>
        <IconButton color="primary" onClick={handleSaveRatings}>
          <SaveIcon />
        </IconButton>
        <IconButton color="secondary" onClick={handleCancelRatings}>
          <CancelIcon />
        </IconButton>
      </>
    ) : (
      <IconButton onClick={() => setRatingsEditMode(true)}>
        <EditIcon />
      </IconButton>
    )}
  </Box>
</Box>


                <Grid container spacing={3}>
                  {ratingFields.map((field, idx) => {
                    const value = Math.round(Math.min(10, ipodata[field]) / 2);
                    return (
                      <Grid item xs={12} sm={6} key={field}>
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1, color: "#002060", textTransform: "capitalize" }}>
                            {field.replace(/_/g, " ")}
                          </Typography>

                          {ratingsEditMode ? (
                            <TextField
                              type="number"
                              size="small"
                              inputProps={{ min: 0, max: 10 }}
                              value={editedRatingsData[field] ?? ipodata[field] ?? ""}
                              onChange={(e) =>
                                setEditedRatingsData((prev) => ({
                                  ...prev,
                                  [field]: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <Box display="flex" gap={0.5}>
                              {[1, 2, 3, 4, 5].map((i) =>
                                i <= value ? (
                                  <StarIcon key={i} sx={{ color: "#e54702" }} />
                                ) : (
                                  <StarBorderIcon key={i} sx={{ color: "#ccc" }} />
                                )
                              )}
                            </Box>
                          )}
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default IPODashboardCardRatings;

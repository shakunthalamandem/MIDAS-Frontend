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
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

interface FebWriteupSummaryTableProps {
  ipodata: Record<string, any>;
  selectedTicker: string;
  setIpoData: React.Dispatch<React.SetStateAction<any>>;
}

const infoFields: { label: string; key: string }[] = [
  { label: "Pricing Date", key: "pricing_date" },
  { label: "Price Range", key: "price_range" },
  { label: "Deal Size ($ Million)", key: "deal_size" },
  { label: "Sector", key: "industry" },
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
  if (key === "deal_size") {
    if (value === undefined || value === null || value === "") return "N/A";
    const parsed = Number(value);
    if (Number.isNaN(parsed)) return "N/A";
    return `$ ${parsed.toLocaleString(undefined, {
      minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2
    })} M`;
  }
  if (key === "shares_offered") {
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

const FebWriteupSummaryTable: React.FC<FebWriteupSummaryTableProps> = ({
  ipodata,
  selectedTicker,
  setIpoData,
}) => {
  const [summaryEditMode, setSummaryEditMode] = useState(false);
  const [editedSummaryData, setEditedSummaryData] = useState<Record<string, any>>({});
  const [localSummaryData, setLocalSummaryData] = useState<Record<string, any>>({});


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

    // Build payload with all fields
    const payload: any = {
      ticker_name: selectedTicker,
      pricing_date: editedSummaryData.pricing_date ?? displayData.pricing_date ?? "",
      lower_bound: editedSummaryData.lower_bound ?? displayData.lower_bound ?? "",
      upper_bound: editedSummaryData.upper_bound ?? displayData.upper_bound ?? "",
      deal_size: editedSummaryData.deal_size ?? displayData.deal_size ?? "",
      industry: editedSummaryData.industry ?? displayData.industry ?? "",
      shares_offered: editedSummaryData.shares_offered ?? displayData.shares_offered ?? "",
      nosh: editedSummaryData.nosh ?? displayData.nosh ?? "",
      established_year: editedSummaryData.established_year ?? displayData.established_year ?? "",
      bookrunners: editedSummaryData.bookrunners ?? displayData.bookrunners ?? "",
    };

    // Parse numeric fields - remove empty values
    if (payload.lower_bound !== "") {
      payload.lower_bound = parseFloat(payload.lower_bound);
    } else {
      delete payload.lower_bound;
    }
    if (payload.upper_bound !== "") {
      payload.upper_bound = parseFloat(payload.upper_bound);
    } else {
      delete payload.upper_bound;
    }
    if (payload.deal_size !== "") {
      payload.deal_size = parseFloat(payload.deal_size);
    } else {
      delete payload.deal_size;
    }
    if (payload.shares_offered !== "") {
      payload.shares_offered = parseFloat(payload.shares_offered);
    } else {
      delete payload.shares_offered;
    }
    if (payload.nosh !== "") {
      payload.nosh = parseFloat(payload.nosh);
    } else {
      delete payload.nosh;
    }
    if (payload.established_year !== "") {
      payload.established_year = parseInt(payload.established_year, 10);
    } else {
      delete payload.established_year;
    }

    await axios.patch(`${apiUrl}/api/writeup_data/`, payload, {
      headers: getAuthHeaders(),
    });

    // Update local state with edited data
    setLocalSummaryData((prev) => ({
      ...prev,
      ...editedSummaryData,
    }));

    setSummaryEditMode(false);
    setEditedSummaryData({});
  } catch (error: any) {
    console.error("Save Summary Error:", error.response?.data || error.message || error);
    alert("Failed to save summary. Please try again.");
  }
};

  const handleCancelSummary = () => {
    setEditedSummaryData({});
    setSummaryEditMode(false);
  };

  // Helper to normalize date for input type="date"
  const normalizeDateForInput = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") {
      // Try to extract YYYY-MM-DD
      const match = value.match(/^\d{4}-\d{2}-\d{2}/);
      if (match) return match[0];
      // Try Date parsing
      const dt = new Date(value);
      if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);
      return "";
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    return "";
  };
  const displayData = { ...ipodata, ...localSummaryData };

  return (
<Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(#f0f5ff)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                p: 2,
              }}
            >
              <CardContent>
                <Box
                  position="relative"
                  mb={2}
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                >
                  <Box position="absolute" right={0}>
                    {summaryEditMode ? (
                      <>
                        <IconButton size="small" color="primary" onClick={handleSaveSummary} sx={{ padding: "3px" }}>
                          <SaveIcon />
                        </IconButton>
                        <IconButton size="small" color="secondary" onClick={handleCancelSummary} sx={{ padding: "3px" }}>
                          <CancelIcon />
                        </IconButton>
                      </>
                    ) : (
                      <IconButton size="small" onClick={() => setSummaryEditMode(true)} sx={{ padding: "3px" }}>
                        <EditIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>

                <Grid container spacing={3}>
                  {infoFields.map((field, idx) => (
                    <Grid item xs={12} sm={3} key={field.key}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}
                          >
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
                                  value={
                                    editedSummaryData.lower_bound ?? displayData.lower_bound ?? ""
                                  }
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
                                  value={
                                    editedSummaryData.upper_bound ?? displayData.upper_bound ?? ""
                                  }
                                  onChange={(e) =>
                                    setEditedSummaryData((prev) => ({
                                      ...prev,
                                      upper_bound: e.target.value,
                                    }))
                                  }
                                />
                              </Box>
                            ) : field.key === "pricing_date" ? (
                              <TextField
                                fullWidth
                                size="small"
                                type="date"
                                value={
                                  editedSummaryData.pricing_date ??
                                  normalizeDateForInput(displayData.pricing_date)
                                }
                                onChange={(e) =>
                                  setEditedSummaryData((prev) => ({
                                    ...prev,
                                    pricing_date: e.target.value,
                                  }))
                                }
                                InputLabelProps={{ shrink: true }}
                              />
                            ) : (
                              <TextField
                                fullWidth
                                multiline
                                size="small"
                                value={
                                  editedSummaryData[field.key] ?? displayData[field.key] ?? ""
                                }
                                onChange={(e) =>
                                  setEditedSummaryData((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }))
                                }
                              />
                            )
                          ) : (
                            <Typography variant="body2" sx={{ color: "#000000" }}>
                              {formatValue(field.key, displayData[field.key], displayData)}
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
      </Grid>
    </Container>
  );
};

export default FebWriteupSummaryTable;

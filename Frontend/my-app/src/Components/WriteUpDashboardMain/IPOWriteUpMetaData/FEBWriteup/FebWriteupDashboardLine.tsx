import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

interface FebWriteupDashboardLineProps {
  ipodata: Record<string, any>;
  selectedTicker: string;
  setIpoData: React.Dispatch<React.SetStateAction<any>>;
}

const timelineFields = [
  { label: "Filed Date", key: "filed_date" },
  { label: "Pricing Range Date", key: "term_date" },
  { label: "Pricing Date", key: "pricing_date" },
  { label: "First Trade Date", key: "trade_date" },
];

const FebWriteupDashboardLine: React.FC<FebWriteupDashboardLineProps> = ({
  ipodata,
  selectedTicker,
  setIpoData,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  // Normalize various date formats to `YYYY-MM-DD` for <input type="date">
  const normalizeDateForInput = (value: any): string => {
    if (!value) return "";
    if (typeof value === "string") {
      let str = value.trim();
      // Clean up common noise
      str = str.replace(/,+/g, " "); // remove commas
      str = str.replace(/\s+/g, " "); // collapse spaces
      // ISO or ISO-like: 2025-09-12 or 2025-09-12T00:00:00Z
      if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
      // dd/mm/yyyy or dd-mm-yyyy
      const dmy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.]([\d]{4})$/);
      if (dmy) {
        const d = dmy[1].padStart(2, "0");
        const m = dmy[2].padStart(2, "0");
        const y = dmy[3];
        return `${y}-${m}-${d}`;
      }
      // mm/dd/yyyy (US)
      const mdy = str.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.]([\d]{4})$/);
      if (mdy) {
        const m = mdy[1].padStart(2, "0");
        const d = mdy[2].padStart(2, "0");
        const y = mdy[3];
        // This will also match dmy; prefer valid calendar check below
        const iso = `${y}-${m}-${d}`;
        const test = new Date(iso);
        if (!isNaN(test.getTime())) return iso;
      }
      // d MMM yyyy or d MMMM yyyy
      const monthMap: Record<string, string> = {
        jan: "01",
        january: "01",
        feb: "02",
        february: "02",
        mar: "03",
        march: "03",
        apr: "04",
        april: "04",
        may: "05",
        jun: "06",
        june: "06",
        jul: "07",
        july: "07",
        aug: "08",
        august: "08",
        sep: "09",
        sept: "09",
        september: "09",
        oct: "10",
        october: "10",
        nov: "11",
        november: "11",
        dec: "12",
        december: "12",
      };
      const dMonY = str.match(/^(\d{1,2})\s+([A-Za-z]{3,9})\s+(\d{4})$/i);
      if (dMonY) {
        const d = dMonY[1].padStart(2, "0");
        const mon = monthMap[dMonY[2].toLowerCase()];
        const y = dMonY[3];
        if (mon) return `${y}-${mon}-${d}`;
      }
      // Mon d yyyy
      const monDY = str.match(/^([A-Za-z]{3,9})\s+(\d{1,2})\s+(\d{4})$/i);
      if (monDY) {
        const mon = monthMap[monDY[1].toLowerCase()];
        const d = monDY[2].padStart(2, "0");
        const y = monDY[3];
        if (mon) return `${y}-${mon}-${d}`;
      }
      // Remove ordinal suffixes on day numbers (1st, 2nd, 3rd, 4th, ...)
      str = str.replace(/\b(\d{1,2})(st|nd|rd|th)\b/i, "$1");

      // Try Date parsing as a quick path
      const dt = new Date(str);
      if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10);

      // Very forgiving numeric extraction fallback
      const nums = (str.match(/\d+/g) || []).map((n) => parseInt(n, 10));
      if (nums.length >= 3) {
        let y = 0, m = 0, d = 0;
        // If first token is year
        if (nums[0] > 31) {
          y = nums[0];
          m = nums[1];
          d = nums[2];
        } else {
          // Guess DMY vs MDY by constraints
          const a = nums[0];
          const b = nums[1];
          const c = nums[2];
          if (a > 12) {
            // DMY
            d = a; m = b; y = c;
          } else if (b > 12) {
            // MDY
            m = a; d = b; y = c;
          } else {
            // Default to DMY
            d = a; m = b; y = c;
          }
        }
        // Normalize year if two digits
        if (y < 100) y = y + 2000;
        const iso = `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
        const valid = new Date(iso);
        if (!isNaN(valid.getTime())) return iso;
      }
      return "";
    }
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString().slice(0, 10);
    }
    return "";
  };

  // Prepare initial edited values when entering edit mode
  const handleEnterEdit = () => {
    const initial: Record<string, any> = {};
    timelineFields.forEach(({ key }) => {
      initial[key] = normalizeDateForInput(ipodata?.[key]);
    });
    setEditedData(initial);
    setEditMode(true);
  };

  const handleSave = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");

      setLoading(true);

      const payload = {
        ticker_name: selectedTicker,
        ...editedData,
      };

      // Save updated data
      await axios.patch(`${apiUrl}/api/writeup_data/`, payload, {
        headers: getAuthHeaders(),
      });

      // Exit edit mode and optimistically update UI with new dates
      setEditMode(false);
      setIpoData((prev: any) => {
        const updates: Record<string, any> = {};
        timelineFields.forEach(({ key }) => {
          if (editedData[key] !== undefined) updates[key] = editedData[key];
        });
        return { ...(prev || {}), ...updates };
      });

      // 🔄 Re-fetch latest IPO data from API
      // const refreshed = await axios.get(
      //   `${apiUrl}/api/writeup_data/${selectedTicker}/?t=${Date.now()}`,
      //   { headers: getAuthHeaders() }
      // );

      // setIpoData(refreshed.data);
      setEditedData({});
    } catch (error: any) {
      console.error("Save Error:", error.response?.data || error.message || error);
    } finally {
      setLoading(false);
      setEditMode(false);
    }
  };

  const handleCancel = () => {
    setEditedData({});
    setEditMode(false);
  };

  // On mount or ticker change, fetch the latest data so reload shows current values
useEffect(() => {
  const fetchLatest = async () => {
    if (!apiUrl || !selectedTicker) return;
    try {
      const resp = await axios.post(
        `${apiUrl}/api/writeup_data/`,
        { ticker: selectedTicker },          // 👈 body (payload)
        { headers: getAuthHeaders() }        // 👈 headers (config)
      );
      setIpoData(resp.data);
    } catch (err) {
      console.error("Fetch latest IPO data failed:", err);
    }
  };
  fetchLatest();
}, [selectedTicker]);



  return (
    <Container maxWidth="xl" sx={{ mt: 4 }} className="pdf-hidden">
      <Card
        sx={{
          borderRadius: 4,
          background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          overflowX: "auto",
          p: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              minHeight: 120,
            }}
          >
            {timelineFields.map((item, index) => {
              return (
                <Box
                  key={item.key}
                  sx={{
                    textAlign: "center",
                    flex: 1,
                    position: "relative",
                  }}
                >
                  {/* Label */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ color: "#124180", fontWeight: 600, mb: 1 }}
                    >
                      {item.label}
                    </Typography>
                  </motion.div>

                  {/* Dot + Connecting Line */}
                  <Box
                    sx={{
                      position: "relative",
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: editMode ? 1.5 : 1,
                    }}
                  >
                    {index < timelineFields.length - 1 && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: "50%",
                          left: "50%",
                          width: "100%",
                          height: 2,
                          backgroundColor: "#003e36",
                          transform: "translateX(8px) translateY(-50%)",
                          zIndex: 1,
                        }}
                      />
                    )}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 }}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: "50%",
                        backgroundColor: "#002060",
                        margin: "0 auto",
                        zIndex: 2,
                      }}
                    />
                  </Box>

                  {/* Value or Input */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    {editMode ? (
                      <TextField
                        type="date"
                        size="small"
                        value={
                          editedData[item.key] !== undefined
                            ? editedData[item.key]
                            : normalizeDateForInput(ipodata[item.key])
                        }
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [item.key]: e.target.value,
                          }))
                        }
                        sx={{
                          mt: 1,
                          p: 2,
                          width: 150,
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          mt: 1,
                          display: "block",
                          fontWeight: 500,
                          color: ipodata?.[item.key] ? "#333" : "#999",
                        }}
                      >
                        {ipodata?.[item.key] ? String(ipodata[item.key]).trim() : "N/A"}
                      </Typography>
                    )}
                  </motion.div>

                </Box>
              );
            })}

            {/* Action Buttons */}
            <Box position="absolute" top={0} right={3}>
              {editMode ? (
                <>
            <IconButton size="small"
                    color="primary"
                    onClick={handleSave}
                    disabled={loading}
                    sx={{ padding: "4px" }}
                  >
                    {loading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <SaveIcon fontSize="small" />
                    )}
                  </IconButton>
                <IconButton size="small"
                    color="secondary"
                    onClick={handleCancel}
                    disabled={loading}
                    sx={{ padding: "4px" }}
                  >
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
             <IconButton size="small" onClick={handleEnterEdit} sx={{ padding: "4px" }}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default FebWriteupDashboardLine;

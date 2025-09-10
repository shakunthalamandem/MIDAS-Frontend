import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Container,
  IconButton,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

interface IPOdashboardLineProps {
  ipodata: Record<string, any>;
  selectedTicker: string;
  setIpoData: React.Dispatch<React.SetStateAction<any>>;
}

const timelineFields = [
  { label: "Filed Date", key: "filed_date" },
  { label: "Term Date", key: "term_date" },
  { label: "Pricing Date", key: "pricing_date" },
  { label: "Trade Date", key: "trade_date" },
];

const IPOdashboardLine: React.FC<IPOdashboardLineProps> = ({
  ipodata,
  selectedTicker,
  setIpoData,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const handleSave = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");

      const payload = {
        ticker_name: selectedTicker,
        ...editedData,
      };

      await axios.patch(`${apiUrl}/api/writeup_data/`, payload, {
        headers: getAuthHeaders(),
      });

      setIpoData((prev: any) => ({
        ...prev,
        ...editedData,
      }));

      setEditMode(false);
      setEditedData({});
    } catch (error: any) {
      console.error("Save Error:", error.response?.data || error.message || error);
    }
  };

  const handleCancel = () => {
    setEditedData({});
    setEditMode(false);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
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
              const value = editMode
                ? editedData[item.key] ?? ipodata[item.key] ?? ""
                : ipodata[item.key] ?? "N/A";

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
                      sx={{ color: "#002060", fontWeight: 600, mb: 1 }}
                    >
                      {item.label}
                    </Typography>
                  </motion.div>

                  {/* Dot */}
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
                        fullWidth
                        value={value ? value.slice(0, 10) : ""}
                        onChange={(e) =>
                          setEditedData((prev) => ({
                            ...prev,
                            [item.key]: e.target.value,
                          }))
                        }
                        sx={{ mt: 1 }}
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        sx={{
                          mt: 1,
                          display: "block",
                          fontWeight: 500,
                          color: "#333",
                        }}
                      >
                        {value}
                      </Typography>
                    )}
                  </motion.div>

                  {/* Connecting Line */}
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
                      }}
                    />
                  )}
                </Box>
              );
            })}

            {/* Action Buttons */}
            <Box position="absolute" top={0} right={0}>
              {editMode ? (
                <>
                  <IconButton color="primary" onClick={handleSave}>
                    <SaveIcon />
                  </IconButton>
                  <IconButton color="secondary" onClick={handleCancel}>
                    <CancelIcon />
                  </IconButton>
                </>
              ) : (
                <IconButton onClick={() => setEditMode(true)}>
                  <EditIcon />
                </IconButton>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default IPOdashboardLine;

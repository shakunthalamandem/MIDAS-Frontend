import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Tooltip,
  IconButton,
  TextField,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { motion } from "framer-motion";
import CircleIcon from "@mui/icons-material/Circle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import axios from "axios";

interface IPORatingCriteriaCardProps {
  ipodata: Record<string, any>;
  selectedTicker: string;
  setIpoData: React.Dispatch<React.SetStateAction<any>>;
}

const criteriaList = [
  { label: "Regulatory Environment", key: "regulatory_environment" },
  { label: "Customer Mix", key: "customer_mix" },
  { label: "Supplier Mix", key: "supplier_mix" },
  { label: "TAM/SAM & Penetration", key: "tam_sam_penetration" },
  { label: "Near-Term Catalysts", key: "growth_catalysts" },
  { label: "Secular Tailwinds/Headwinds", key: "secular_trends" },
  { label: "Revenue Growth Profile", key: "revenue_growth_profile" },
  { label: "Margin Profile", key: "margin_profile" },
  { label: "Leverage Profile", key: "leverage_profile" },
  { label: "Management Team", key: "management_team" },
  { label: "Sponsor Track Record", key: "sponsor_track_record" },
  { label: "ESG Focus", key: "esg_focus" },
  { label: "M&A Opportunities", key: "ma_opportunities" },
];

const getColorHex = (color: string | null) => {
  switch (color?.toLowerCase()) {
    case "green":
      return "#3ba55d";
    case "yellow":
      return "#ffcc00";
    case "red":
      return "#ff4d4f";
    default:
      return "#d3d3d3";
  }
};

const IPORatingCriteriaCard: React.FC<IPORatingCriteriaCardProps> = ({
  ipodata,
  selectedTicker,
  setIpoData,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<Record<string, any>>({});
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const revenueGrowth = ipodata?.revenue_growth || {};

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const handleSave = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");

      const payload = {
        ticker_name: selectedTicker,
        revenue_growth: {
          ...revenueGrowth,
          ...editedData,
        },
      };

      await axios.patch(`${apiUrl}/api/ipo-revenue-growth/`, payload, {
        headers: getAuthHeaders(),
      });

      setIpoData((prev: any) => ({
        ...prev,
        revenue_growth: payload.revenue_growth,
      }));

      setEditedData({});
      setEditMode(false);
    } catch (err) {
      console.error("Save Error:", err);
    }
  };

  const handleCancel = () => {
    setEditedData({});
    setEditMode(false);
  };

  const handleColorChange = (key: string, color: string) => {
    setEditedData((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        color,
        category: prev[key]?.category ?? revenueGrowth[key]?.category ?? "",
      },
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card
          sx={{
            borderRadius: 2,
            background: "#fff",
            boxShadow: "0 12px 24px rgba(0,0,0,0.05)",
            overflowX: "auto",
          }}
        >
          <CardContent>
            <Box position="relative" mb={2}>
              <Typography variant="h6" align="center" sx={{ fontWeight: 700, color: "#002060" }}>
                Revenue Growth Analysis
              </Typography>
              <Box position="absolute" right={0} top="50%" sx={{ transform: "translateY(-50%)" }}>
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
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Table sx={{ border: "1px solid #ccc" }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, width: "30%", borderRight: "1px solid #ccc" }}>
                    Criteria
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      width: "15%",
                      textAlign: "center",
                      borderRight: "1px solid #ccc",
                    }}
                  >
                    Color
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, width: "55%" }}>Notes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {criteriaList.map((item) => {
                  const original = revenueGrowth[item.key] || {};
                  const edited = editedData[item.key] || {};
                  const value = editMode ? edited.category ?? original.category : original.category;
                  const color = editMode ? edited.color ?? original.color : original.color;

                  return (
                    <TableRow key={item.key} sx={{ verticalAlign: "top" }}>
                      <TableCell sx={{ borderRight: "1px solid #ccc", fontWeight: 500 }}>
                        {item.label}
                      </TableCell>

                      <TableCell align="center" sx={{ borderRight: "1px solid #ccc" }}>
                        {editMode ? (
                          <Box display="flex" justifyContent="center" gap={1}>
                            {["red", "yellow", "green"].map((c) => (
                              <IconButton
                                key={c}
                                onClick={() => handleColorChange(item.key, c)}
                                size="small"
                                sx={{
                                  backgroundColor: getColorHex(c),
                                  border: color === c ? "2px solid #000" : "1px solid #aaa",
                                  borderRadius: "50%",
                                  width: 28,
                                  height: 28,
                                }}
                              >
                                {/* Empty CircleIcon just for shape */}
                              </IconButton>
                            ))}
                          </Box>
                        ) : (
                          <Tooltip title={value || "N/A"}>
                            <CircleIcon fontSize="small" sx={{ color: getColorHex(color) }} />
                          </Tooltip>
                        )}
                      </TableCell>

                      <TableCell>
                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Enter note"
                            value={value || ""}
                            onChange={(e) =>
                              setEditedData((prev) => ({
                                ...prev,
                                [item.key]: {
                                  ...prev[item.key],
                                  category: e.target.value,
                                  color: color,
                                },
                              }))
                            }
                          />
                        ) : (
                          <Typography sx={{ color: "#333", fontSize: "0.95rem" }}>
                            {value || "No data available"}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default IPORatingCriteriaCard;

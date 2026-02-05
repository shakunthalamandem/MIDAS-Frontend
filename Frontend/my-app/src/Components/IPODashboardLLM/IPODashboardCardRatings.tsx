import React, { useState, useEffect } from "react";
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
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { motion } from "framer-motion";
import CircleIcon from "@mui/icons-material/Circle";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// ---------- ✅ Types ----------
interface RevenueGrowthItem {
  color?: string;
  category?: string;
}

interface RevenueGrowth {
  [key: string]: RevenueGrowthItem;
}

interface IPOData {
  revenue_growth?: RevenueGrowth;
}

interface IPODashboardCardRatingsProps {
  selectedTicker: string;
  ipodata: IPOData;
  setIpoData: React.Dispatch<React.SetStateAction<IPOData>>;
  onLoaded?: () => void;
}

// ---------- ✅ Criteria Config ----------
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

// ---------- ✅ Helpers ----------
const getColorHex = (color: string | null | undefined) => {
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

const IPODashboardCardRatings: React.FC<IPODashboardCardRatingsProps> = ({
  selectedTicker,
  ipodata,
  setIpoData,
  onLoaded,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState<RevenueGrowth>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localRevenueGrowth, setLocalRevenueGrowth] = useState<RevenueGrowth>({});
  const [hasNotified, setHasNotified] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  useEffect(() => {
    setHasNotified(false);
  }, [selectedTicker]);

  useEffect(() => {
    let isActive = true;
    const fetchRevenueGrowthData = async () => {
      if (!apiUrl) {
        if (isActive) {
          setError("API URL not defined");
          setLoading(false);
        }
        return;
      }

      try {
        if (isActive) setLoading(true);
        const response = await fetch(`${apiUrl}/api/ipo-revenue-growth/`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({ ticker: selectedTicker }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch revenue growth data");
        }

        const data: RevenueGrowth = await response.json();
        if (data && typeof data === "object") {
          if (isActive) {
            setLocalRevenueGrowth(data);
            setIpoData((prev: IPOData) => ({
              ...prev,
              revenue_growth: data,
            }));
          }
        } else if (isActive) {
          setError("No revenue growth data available.");
        }
      } catch (err: any) {
        if (isActive) setError(err.message || "Unknown error occurred");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    if (selectedTicker) {
      fetchRevenueGrowthData();
    }

    return () => {
      isActive = false;
    };
  }, [selectedTicker, apiUrl, setIpoData]);

  useEffect(() => {
    if (!loading && !hasNotified) {
      onLoaded?.();
      setHasNotified(true);
    }
  }, [loading, hasNotified, onLoaded]);

  const revenueGrowth = localRevenueGrowth;

  const handleSaveRevenueGrowthData = async () => {
    try {
      if (!apiUrl) throw new Error("API URL not defined");

      const payload = {
        ticker_name: selectedTicker,
        revenue_growth: {
          ...revenueGrowth,
          ...editedData,
        },
      };

      const response = await fetch(`${apiUrl}/api/ipo-revenue-growth/`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Failed to save revenue growth data");
      }

      setIpoData((prev: IPOData) => ({
        ...prev,
        revenue_growth: payload.revenue_growth,
      }));
      setLocalRevenueGrowth(payload.revenue_growth);

      setEditedData({});
      setEditMode(false);
    } catch (err: any) {
      console.error("Save Error:", err);
      setError(err.message || "Save failed");
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

  const lightColorMap: { [key: string]: string } = {
    red: "#ffd6d6",
    yellow: "#fff7cc",
    green: "#d9fdd3",
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  // ---------- 🔍 Decide which rows to show & which are empty ----------
  const filledCriteria = criteriaList.filter((item) => {
    const original = revenueGrowth[item.key];
    const category = original?.category?.trim();
    return !!category;
  });

  const emptyCriteria = criteriaList.filter((item) => {
    const original = revenueGrowth[item.key];
    const category = original?.category?.trim();
    return !category;
  });

  const rowsToRender = editMode ? criteriaList : filledCriteria;

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
            overflowX: "auto",ml:3,mr:3
          }}
        >
          <CardContent>
            <Box position="relative" mb={2}>
              <Box display="flex" alignItems="center" justifyContent="center">
                <Typography
                  variant="h6"
                  align="center"
                  sx={{ fontWeight: 700, color: "#002060", mr: 1 }}
                >
                  Key Metrics
                </Typography>

                {/* Info Icon Tooltip */}
                <Tooltip
                  title={
                    <List dense>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: "1rem",
                          color: "#002060",
                          fontWeight: "bold",
                          mb: 1,
                        }}
                      >
                        Color Key:
                      </Typography>

                      <ListItem sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <FiberManualRecordIcon
                            sx={{ fontSize: 12, color: "#ff4d4f" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="Red = Negative" />
                      </ListItem>

                      <ListItem sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <FiberManualRecordIcon
                            sx={{ fontSize: 12, color: "#ffcc00" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="Yellow = Neutral" />
                      </ListItem>

                      <ListItem sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 24 }}>
                          <FiberManualRecordIcon
                            sx={{ fontSize: 12, color: "#3ba55d" }}
                          />
                        </ListItemIcon>
                        <ListItemText primary="Green = Positive" />
                      </ListItem>
                    </List>
                  }
                  arrow
                >
                  <IconButton size="small">
                    <InfoOutlinedIcon sx={{ color: "#7e7e7eff" }} />
                  </IconButton>
                </Tooltip>
              </Box>

              {/* Edit / Save / Cancel buttons on the right */}
              <Box
                position="absolute"
                right={0}
                top="50%"
                sx={{ transform: "translateY(-50%)" }}
              >
                {editMode ? (
                  <>
                    <IconButton color="primary" onClick={handleSaveRevenueGrowthData}>
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

            <Table sx={{ border: "2px solid #ccc" }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#002060" }}>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      borderRight: "2px solid #ccc",
                      width: "250px",
                      color: "#fff",
                    }}
                  >
                    Criteria
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      width: "100px",
                      textAlign: "center",
                      borderRight: "2px solid #ccc",
                      color: "#fff",
                    }}
                  >
                    Color
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      width: "auto",
                      color: "#fff",
                    }}
                  >
                    Notes
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {rowsToRender.map((item) => {
                  const original = revenueGrowth[item.key] || {};
                  const edited = editedData[item.key] || {};
                  const value = editMode
                    ? edited.category ?? original.category
                    : original.category;
                  const color = editMode
                    ? edited.color ?? original.color
                    : original.color;

                  return (
                    <TableRow key={item.key} sx={{ verticalAlign: "top" }}>
                      <TableCell
                        sx={{
                          borderRight: "2px solid #ccc",
                          fontWeight: 500,
                          fontSize: "1rem",
                        }}
                      >
                        {item.label}
                      </TableCell>

                      <TableCell
                        align="center"
                        sx={{ borderRight: "2px solid #ccc" }}
                      >
                        {editMode ? (
                          <Box display="flex" justifyContent="center" gap={1}>
                            {["red", "yellow", "green"].map((c) => {
                              const isSelected = color === c;
                              return (
                                <IconButton
                                  key={c}
                                  onClick={() => handleColorChange(item.key, c)}
                                  size="small"
                                  sx={{
                                    backgroundColor: isSelected
                                      ? getColorHex(c)
                                      : lightColorMap[c],
                                    border: isSelected
                                      ? "2px solid #000"
                                      : "1px solid #aaa",
                                    borderRadius: "50%",
                                    width: 28,
                                    height: 28,
                                  }}
                                />
                              );
                            })}
                          </Box>
                        ) : (
                          <Tooltip title={value || ""}>
                            <CircleIcon
                              fontSize="small"
                              sx={{ color: getColorHex(color) }}
                            />
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
                          <Typography sx={{ color: "#333", fontSize: "1rem" }}>
                            {value}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* ---------- 📝 Empty fields hint (view mode only) ---------- */}
            {!editMode && emptyCriteria.length > 0 && (
              <Box
                mt={2}
                p={1.5}
                className="pdf-hidden"
                sx={{
                  borderRadius: 1,
                  border: "1px dashed #ccc",
                  backgroundColor: "#fafafa",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  The empty fields are:
                </Typography>
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  {emptyCriteria.map((c) => c.label).join(", ")}
                </Typography>
                <Typography variant="caption" color="#000000">
                  You can click on the edit icon to fill these metrics.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default IPODashboardCardRatings;

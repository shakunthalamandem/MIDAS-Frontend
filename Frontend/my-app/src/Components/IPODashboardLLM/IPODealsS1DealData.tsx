import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  TextField,
  IconButton,
  Stack,
  Container,
} from "@mui/material";
import {
  FaBullseye,
  FaHandshake,
  FaTruckMoving,
  FaChartLine,
  FaClipboardList,
} from "react-icons/fa";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import IPOMonasheeScore from "./IPOMonasheeScore";
import { motion } from "framer-motion";

type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
};

type EditableField = keyof DealData;

interface IPODealsS1DealDataProps {
  selectedTicker: string | null;
}

const IPODealsS1DealData: React.FC<IPODealsS1DealDataProps> = ({
  selectedTicker,
}) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedDealData, setEditedDealData] = useState<DealData | null>(null);

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      if (!selectedTicker) {
        setError("No selected ticker provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${apiUrl}/api/ipo_deal_data_fairvalues/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ ticker: selectedTicker }),
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || "Failed to fetch deal data");
        }

        const data = await response.json();

        if (data && typeof data === "object" && Object.keys(data).length > 0) {
          setDealData(data);
        } else {
          setError("No deal data available.");
        }
      } catch (err: any) {
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (selectedTicker) {
      fetchDeals();
    }
  }, [selectedTicker]);

  const handleSaveDealData = async () => {
    if (!editedDealData) return;

    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) throw new Error("API URL not defined");

      const response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker: selectedTicker,
          ...editedDealData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save deal data");
      }

      setDealData(editedDealData);
      setEditMode(false);
      setEditedDealData(null);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
    }
  };

  const handleCancelEdit = () => {
    setEditedDealData(null);
    setEditMode(false);
  };

  const enterEditMode = () => {
    if (dealData) setEditedDealData(dealData);
    setEditMode(true);
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!dealData) return <Typography>No deal data found.</Typography>;

  return (
    <Container maxWidth="xl" style={{ marginTop: "20px", position: "relative" }}>
      <Card
        sx={{
          position: "relative",
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#f4f6f9",
          padding: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
          {editMode ? (
            <>
              <IconButton color="primary" onClick={handleSaveDealData}>
                <SaveIcon />
              </IconButton>
              <IconButton color="secondary" onClick={handleCancelEdit}>
                <CancelIcon />
              </IconButton>
            </>
          ) : (
            <IconButton color="default" onClick={enterEditMode}>
              <EditIcon />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <Grid container spacing={3}>
            {/* First Row */}
            {[{ label: "Fair Value Estimate", key: "fair_value_estimate", icon: <FaBullseye size={24} color="#002060" /> },
            { label: "Indication of Interest", key: "indication_of_interest", icon: <FaHandshake size={24} color="#002060" /> },
            { label: "After Market Threshold", key: "after_market_threshold", icon: <FaTruckMoving size={24} color="#002060" /> }]
            .map((field, idx) => (
              <Grid item xs={12} sm={4} key={idx} sx={{ display: "flex", flexDirection: "column" }}>
                <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ backgroundColor:"#fff", padding: 2, flexGrow: 1 ,border:'2px solid #002060',borderRadius: 2}}>
                    <Grid container spacing={2} alignItems="flex-start" sx={{ height: "100%" }}>
                      <Grid item xs>
                        <Box display="flex" >
                          <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold", mr: 1 }}>
                            {field.icon}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold" }}>
                            {field.label}
                          </Typography>
                        </Box>

                        {editMode ? (
                          <TextField
                            fullWidth
                            size="small"
                            multiline
                            minRows={2}
                            value={editedDealData?.[field.key as EditableField] ?? dealData[field.key as EditableField] ?? ""}
                            onChange={(e) =>
                              setEditedDealData((prev) => ({
                                ...prev!,
                                [field.key]: e.target.value,
                              }))
                            }
                          />
                        ) : (
                          <Typography sx={{ color: "#333", whiteSpace: "pre-line" }}>
                            {dealData[field.key as EditableField] ?? ""}
                          </Typography>
                        )}
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            ))}

            {/* Differentiated Summary */}
            <Grid item xs={12} sx={{ display: "flex", flexDirection: "column" }}>
              <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                <CardContent sx={{ backgroundColor: "#fff", padding: 2, flexGrow: 1 }}>
                  <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                    <FaClipboardList size={24} color="#002060" style={{ marginRight: 8 }} />
                    <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold" }}>
                      Differentiated Summary
                    </Typography>
                  </Box>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={4}
                      value={editedDealData?.differentiated_summary ?? dealData.differentiated_summary ?? ""}
                      onChange={(e) =>
                        setEditedDealData((prev) => ({
                          ...prev!,
                          differentiated_summary: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <Typography sx={{ color: "#333", whiteSpace: "pre-line" }}>
                      {dealData.differentiated_summary ?? ""}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Monashee Score */}
            <Grid item xs={12} sx={{ display: "flex", flexDirection: "column" }}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ flex: 1 }}>
                <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2, height: "100%", display: "flex", flexDirection: "column" }}>
                  <CardContent sx={{ backgroundColor: "#fff", padding: 2, flexGrow: 1 }}>
                    <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
                      <FaChartLine size={24} color="#002060" style={{ marginRight: 8 }} />
                      <Typography variant="h6" sx={{ color: "#002060", fontWeight: "bold" }}>
                        Monashee Proprietary Grade
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="center" mb={2}>
                      <Typography>
                        Recent IPO Performances related to this Sector.
                      </Typography>
                    </Box>

                    <IPOMonasheeScore ticker={selectedTicker ?? ""} monasheeScore={dealData.monashee_score} />
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 100, textAlign: "center" }}>
                      {editMode ? (
                        <Stack spacing={1} alignItems="center">
                          <Typography variant="subtitle2" sx={{ color: "#555" }}>
                            Enter Monashee Grade (0–10)
                          </Typography>
                          <TextField
                            type="number"
                            size="small"
                            inputProps={{ min: 0, max: 10, step: 1 }}
                            placeholder="0–10"
                            value={editedDealData?.monashee_score ?? dealData.monashee_score ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              const parsed = value === "" ? undefined : Number(value);
                              setEditedDealData((prev) => ({
                                ...prev!,
                                monashee_score: parsed === undefined ? 0 : parsed,
                              }));
                            }}
                            sx={{ width: 150, "& input": { textAlign: "center" } }}
                          />
                        </Stack>
                      ) : (
                        <Typography variant="h5" sx={{ color: "#086000ff", fontWeight: 600}}>
                          Grade is {dealData.monashee_score ?? 0} / 10
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>

        </Box>
      </Card>
    </Container>
  );
};

export default IPODealsS1DealData;

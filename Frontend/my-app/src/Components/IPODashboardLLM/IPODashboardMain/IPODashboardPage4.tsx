import React, { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  TextField,
  Button,
  IconButton,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import { FaChartLine } from "react-icons/fa";
import FinancialForecastTable from "../IPOFinancialTableMain";
import { cardStyle } from "../UtilsIPODashboard";
import { motion } from "framer-motion";
import IPOMonasheeScore from "../IPOMonasheeScore";
import { Edit } from "@mui/icons-material";

interface Props {
  selectedTicker: string;
  ipoData: any; // other IPO data
  showAIComparison: boolean;
  handleAIComparisonClick: () => void;
}

interface DealData {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
}

const IPODashboardPage4: React.FC<Props> = ({ selectedTicker }) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [tempScore, setTempScore] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");


  // ✅ Fetch deal data (POST with ticker)
  useEffect(() => {
    const fetchDealData = async () => {
      if (!apiUrl || !selectedTicker) return;

      try {
        setLoading(true);
        const res = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: selectedTicker }),
        });

        if (!res.ok) throw new Error("Failed to fetch deal data");

        const data = await res.json();
        setDealData(data);
      } catch (err: any) {
        setError(err.message || "Error fetching deal data");
      } finally {
        setLoading(false);
      }
    };

    fetchDealData();
  }, [selectedTicker]);

  // ✅ Save Monashee Score (POST)
  // const handleSaveMonasheeScore = async () => {
  //   if (!apiUrl || !dealData) return;
  //   try {
  //     setSaving(true);

  //     const response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
  //       method: "PATCH", // 👈 POST for update
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: token ? `Bearer ${token}` : "",
  //       },
  //       body: JSON.stringify({
  //         ticker: selectedTicker,
  //         monashee_score: tempScore,
  //       }),
  //     });

  //     if (!response.ok) throw new Error("Failed to save Monashee Score");

  //     const updated = await response.json();

  //     // ✅ Update local state with API response
  //     setDealData(updated);
  //     setEditMode(false);
  //     setError(null);
  //   } catch (err: any) {
  //     setError(err.message || "Unknown error");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSaveMonasheeScore = async () => {
    if (!apiUrl || !dealData) return;
    try {
      setSaving(true);

      const response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker: selectedTicker,
          monashee_score: tempScore === "" ? null : tempScore, // ✅ handle empty properly
        }),
      });

      if (!response.ok) throw new Error("Failed to save Monashee Score");

      // ✅ Update state with new value
      setDealData({
        ...dealData,
        monashee_score: tempScore === "" ? 0 : (tempScore as number),
      });

      setEditMode(false);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div id="ipo-dashboard-page4">
      <Container maxWidth="xl" sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          {/* Financial Forecast */}
          <Grid item xs={12}>
            <Card sx={{ ...cardStyle, backgroundColor: "#f9fafc" }}>
              <CardContent>
                <FinancialForecastTable defaultTicker={selectedTicker} />
              </CardContent>
            </Card>
          </Grid>

          {/* Monashee Score */}
          <Grid item xs={12}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ flex: 1 }}
            >
              <Card
                variant="outlined"
                sx={{
                  boxShadow: 2,
                  borderRadius: 2,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center">
                      <FaChartLine
                        size={24}
                        color="#002060"
                        style={{ marginRight: 8 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: "#002060", fontWeight: "bold" }}
                      >
                        Monashee Proprietary Grade
                      </Typography>
                    </Box>
                  }
                  action={
                    <IconButton
                      onClick={() => {
                        if (dealData) {
                          setTempScore(dealData.monashee_score); // ✅ prefill from DB
                          setEditMode(true);
                        }
                      }}
                    >
                      <Edit />
                    </IconButton>
                  }
                />
                <CardContent sx={{ backgroundColor: "#fff", flexGrow: 1 }}>
                  {loading ? (
                    <Box display="flex" justifyContent="center" my={3}>
                      <CircularProgress />
                    </Box>
                  ) : !dealData ? (
                    <Typography color="error">No deal data found</Typography>
                  ) : (
                    <>
                      <Box display="flex" justifyContent="center" mb={2}>
                        <Typography>
                          Recent IPO Performances related to this Sector.
                        </Typography>
                      </Box>

                      {/* Progress / Chart */}
                      <IPOMonasheeScore
                        ticker={selectedTicker ?? ""}
                        monasheeScore={dealData.monashee_score}
                      />

                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          minHeight: 100,
                          textAlign: "center",
                        }}
                      >
                        {editMode ? (
                          <Stack spacing={1} alignItems="center">
                            <Typography
                              variant="subtitle2"
                              sx={{ color: "#555" }}
                            >
                              Enter Monashee Grade (0–10)
                            </Typography>
                            <TextField
                              type="number"
                              size="small"
                              inputProps={{ min: 0, max: 10, step: 0.25 }}
                              placeholder="0–10"
                              value={tempScore}
                              onChange={(e) => {
                                const val = e.target.value;
                                setTempScore(val === "" ? "" : Number(val));
                              }}
                              sx={{
                                width: 150,
                                "& input": { textAlign: "center" },
                              }}
                            />
                            <Stack direction="row" spacing={1}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={handleSaveMonasheeScore}
                                disabled={saving}
                              >
                                {saving ? "Saving..." : "Save"}
                              </Button>
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => setEditMode(false)}
                              >
                                Cancel
                              </Button>
                            </Stack>
                            {error && (
                              <Typography color="error" variant="caption">
                                {error}
                              </Typography>
                            )}
                          </Stack>
                        ) : (
                          <Typography
                            variant="h5"
                            sx={{ color: "#086000ff", fontWeight: 600 }}
                          >
                            Monashee Grade is {dealData.monashee_score} / 10
                          </Typography>
                        )}
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default IPODashboardPage4;

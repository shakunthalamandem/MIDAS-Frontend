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
  Tooltip,
} from "@mui/material";
import { FaChartLine } from "react-icons/fa";
import IPOFinancialTableMain from "../IPOFinancialTableMain";
import { cardStyle } from "../UtilsIPODashboard";
import { motion } from "framer-motion";
import IPOMonasheeScore from "../IPOMonasheeScore";
import { Edit, InfoOutlined } from "@mui/icons-material";
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import LooksTwoIcon from "@mui/icons-material/LooksTwo";
import Looks3Icon from "@mui/icons-material/Looks3";

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
  sector: string;
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
                <IPOFinancialTableMain defaultTicker={selectedTicker} />
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
                {/* --- Custom Header --- */}
                <Box
                  sx={{
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 1,
                    // borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  <Box display="flex" alignItems="center">
                    <FaChartLine
                      size={24}
                      color="#002060"
                      style={{ marginRight: 8 }}
                    />
                    <Typography
                      variant="h6"
                      sx={{ color: "#002060", fontWeight: "bold" }}
                      align="center"
                    >
                      Monashee Proprietary Grade
                    </Typography>
                  </Box>

                  {/* Edit Button absolutely positioned */}
                  <IconButton
                    onClick={() => {
                      if (dealData) {
                        setTempScore(dealData.monashee_score); // prefill
                        setEditMode(true);
                      }
                    }}
                    sx={{ position: "absolute", right: 8 }}
                  >
                    <Edit />
                  </IconButton>
                </Box>

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
                          Recent IPO Performances related to{" "}
                          <span style={{ color: "#002060", fontWeight: 600 }}>
                            {dealData.sector} Sector
                          </span>
                          .
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
                          <>
                            <Typography
                              variant="h5"
                              sx={{
                                color: "#086000ff",
                                fontWeight: 600,
                                display: "inline-block",
                                mr: 1,
                              }}
                            >
                              Monashee Grade is {dealData.monashee_score} / 10
                            </Typography>
                            <Tooltip
                              title={
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: 13,
                                    color: "#fff", // white text
                                  }}
                                >
                                  • The Monashee Score is based on the average returns of the last five IPOs. <br />
                                  • A rating of 1–5 is assigned for the average T+1 day return. <br />
                                  • Another rating of 1–5 is assigned for the average 1-month return. <br />
                                  • Rating scale: <br />
                                  &nbsp;&nbsp;• &gt;50% = 5 <br />
                                  &nbsp;&nbsp;• 40–50% = 4 <br />
                                  &nbsp;&nbsp;• 30–40% = 3 <br />
                                  &nbsp;&nbsp;• 20–30% = 2 <br />
                                  &nbsp;&nbsp;• ≤20% = 1 <br />
                                  • The two ratings are then added to give a total score out of 10. <br />
                                  • This reflects both short-term and medium-term performance.
                                </Typography>


                              }
                              arrow
                              placement="top"
                              slotProps={{
                                popper: {
                                  sx: {
                                    "& .MuiTooltip-tooltip": {
                                      backgroundColor: "#002060", // dark blue bg
                                      borderRadius: 2,
                                      padding: "10px 14px",
                                      maxWidth: 320,
                                    },
                                  },
                                },
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{ verticalAlign: "middle" }}
                              >
                                <InfoOutlined />
                              </IconButton>
                            </Tooltip>
                          </>
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

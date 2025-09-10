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
  Container,
  CardHeader,
  Button,
} from "@mui/material";
import {
  FaBullseye,
  FaHandshake,
  FaTruckMoving,
  FaClipboardList,
} from "react-icons/fa";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import { LightbulbOutlined } from "@mui/icons-material";
import IPODashboardMainTable from "./IPODashboardMainTable";
import IPOAITickersMain from "./Hooks/IPOAITickersMain";

type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
};

type EditableField = keyof DealData;

interface SelectedData {
  ticker_name?: string;
  company_name?: string;
  exchange?: string;
}

interface IPODealsS1DealDataProps {
  selectedData: SelectedData;
}

const IPODealsS1DealData: React.FC<IPODealsS1DealDataProps> = ({ selectedData }) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedDealData, setEditedDealData] = useState<DealData | null>(null);

  // Toggle AI comparison
  const [showAIComparison, setShowAIComparison] = useState(false);
  const handleAIComparisonClick = () => {
    setShowAIComparison((prev) => !prev);
  };

  useEffect(() => {
    const fetchDeals = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        setLoading(false);
        return;
      }

      if (!selectedData?.ticker_name) {
        setError("No selected ticker provided.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker: selectedData.ticker_name }),
        });

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

    if (selectedData?.ticker_name) {
      fetchDeals();
    }
  }, [selectedData]);

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
          ticker: selectedData.ticker_name,
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
    <Container maxWidth="xl" sx={{ mt: 3, position: "relative" }}>
      <Card
        sx={{
          position: "relative",
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#f4f6f9",
          p: 3,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
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

        <Grid container spacing={3}>
          {/* Fair Value / Indication / After Market */}
          {[
            {
              label: "Fair Value Estimate",
              key: "fair_value_estimate",
              icon: <FaBullseye size={24} color="#002060" />,
            },
            {
              label: "Indication of Interest",
              key: "indication_of_interest",
              icon: <FaHandshake size={24} color="#002060" />,
            },
            {
              label: "After Market Threshold",
              key: "after_market_threshold",
              icon: <FaTruckMoving size={24} color="#002060" />,
            },
          ].map((field, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Card
                variant="outlined"
                sx={{ boxShadow: 2, borderRadius: 2, height: "100%" }}
              >
                <CardContent
                  sx={{
                    backgroundColor: "#fff",
                    border: "2px solid #002060",
                    borderRadius: 2,
                  }}
                >
                  <Box display="flex" alignItems="center" mb={1}>
                    {field.icon}
                    <Typography
                      variant="h6"
                      sx={{ ml: 1, fontWeight: "bold", color: "#002060" }}
                    >
                      {field.label}
                    </Typography>
                  </Box>
                  {editMode ? (
                    <TextField
                      fullWidth
                      size="small"
                      multiline
                      minRows={2}
                      value={
                        editedDealData?.[field.key as EditableField] ??
                        dealData[field.key as EditableField] ??
                        ""
                      }
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
                </CardContent>
              </Card>
            </Grid>
          ))}

          {/* Differentiated Summary */}
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
              <CardContent sx={{ backgroundColor: "#fff" }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <FaClipboardList
                    size={24}
                    color="#002060"
                    style={{ marginRight: 8 }}
                  />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: "bold", color: "#002060" }}
                  >
                    Differentiated Summary
                  </Typography>
                </Box>
                {editMode ? (
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    minRows={4}
                    value={
                      editedDealData?.differentiated_summary ??
                      dealData.differentiated_summary ??
                      ""
                    }
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

          {/* Comparative Table */}
          <Grid item xs={12}> 
            {/* <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}> */}
              {/* <CardContent sx={{ backgroundColor: "#fff" }}> */}
                <IPODashboardMainTable ticker={selectedData?.ticker_name ?? ""} />
                <Typography
                  variant="caption"
                  display="block"
                  align="right"
                  sx={{ fontStyle: "italic", color: "gray", mt: 1 }}
                >
                  Source: Factset
                </Typography>
              {/* </CardContent>
            </Card> */}
          </Grid>

          {/* AI Suggestions */}
          <Grid item xs={12}>
            <Card
              sx={{
                backgroundColor: "#f4f9ff",
                animation: showAIComparison ? "glowPulse 2s ease-out" : "none",
                "@keyframes glowPulse": {
                  "0%": { boxShadow: "0 0 0px rgba(0, 150, 255, 0)" },
                  "50%": { boxShadow: "0 0 20px rgba(0, 150, 255, 0.5)" },
                  "100%": { boxShadow: "0 0 0px rgba(0, 150, 255, 0)" },
                },
              }}
            >
              <CardHeader
                avatar={<LightbulbOutlined color="primary" />}
                title={
                  <Typography variant="h6" color="primary" fontWeight={600}>
                    Get AI-Recommended Comparative Tickers
                  </Typography>
                }
                action={
                  <Button
                    variant={showAIComparison ? "outlined" : "contained"}
                    color="primary"
                    onClick={handleAIComparisonClick}
                    sx={{ textTransform: "none", fontWeight: 500 }}
                  >
                    {showAIComparison ? "Hide Suggestions" : "Show Suggestions"}
                  </Button>
                }
              />
              <CardContent>
                {showAIComparison && (
                  <IPOAITickersMain selectedData={selectedData} />
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Container>
  );
};

export default IPODealsS1DealData;

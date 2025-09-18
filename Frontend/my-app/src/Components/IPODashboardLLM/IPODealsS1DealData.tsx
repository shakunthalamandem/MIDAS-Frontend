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

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";


type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
  internal_notes: string;
};

type EditableField = keyof DealData;

interface SelectedData {
  ticker_name?: string;
  company_name?: string;
  exchange?: string;
  valuation?: string[];
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
  const [editValuationMode, setEditValuationMode] = useState(false);
const [editedValuation, setEditedValuation] = useState<string[]>([]);
const valuation = selectedData?.valuation ?? []; 

      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");


  // Toggle AI comparison
  const [showAIComparison, setShowAIComparison] = useState(false);
  const handleAIComparisonClick = () => {
    setShowAIComparison((prev) => !prev);
  };



  
const handleAddValuationLine = (index: number) => {
  const updated = [...editedValuation];
  updated.splice(index + 1, 0, "");
  setEditedValuation(updated);
};

const handleRemoveValuationLine = (index: number) => {
  const updated = [...editedValuation];
  updated.splice(index, 1);
  setEditedValuation(updated);
};

const handleSaveValuation = async () => {
  try {

    if (!apiUrl) throw new Error("API URL not defined");
      const cleaned = editedValuation.filter((item) => item.trim() !== "");
      const formatted = cleaned.map((item) => `• ${item}`).join("\n");

    const response = await fetch(`${apiUrl}/api/writeup_data/`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify({
        ticker_name: selectedData.ticker_name,
        valuation: formatted,
      }),
    });

    if (!response.ok) throw new Error("Failed to save valuation");
    setEditValuationMode(false);


    selectedData.valuation = cleaned;
    setEditedValuation(cleaned);

    // Optionally, update dealData if you want to keep it in sync
    setDealData((prev) => prev ? { ...prev, valuation: formatted } : prev);  } catch (err: any) {
    setError(err.message || "Unknown error occurred");
  }
};

  useEffect(() => {
    const fetchDeals = async () => {


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
  <>
    {/* FAIR VALUE / INDICATION / AFTER MARKET */}
    <Container maxWidth="xl" sx={{ mt: 3 }}>
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
        </Grid>
      </Card>
    </Container>

 {/* Internal Notes */}
<Container maxWidth="xl" sx={{ mt: 4 }}>
  <Card
    elevation={0}
    className="pdf-hidden"
    sx={{
      borderRadius: 4,
      background: "linear-gradient(#f0f5ff, #f0f5ff)",
      width: "100%",
      mx: "auto",
      p: 3, 
    }}
  >
    {/* Header row */}
    <Box
      display="flex"
      alignItems="center"
      mb={2}
      sx={{ position: "relative" }} // 👈 allows absolute centering
    >
      {/* Centered title */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          color: "#002060",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        Aftermarket Strategy
      </Typography>

      {/* Action buttons on the right */}
      <Box ml="auto">
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
    </Box>

    {/* Body */}
    {editMode ? (
      <TextField
        fullWidth
        multiline
        minRows={4}
        placeholder="Enter internal notes here..."
        value={
          editedDealData?.internal_notes ??
          dealData.internal_notes ??
          ""
        }
        onChange={(e) =>
          setEditedDealData((prev) => ({
            ...prev!,
            internal_notes: e.target.value,
          }))
        }
      />
    ) : (
      <Typography
        sx={{
          color: "#333",
          whiteSpace: "pre-line",
          mt: 2, // 👈 adds gap from header
        }}
      >
        {dealData.internal_notes || "No internal notes provided."}
      </Typography>
    )}
  </Card>
</Container>




    {/* VALUATION INFORMATION */}
   <Container maxWidth="xl" sx={{ mt: 4 }}>
  <Card
    elevation={0}
    sx={{
      borderRadius: 4,
      background: "linear-gradient(#f0f5ff, #f0f5ff)",
      width: "100%",
      mx: "auto",
      p: 3, // 👈 padding inside the card
    }}
  >
         
        <Box
          position="relative"
          px={3}
          pt={2}
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#002060" }}>
            Valuation Information
          </Typography>
          <Box position="absolute" right={24}>
            {editValuationMode ? (
              <>
                <IconButton color="primary" onClick={handleSaveValuation}>
                  <SaveIcon />
                </IconButton>
                <IconButton
                  color="secondary"
                  onClick={() => {
                    setEditedValuation(Array.isArray(valuation) ? valuation : []);
                    setEditValuationMode(false);
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
            <IconButton onClick={() => {
                  setEditedValuation(Array.isArray(valuation) ? valuation : []);
                  setEditValuationMode(true);
            }}>
                <EditIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
       

        <Box px={3} pb={3}>
          {editValuationMode ? (
            <>
              {editedValuation.map((item, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
              >
                  <TextField
                    value={item}
                    onChange={(e) => {
                      const updated = [...editedValuation];
                      updated[index] = e.target.value;
                      setEditedValuation(updated);
                    }}
                    fullWidth
                    multiline
                    size="small"
                    InputProps={{ style: { backgroundColor: "#fff" } }}
                  />
                  <IconButton
                    color="primary"
                    onClick={() => handleAddValuationLine(index)}
                    size="small"
                  >
                    <AddCircleOutlineIcon />
                  </IconButton>
                  {editedValuation.length > 1 && (
                    <IconButton
                      color="error"
                      onClick={() => handleRemoveValuationLine(index)}
                      size="small"
                    >
                      <RemoveCircleOutlineIcon />
                    </IconButton>
                  )}
                </Box>
              ))}
              {editedValuation.length === 0 && (
                <Button
                  variant="outlined"
                  onClick={() => handleAddValuationLine(-1)}
                >
                  Add First Point
                </Button>
              )}
            </>
          ) : (
            <>
              {Array.isArray(valuation) && valuation.length > 0 ? (
                <Box component="ul" sx={{ pl: 3, color: "#333", mt: 1 }}>
                  {valuation.map((item: string, index: number) => (
                    <li key={index} style={{ marginBottom: 8, lineHeight: 1.6 }}>
                      {item}
                    </li>
                  ))}
                </Box>
              ) : (
                <Typography
                  variant="body1"
                  sx={{ color: "#333", textAlign: "center", mt: 2 }}
                >
                  No valuation data available.
                </Typography>
              )}
            </>
          )}
        </Box>
      </Card>
    </Container>

    {/* COMPARATIVE TABLE */}
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
        <CardContent sx={{ backgroundColor: "#fff" }}>
          <IPODashboardMainTable ticker={selectedData?.ticker_name ?? ""} />
          <Typography
            variant="caption"
            display="block"
            align="right"
            sx={{ fontStyle: "italic", color: "gray", mt: 1 }}
          >
            Source: Factset
          </Typography>
        </CardContent>
      </Card>
    </Container>

    {/* AI COMPARISON */}
    <Container maxWidth="xl" sx={{ mt: 4 }}>
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
    </Container>

    {/* DIFFERENTIATED SUMMARY */}
   <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
  <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 }}>
    <CardContent sx={{ backgroundColor: "#fff" }}>
      {/* Header row */}
      <Box
        display="flex"
        alignItems="center"
        mb={2}
        sx={{ position: "relative" }}
      >
        {/* Centered title with icon */}
        <Box
          sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
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

        {/* Action buttons on the right */}
        <Box ml="auto">
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
      </Box>

      {/* Body */}
      {editMode ? (
        <TextField
          fullWidth
          size="small"
          multiline
          minRows={4}
          placeholder="Enter differentiated summary..."
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
        <Typography
          sx={{ color: "#333", whiteSpace: "pre-line", mt: 2 }}
        >
          {dealData.differentiated_summary || "No differentiated summary provided."}
        </Typography>
      )}
    </CardContent>
  </Card>
</Container>

  </>
);

};

export default IPODealsS1DealData;

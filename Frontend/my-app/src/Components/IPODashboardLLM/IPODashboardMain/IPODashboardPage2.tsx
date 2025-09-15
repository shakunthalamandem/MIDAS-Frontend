import React, { useRef, useEffect, useState } from "react";
import axios from "axios";
import IPODashboardCardRatings from "../IPODashboardCardRatings";
import { Card, Box, Typography, IconButton, TextField, Button, Container } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";

interface Props {
  ipoData: any;
  selectedTicker: string;
  setIpoData: (data: any) => void;
}

const IPODashboardPage2: React.FC<Props> = ({
  ipoData,
  selectedTicker,
  setIpoData,
}) => {
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [editValuationMode, setEditValuationMode] = useState(false);
  const [editedValuation, setEditedValuation] = useState<string[]>([]);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    setEditedValuation(ipoData?.valuation || []);
  }, [ipoData?.valuation]);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  });

  const handleSaveValuation = async () => {
    try {
      if (!apiUrl) return;

      const cleaned = editedValuation.filter((item) => item.trim() !== "");
      const formatted = cleaned.map((item) => `• ${item}`).join("\n");

      await axios.patch(
        `${apiUrl}/api/writeup_data/`,
        {
          ticker_name: ipoData.ticker_name,
          valuation: formatted,
        },
        { headers: getAuthHeaders() }
      );

      // Update state
      setIpoData({
        ...ipoData,
        valuation: cleaned,
      });

      setEditValuationMode(false);
    } catch (err) {
      console.error("Failed to save valuation:", err);
    }
  };

  const handleAddValuationLine = (index: number) => {
    setEditedValuation((prev) => {
      const newArr = [...prev];
      newArr.splice(index + 1, 0, "");
      return newArr;
    });
  };

  const handleRemoveValuationLine = (index: number) => {
    setEditedValuation((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    // Measure max height for each row
    const heights: number[] = [];
    let tempHeights: number[] = [];

    cardRefs.current.forEach((card, i) => {
      if (card) {
        tempHeights.push(card.offsetHeight);
      }
      if ((i + 1) % 2 === 0 || i === cardRefs.current.length - 1) {
        heights.push(Math.max(...tempHeights));
        tempHeights = [];
      }
    });

    setRowHeights(heights);
  }, [ipoData]);

  return (
    <div id="ipo-dashboard-page2">
      {/* <Container maxWidth="xl" >
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          background: "linear-gradient(#f0f5ff, #f0f5ff)",
          mb: 2,
          mt: 4,
          width: "100%",
          mx: "auto",
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
                    setEditedValuation(ipoData?.valuation || []);
                    setEditValuationMode(false);
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </>
            ) : (
              <IconButton onClick={() => setEditValuationMode(true)}>
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
              {Array.isArray(ipoData?.valuation) &&
              ipoData.valuation.length > 0 ? (
                <Box component="ul" sx={{ pl: 3, color: "#333", mt: 1 }}>
                  {ipoData.valuation.map((item: string, index: number) => (
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
      </Container> */}

      <IPODashboardCardRatings
        ipodata={ipoData}
        selectedTicker={selectedTicker}
        setIpoData={setIpoData}
      />
    </div>
  );
};

export default IPODashboardPage2;

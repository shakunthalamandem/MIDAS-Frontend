import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  TextField,
  IconButton,
  Container,

} from "@mui/material";
import {

  FaClipboardList,
} from "react-icons/fa";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";



type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
  internal_notes: string;
};


interface SelectedData {
  ticker_name?: string;
  company_name?: string;
  exchange?: string;
  valuation?: string[];
}

interface IPODifferenciateSummaryProps {
  selectedData: SelectedData;
}

const IPODifferenciateSummary: React.FC<IPODifferenciateSummaryProps> = ({ selectedData }) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedDealData, setEditedDealData] = useState<DealData | null>(null);


  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");







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

export default IPODifferenciateSummary;

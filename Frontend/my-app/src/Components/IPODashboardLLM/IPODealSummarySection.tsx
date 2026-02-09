// src/components/IPODashboardMain/IPODealSummarySection.tsx
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  CircularProgress,
  IconButton,
  Container,
} from "@mui/material";
import {
  FaBullseye,
  FaHandshake,
  FaTruckMoving,
} from "react-icons/fa";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import { SelectedData } from "./IPODealsS1DealData";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  internal_notes: string;
};

type EditableField = keyof DealData;

interface Props {
  selectedData: SelectedData;
}

const IPODealSummarySection: React.FC<Props> = ({ selectedData }) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedDealData, setEditedDealData] = useState<DealData | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "list",
    "bullet",
    "link",
  ];

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
        const response = await fetch(
          `${apiUrl}/api/ipo_deal_data_fairvalues/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify({ ticker: selectedData.ticker_name }),
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

    if (selectedData?.ticker_name) {
      fetchDeals();
    }
  }, [selectedData, apiUrl, token]);

  const handleSaveDealData = async () => {
    if (!editedDealData) return;

    try {
      if (!apiUrl) throw new Error("API URL not defined");

      const response = await fetch(
        `${apiUrl}/api/ipo_deal_data_fairvalues/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            ticker: selectedData.ticker_name,
            ...editedDealData,
          }),
        }
      );

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
                      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
                        <ReactQuill
                          theme="snow"
                          value={
                            editedDealData?.[field.key as EditableField] ??
                            dealData[field.key as EditableField] ??
                            ""
                          }
                          onChange={(value) =>
                            setEditedDealData((prev) => ({
                              ...prev!,
                              [field.key]: value,
                            }))
                          }
                          modules={quillModules}
                          formats={quillFormats}
                        />
                      </Box>
                    ) : (
                      <Box
                        sx={{ color: "#333", mt: 1, "& ul": { m: 0, pl: 3 } }}
                        dangerouslySetInnerHTML={{
                          __html: dealData[field.key as EditableField] ?? "",
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Card>
      </Container>

      {/* AFTERMARKET STRATEGY / INTERNAL NOTES */}
      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Card
          elevation={0}
          className="pdf-hidden"
          sx={{
            borderRadius: 4,
            background: "linear-gradient(#f0f5ff, #f0f5ff)",
            width: "100%",
            mx: "auto",
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            mb={2}
            sx={{ position: "relative" }}
            p={2}
    
            
          >
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

            <Box ml="auto" display="flex" alignItems="center" gap={1}>
              <Typography
                variant="body2"
                sx={{ color: "#000000", fontStyle: "italic" }}
              >
                (For internal use only, not included in PDF)
              </Typography>

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

          {editMode ? (
            <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <ReactQuill
                theme="snow"
                value={
                  editedDealData?.internal_notes ??
                  dealData.internal_notes ??
                  ""
                }
                onChange={(value) =>
                  setEditedDealData((prev) => ({
                    ...prev!,
                    internal_notes: value,
                  }))
                }
                modules={quillModules}
                formats={quillFormats}
              />
            </Box>
          ) : dealData.internal_notes ? (
            <Box
              sx={{
                color: "#333",
                lineHeight: 1.6,
                mt: 2,
                p: 2,
                textAlign: "center",
                "& ul": { margin: 0, paddingLeft: 3 },
              }}
              dangerouslySetInnerHTML={{ __html: dealData.internal_notes }}
            />
          ) : (
            <Typography
              sx={{
                color: "#333",
                mt: 2,
                p: 2,
              }}
              align="center"
            >
              No internal notes provided.
            </Typography>
          )}
        </Card>
      </Container>
    </>
  );
};

export default IPODealSummarySection;

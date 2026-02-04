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
import { FaClipboardList } from "react-icons/fa";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";
import ValuationImagePanel from "./ValuationImagePanel";



type DealData = {
  fair_value_estimate: string;
  indication_of_interest: string;
  after_market_threshold: string;
  monashee_score: number;
  differentiated_summary: string;
  internal_notes: string;
  differentiated_summary_image_url?: string | null;
};


interface SelectedData {
  ticker_name?: string;
  company_name?: string;
  exchange?: string;
  valuation?: string[];
}

interface IPODifferenciateSummaryProps {
  selectedData: SelectedData;
  onLoaded?: () => void;
}

const IPODifferenciateSummary: React.FC<IPODifferenciateSummaryProps> = ({
  selectedData,
  onLoaded,
}) => {
  const [dealData, setDealData] = useState<DealData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedDealData, setEditedDealData] = useState<DealData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);


  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [hasNotified, setHasNotified] = useState(false);

  useEffect(() => {
    setHasNotified(false);
  }, [selectedData?.ticker_name]);
  useEffect(() => {
    let isActive = true;
    const fetchDeals = async () => {

      if (!apiUrl) {
        if (isActive) {
          setError("API URL is not defined in environment variables");
          setLoading(false);
        }
        return;
      }

      if (!selectedData?.ticker_name) {
        if (isActive) {
          setError("No selected ticker provided.");
          setLoading(false);
        }
        return;
      }

      try {
        if (isActive) setLoading(true);
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

        if (isActive && data && typeof data === "object" && Object.keys(data).length > 0) {
          setDealData(data);
        } else if (isActive) {
          setError("No deal data available.");
        }
      } catch (err: any) {
        if (isActive) setError(err.message || "Unknown error occurred");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    if (selectedData?.ticker_name) {
      fetchDeals();
    }

    return () => {
      isActive = false;
    };
  }, [selectedData, apiUrl, token]);

  useEffect(() => {
    if (!loading && !hasNotified) {
      onLoaded?.();
      setHasNotified(true);
    }
  }, [loading, hasNotified, onLoaded]);

  const handleSaveDealData = async () => {
    if (!editedDealData) return;

    try {
      if (!apiUrl) throw new Error("API URL not defined");
      if (!selectedData?.ticker_name) throw new Error("Ticker name is missing");

      setSaving(true);
      setError(null);
      setUploadError(null);

      const basePayload = {
        ticker: selectedData.ticker_name,
        fair_value_estimate: editedDealData.fair_value_estimate,
        indication_of_interest: editedDealData.indication_of_interest,
        after_market_threshold: editedDealData.after_market_threshold,
        monashee_score: editedDealData.monashee_score,
        differentiated_summary: editedDealData.differentiated_summary ?? "",
        internal_notes: editedDealData.internal_notes,
      };

      let response: Response;
      if (imageFile) {
        const formData = new FormData();
        Object.entries(basePayload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value));
          }
        });
        formData.append("differentiated_summary_image", imageFile);

        response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
          method: "PATCH",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: formData,
        });
      } else {
        response = await fetch(`${apiUrl}/api/ipo_deal_data_fairvalues/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(basePayload),
        });
      }

      let responseJson: any = null;
      try {
        responseJson = await response.json();
      } catch {
        responseJson = null;
      }

      if (!response.ok) {
        const message =
          responseJson?.message ||
          responseJson?.error ||
          "Failed to save deal data";
        throw new Error(message);
      }

      const newImageUrl =
        responseJson?.differentiated_summary_image_url ??
        dealData?.differentiated_summary_image_url ??
        null;

      setDealData((prev) => {
        const base = prev ?? editedDealData;
        return {
          ...base,
          ...editedDealData,
          differentiated_summary_image_url: newImageUrl,
        };
      });
      setEditMode(false);
      setEditedDealData(null);
      setImageFile(null);
      setUploadError(null);
    } catch (err: any) {
      setError(err.message || "Unknown error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (saving) return;
    setEditedDealData(null);
    setImageFile(null);
    setUploadError(null);
    setEditMode(false);
  };

  const enterEditMode = () => {
    if (dealData) {
      setEditedDealData(dealData);
      setImageFile(null);
      setUploadError(null);
      setEditMode(true);
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!dealData) return <Typography>No deal data found.</Typography>;

  const showImageColumn =
    editMode ||
    Boolean(dealData.differentiated_summary_image_url) ||
    Boolean(imageFile);

  return (
    <>








      {/* DIFFERENTIATED SUMMARY */}
      <Container maxWidth="xl" sx={{ mt: 4, mb: 6 }}>
        <Card variant="outlined" sx={{ boxShadow: 2, borderRadius: 2 , background: "linear-gradient(#f0f5ff, #f0f5ff)",ml:3,mr:3}} >
          <CardContent sx={{                            background: "linear-gradient(#f0f5ff, #f0f5ff)",}}>
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
                    <IconButton
                      color="primary"
                      onClick={handleSaveDealData}
                      disabled={saving}
                      className="pdf-hidden"
                    >
                      {saving ? <CircularProgress size={20} /> : <SaveIcon />}
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="pdf-hidden"
                    >
                      <CancelIcon />
                    </IconButton>
                  </>
                ) : (
                  <IconButton color="default" onClick={enterEditMode} className="pdf-hidden">
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            {saving && (
              <Box
                display="flex"
                justifyContent="flex-end"
                alignItems="center"
                mb={2}
              >
                <Typography variant="caption" sx={{ color: "#555" }}>
                  Saving summary & media... Please wait.
                </Typography>
              </Box>
            )}

            {/* Body */}
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                gap: 2,
                minHeight: 220,
              }}
            >
              <Box
                sx={{
                  flex: showImageColumn ? 7 : 1,
                }}
              >
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
                  <Box
                    sx={{ color: "#333", mt: 2 }}
                    dangerouslySetInnerHTML={{
                      __html:
                        dealData.differentiated_summary ||
                        "<p>No differentiated summary provided.</p>",
                    }}
                  />
                )}

                {uploadError && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ mt: 1, display: "block" }}
                  >
                    {uploadError}
                  </Typography>
                )}
              </Box>

              {showImageColumn && (
                <Box
                  sx={{
                    flex: 3,
                    mt: { xs: 2, md: 0 },
                  }}
                >
                  <ValuationImagePanel
                    editMode={editMode}
                    valuationImageId={
                      dealData.differentiated_summary_image_url ?? null
                    }
                    apiUrl={apiUrl}
                    token={token}
                    imageFile={imageFile}
                    onImageFileChange={setImageFile}
                    setUploadError={setUploadError}
                    title="Differentiated Summary Image"
                    altText="Differentiated summary visual"
                    tickerName={selectedData?.ticker_name}
                    deleteApiPath="/api/delete_differentiated_summary_image/"
                    onImageDeleted={() =>
                      setDealData((prev) =>
                        prev
                          ? {
                              ...prev,
                              differentiated_summary_image_url: null,
                            }
                          : prev
                      )
                    }
                  />
                </Box>
              )}
            </Box>

          </CardContent>
        </Card>
      </Container>

    </>
  );

};

export default IPODifferenciateSummary;

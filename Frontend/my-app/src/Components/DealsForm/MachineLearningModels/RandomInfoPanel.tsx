import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Stack,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";

interface FormData {
  deal_stats: string;
  ticker: string;
  pricing_date: string;
  deal_type: string;
  region: string;
  sponsor: string | null;
  deal_size: number;
  lead_bank: string | null;
  primary_percentage: number | null;
  sector: string;
  discount_from_announcement_price: number | null;
  allocation_as_percentage_of_deal_size: number | null;
  allocation_as_percentage_of_ioi: number | null;
  gdp_growth: string | null;
  inflation_rate: string | null;
  treasury_rates: string | null;
  t1d_pred: string;
}

interface ApiResponse {
  data: FormData[];
}

interface RandomInfoPanelProps {
  onSelect: (formData: FormData) => void;
}

const RandomInfoPanel: React.FC<RandomInfoPanelProps> = ({ onSelect }) => {
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/recent_predictions/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const json: ApiResponse = await response.json();
        const sorted = json.data.sort(
          (a, b) =>
            new Date(b.pricing_date).getTime() -
            new Date(a.pricing_date).getTime()
        );
        setForms(sorted.slice(0, 10));
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleCardClick = (item: FormData) => {
    sessionStorage.setItem("selected_form_data", JSON.stringify(item));
    sessionStorage.setItem("auto_predict", "true");
    window.open("/machine_learning/equity");
  };
const renderPredictionChip = (prediction: string) => {
  const normalized = prediction?.toLowerCase(); // handle null/undefined

  const color =
    normalized === "positive" || normalized === "positive return"
      ? green[600]
      : normalized === "negative" || normalized === "low return"
      ? red[500]
      : normalized === "neutral"
      ? grey[600]
      : grey[600]; // fallback for any other value

  return (
    <Chip
      label={prediction?.toUpperCase() || "N/A"}
      size="small"
      sx={{
        backgroundColor: color,
        color: "white",
        fontWeight: "bold",
        height: 22,
      }}
    />
  );
};


  const formatSector = (raw: string) => {
    if (!raw) return "N/A";
    const cleaned = raw.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("en-GB", options);
  };

  const getCardBackgroundColor = (dealType: string) => {
    if (dealType.toLowerCase() === "ipo") return "#f6e9c6";
    return "#e8f4fc"; // FO or others
  };

  if (loading)
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100px"
      >
        <CircularProgress size={20} />
      </Box>
    );

  if (error)
    return (
      <Typography color="error" textAlign="center" fontSize="0.85rem">
        Error: {error}
      </Typography>
    );

  if (forms.length === 0)
    return (
      <Typography textAlign="center" fontSize="0.85rem">
        No submitted forms found.
      </Typography>
    );

  return (
    <Box sx={{ width: "100%" }}>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        fontSize={20}
        gutterBottom
        textAlign="center"
        color="#002060"
      >
        Recent Predictions
      </Typography>

      {/* Color Legend */}
      <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#f6e9c6",
              borderRadius: "4px",
              mr: 0.5,
            }}
          />
          <Typography fontSize={12}>IPO</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              width: 16,
              height: 16,
              backgroundColor: "#e8f4fc",
              borderRadius: "4px",
              mr: 0.5,
            }}
          />
          <Typography fontSize={12}>FO</Typography>
        </Box>
      </Stack>

      <Grid container spacing={2}>
        {forms.map((form, i) => (
          <Grid item xs={12} key={i}>
            <Card
              onClick={() => handleCardClick(form)}
              sx={{
                cursor: "pointer",
                transition: "box-shadow 0.2s, transform 0.15s",
                "&:hover": { boxShadow: 4, transform: "translateY(-3px)" },
                borderRadius: 2,
                backgroundColor: getCardBackgroundColor(form.deal_type),
                minHeight: 180,
              }}
              variant="outlined"
            >
              <CardContent sx={{ py: 4, px: 4 }}>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Box>
                    <Typography
                      variant="body1"
                      fontWeight={600}
                      color="#002060"
                    >
                      {form.ticker}{" "}
                      <Box
                        component="span"
                        sx={{
                          fontWeight: 500,
                          ml: 1,
                          color:
                            form.deal_stats === "Announced"
                              ? "blue"
                              : form.deal_stats === "Issued"
                                ? "green"
                                : form.deal_stats === "Price Range"
                                  ? "orange"
                                  : "grey",
                        }}
                      >
                        {form.deal_stats || "N/A"}
                      </Box>
                    </Typography>
                  </Box>
                  {renderPredictionChip(form.t1d_pred)}
                </Box>

                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={1}
                  mb={1}
                >
                  <Typography variant="body1">{form.deal_type}</Typography>
                  <Typography variant="body1" color="#002060">
                    {formatDate(form.pricing_date)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Deal Size</Typography>
                  <Typography variant="body1">
                    ${form.deal_size ? form.deal_size.toFixed(1) : "N/A"}M
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Sector</Typography>
                  <Typography variant="body1">
                    {formatSector(form.sector)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1" color="#002060">
                    Discount:{" "}
                    <strong>
                      {form.discount_from_announcement_price !== null
                        ? `${form.discount_from_announcement_price}%`
                        : "N/A"}
                    </strong>
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Region</Typography>
                  <Typography variant="body1">{form.region}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="body1" color="#002060">
                    {form.lead_bank || "N/A"}
                  </Typography>
                  <Typography variant="body1" color="#002060">
                    {form.sponsor === "Y"
                      ? "Sponsored"
                      : form.sponsor === "N"
                        ? "Not Sponsored"
                        : "N/A"}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default RandomInfoPanel;

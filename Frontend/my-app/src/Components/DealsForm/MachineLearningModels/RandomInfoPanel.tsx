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
  Tooltip,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";

interface FormData {
  ticker_symbol: string;
  pricing_date: string;
  deal_type: string;
  region: string;
  target_variable: string;
  sponsor: string;
  deal_size_million: number;
  selected_bank: string;
  percentage_primary: number;
  sector: string;
  discount_announcement_price: number;
  allocation_percentage_of_deal: number;
  allocation_percentage_of_ioi: number;
  gdp_growth: string;
  inflation_rate: string;
  treasury_rates: string;
  v1_main_model_predicted: string;
  v1_positive_model_predicted: boolean;
  v1_negative_model_predicted: boolean;
  main_model_actual: string | null;
  positive_model_actual: string | null;
  negative_model_actual: string | null;
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

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/predicted_forms/`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP ${response.status}: ${text}`);
        }
        const json: ApiResponse = await response.json();
        const sorted = json.data.sort(
          (a, b) => new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime()
        );
        setForms(sorted.slice(0, 10)); // max 4 cards, i.e., 2 rows
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
    window.open("/equity/ml_equity");
  };

  const renderPredictionChip = (prediction: string) => {
    const color =
      prediction === "Positive"
        ? green[600]
        : prediction === "Negative"
        ? red[600]
        : grey[600];
    return (
      <Chip
        label={prediction.toUpperCase()}
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

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100px">
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
    <Box sx={{ width: "100%",}}>
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
                backgroundColor: "#e8f4fc",
                minHeight: 180,
              }}
              variant="outlined"
            >
              <CardContent sx={{ py: 4, px: 4 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="body1" fontWeight={600} color="#002060">
                    {form.ticker_symbol}
                  </Typography>
                  {renderPredictionChip(form.v1_main_model_predicted)}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={1}>
                  <Typography variant="body1" color="#002060">
                    Discount: <strong>{form.discount_announcement_price}%</strong>
                  </Typography>
                  <Typography variant="body1" color="#002060">
                    {formatDate(form.pricing_date)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1 }} />

                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Deal Size</Typography>
                  <Typography variant="body1">${form.deal_size_million}M</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Sector</Typography>
                  <Typography variant="body1">{formatSector(form.sector)}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Deal Type</Typography>
                  <Typography variant="body1">{form.deal_type}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body1">Region</Typography>
                  <Typography variant="body1">{form.region}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="body1" color="#002060">
                    {form.selected_bank}
                  </Typography>
                  <Typography variant="body1" color="#002060">
                    {form.sponsor === "Y" ? "Sponsored" : "Not Sponsored"}
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

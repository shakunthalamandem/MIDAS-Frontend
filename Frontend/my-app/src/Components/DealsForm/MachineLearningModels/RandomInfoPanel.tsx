import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Chip,
  Divider,
  Stack,
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
  main_model_predicted: string;
  positive_model_predicted: boolean;
  negative_model_predicted: boolean;
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
        setForms(sorted.slice(0, 3));
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
        label={prediction}
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

    <Box
      sx={{
        maxWidth: 900,
        marginX: "auto",
        paddingX: 2,
        paddingBottom: 3,
        position: "relative",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        fontSize={20}
        gutterBottom
        textAlign="center"
        color="#002060"
      >
        📝 Last Entered Prediction Details
      </Typography>

      <Stack spacing={2}>
        {forms.map((form, i) => (
          <Card
            key={i}
            onClick={() => handleCardClick(form)}
            sx={{
              width: "100%",
              cursor: "pointer",
              transition: "box-shadow 0.2s, transform 0.15s",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-3px)",
              },
              borderRadius: 2,
              backgroundColor: "#F8F3D9",
              minHeight: 180,
            }}
            variant="outlined"
          >
            <CardContent sx={{ py: 2, px: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                <Typography variant="body2" fontWeight={600} color="#002060">
                  {form.ticker_symbol}
                </Typography>
                {renderPredictionChip(form.main_model_predicted)}
              </Box>

              <Typography variant="caption" color="text.secondary">
                {form.pricing_date}
              </Typography>

              <Divider sx={{ my: 1 }} />

              <Stack spacing={0.5}>
                <Tooltip title="Deal Size (in million USD)">
                  <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                    💰 Deal Size :<strong>${form.deal_size_million}</strong>
                  </Typography>
                </Tooltip>
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  🏦 Selected Bank :<strong>{form.selected_bank}</strong>
                </Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  🎯Deal Type | Region :<strong>{form.deal_type}</strong> | {form.region}
                </Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  📊 Sector: <strong>{form.sector}</strong>
                </Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  📉 Discount: {form.discount_announcement_price}%
                </Typography>
                <Typography variant="caption" sx={{ lineHeight: 1.4 }}>
                  👔 Sponsor: {form.sponsor}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>

  );
};

export default RandomInfoPanel;

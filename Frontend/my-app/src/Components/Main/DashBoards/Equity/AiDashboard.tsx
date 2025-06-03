import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Box,
  Chip,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";

export interface PredictedForm {
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

const AiDashboard: React.FC = () => {
  const [data, setData] = useState<PredictedForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/predicted_forms/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
        const responseData = await response.json();
        setData(Array.isArray(responseData.data) ? responseData.data : []);
      } catch {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCardClick = (item: PredictedForm) => {
    sessionStorage.setItem("selected_form_data", JSON.stringify(item));
    sessionStorage.setItem("auto_predict", "true");
    window.open("/equity/ml_equity", "_blank");
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
        }}
      />
    );
  };

  if (loading)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );

  if (!data.length)
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <Typography>No data available.</Typography>
      </Box>
    );

  return (
    <Box>
      <Box mb={4}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📈 Today's Deal Activity Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          A snapshot of equity deals priced today with predictive insights from our AI models. 
          Click any card for a detailed breakdown and model rationale.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Real-time analysis and predictions for today's equity deals. Our AI models analyze market conditions, deal structures, and economic indicators to provide actionable insights for investment decisions.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {data.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
            <Card
              onClick={() => handleCardClick(item)}
              sx={{
                cursor: "pointer",
                transition: "box-shadow 0.3s",
                "&:hover": {
                  boxShadow: 6,
                },
                borderRadius: 3,
              }}
              variant="outlined"
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    {item.ticker_symbol}
                  </Typography>
                  {renderPredictionChip(item.main_model_predicted)}
                </Box>

                <Typography variant="caption" color="text.secondary">
                  {item.pricing_date}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={0.5}>
                  <Tooltip title="Deal Size (in million USD)">
                    <Typography variant="body2">
                      💰 <strong>${item.deal_size_million}</strong>
                    </Typography>
                  </Tooltip>
                  <Typography variant="body2">
                    🏦 <strong>{item.selected_bank}</strong>
                  </Typography>
                  <Typography variant="body2">
                    🎯 <strong>{item.deal_type}</strong> | {item.region}
                  </Typography>
                  <Typography variant="body2">
                    📊 Sector: <strong>{item.sector}</strong>
                  </Typography>
                  <Typography variant="body2">
                    📉 Discount: {item.discount_announcement_price}%
                  </Typography>
                  <Typography variant="body2">
                    👔 Sponsor: {item.sponsor}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AiDashboard;

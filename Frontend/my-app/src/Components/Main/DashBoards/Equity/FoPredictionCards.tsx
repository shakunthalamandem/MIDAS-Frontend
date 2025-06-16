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
} from "@mui/material";
import { green, red, grey } from "@mui/material/colors";
import MddFoDealsOpportunityChart from "./MddFoDealsOpportunityChart";

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
  v1_main_model_predicted: string;
  v1_positive_model_predicted: boolean;
  v1_negative_model_predicted: boolean;
  main_model_actual: string | null;
  positive_model_actual: string | null;
  negative_model_actual: string | null;
}

const FoPredictionCards: React.FC = () => {
  const [data, setData] = useState<PredictedForm[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const formatSector = (raw: string) => {
    const cleaned = raw.replace(/^(sp500_|nasdaq_|nyse_)/i, "");
    return cleaned
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (rawDate: string) => {
    const date = new Date(rawDate);
    const day = date.getDate();
    const daySuffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return `${day}${daySuffix} ${month} ${year}`;
  };

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
        label={prediction.toUpperCase()}
        size="small"
        sx={{
          backgroundColor: color,
          color: "white",
          fontWeight: "bold",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
        }}
      />
    );
  };

  const latestData = [...data]
    .sort((a, b) => new Date(b.pricing_date).getTime() - new Date(a.pricing_date).getTime())
    .slice(0, 4);

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
    <>
    <Box>
      <Box mb={4} mt={2}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          📊 Recent Follow-on's AI Powered Insights
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {latestData.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
            <Card
              onClick={() => handleCardClick(item)}
              sx={{
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
                "&:hover": { boxShadow: 8, transform: "translateY(-3px)" },
                borderRadius: 3,
                border: "1px solid #e0e0e0",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
              }}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    {item.ticker_symbol}
                  </Typography>
                  {renderPredictionChip(item.v1_main_model_predicted)}
                </Box>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1} mb={0.5}>
                  <Typography variant="body2" color="#002060">
                    Discount: <strong>{item.discount_announcement_price}%</strong>
                  </Typography>

                  <Typography variant="caption" color="#002060">
                    {formatDate(item.pricing_date)}
                  </Typography>
                </Box>


                <Divider sx={{ my: 1 }} />

                <Grid container spacing={0.5}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="#002060">
                      Deal Size
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight={500}>
                      ${item.deal_size_million}M
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="#002060">
                      Sector
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "visible",
                        textOverflow: "clip",
                        fontSize: "0.83rem",
                      }}
                    >
                      {formatSector(item.sector)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="#002060">
                      Deal Type
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2">{item.deal_type}</Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="body2" color="#002060">
                      Region
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2">{item.region}</Typography>
                  </Grid>
                </Grid>
              </CardContent>

              <Box display="flex" justifyContent="space-between" px={2} pb={1.5}>
                <Typography variant="caption" color="#002060">
                  🏦 {item.selected_bank}
                </Typography>
                <Typography variant="caption" color="#002060">
                  {item.sponsor === "Y" ? "Sponsored" : "Not Sponsored"}
                </Typography>

              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
    <MddFoDealsOpportunityChart />
    </>
  );
};

export default FoPredictionCards;

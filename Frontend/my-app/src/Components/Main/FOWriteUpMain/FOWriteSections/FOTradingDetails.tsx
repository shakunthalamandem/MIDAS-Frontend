import React from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

interface TradingDetails {
  current_share_price?: number;
  current_market_cap?: number;
  float_as_percent_shares_outstanding?: number;
  short_interest_as_percent_float?: number;
  volume_30day_average?: number;
  mean_target_price?: number;
  concensus_recomendations?: number;
  percentage_of_52_week_high?: number;
}

interface FOTradingDetailsProps {
  selectedData: TradingDetails;
}

// Config array for fields
const tradingFields: { label: string; key: keyof TradingDetails; suffix?: string }[] = [
  { label: "Current Share Price", key: "current_share_price", suffix: "$" },
  { label: "Market Cap(M)", key: "current_market_cap", suffix: "$" },
  { label: "Float (% Shares Outstanding)", key: "float_as_percent_shares_outstanding", suffix: "%" },
  { label: "Short Interest (% Float)", key: "short_interest_as_percent_float", suffix: "%" },
  { label: "Volume (30-day Avg)", key: "volume_30day_average" },
  { label: "Mean Target Price", key: "mean_target_price", suffix: "$" },
  { label: "Consensus Recommendations", key: "concensus_recomendations" },
  { label: "% of 52-Week High", key: "percentage_of_52_week_high", suffix: "%" },
];

// Format value like your FODealInformation
const formatTradingValue = (value: any, suffix?: string) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") {
    const formatted = value.toLocaleString();
    return suffix ? `${suffix === "$" ? "$" : ""}${formatted}${suffix === "%" ? "%" : ""}` : formatted;
  }
  return value;
};

const FOTradingDetails: React.FC<FOTradingDetailsProps> = ({ selectedData }) => {
  if (!selectedData || Object.keys(selectedData).length === 0) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(#f0f5ff)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                p: 2,
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 700, color: "#026269", mb: 3 }}
                  align="center"
                >
                  Trading Details
                </Typography>
                <Grid container spacing={3}>
                  {tradingFields.map((field, idx) => (
                    <Grid item xs={12} sm={3} key={field.key}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}
                          >
                            {field.label}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#333" }}>
                            {formatTradingValue(selectedData[field.key], field.suffix)}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FOTradingDetails;

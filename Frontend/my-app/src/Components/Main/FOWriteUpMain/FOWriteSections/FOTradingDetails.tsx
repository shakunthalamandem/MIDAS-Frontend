import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
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
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Accordion Wrapper */}
        <Accordion
          
          sx={{
            borderRadius: 3,
            background: "linear-gradient(#f0f5ff)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            id="trading-details-header"
            sx={{
            background: "linear-gradient(#f0f5ff)",
              borderBottom: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            <Typography
              variant="h6"
              align="center"
              sx={{
                color: "#026269",
                fontWeight: "bold",
                flex: 1,
              }}
            >
              Trading Details
            </Typography>
          </AccordionSummary>

          <AccordionDetails>
       
                {/* Flexbox Container for Items */}
                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={3}
                  justifyContent="space-between"
                >
                  {tradingFields.map((field, idx) => (
                    <motion.div
                      key={field.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      style={{
                        flex: "1 1 calc(50% - 12px)", // Two per row
                        minWidth: "250px",
                      }}
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
                  ))}
                </Box>

          </AccordionDetails>
        </Accordion>
      </motion.div>
    </Container>
  );
};

export default FOTradingDetails;

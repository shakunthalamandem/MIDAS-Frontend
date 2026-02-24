import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import ShowChartIcon from "@mui/icons-material/ShowChart";

import TradingSignalCard from "./TradingSignalCard";
import AIMLIntelligencePanel from "./AIMLIntelligencePanel";
import PriceChartsSection from "./PriceChartsSection";

const MotionBox = motion(Box);

interface Props {
  ticker: string;
  trade_date: string;
}

const TradingSignalsMain: React.FC<Props> = ({ ticker, trade_date }) => {
  return (
    <Box sx={{ maxWidth: "100%" }}>
      {/* Compact header bar */}
      <MotionBox
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          p: 2,
          mb: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              bgcolor: "#1E293B",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ShowChartIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />
          </Box>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 15, color: "#0F172A", lineHeight: 1.2 }}>
              Trading Dynamics
            </Typography>
            <Typography sx={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>
              AI signals, ML predictions, sentiment & price charts
            </Typography>
          </Box>
        </Box>
        <Chip
          label={ticker}
          size="small"
          sx={{
            bgcolor: "#F1F5F9",
            color: "#334155",
            fontWeight: 700,
            fontSize: 12,
            height: 26,
            border: "1px solid #E2E8F0",
          }}
        />
      </MotionBox>

      {/* Section 1: AI Trading Signal */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        sx={{ mb: 2.5 }}
      >
        <TradingSignalCard ticker={ticker} />
      </MotionBox>

      {/* Section 2: AI/ML Intelligence */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        sx={{ mb: 2.5 }}
      >
        <AIMLIntelligencePanel ticker={ticker} />
      </MotionBox>

      {/* Section 3: Price Charts */}
      <MotionBox
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
      >
        <PriceChartsSection ticker={ticker} trade_date={trade_date} />
      </MotionBox>
    </Box>
  );
};

export default TradingSignalsMain;

import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import InsightsIcon from "@mui/icons-material/Insights";

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
    <Box>
      {/* Hero Header */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        sx={{
          borderRadius: 4,
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          color: "#FFFFFF",
          p: 3,
          mb: 3,
          display: "flex",
          alignItems: "center",
          gap: 2,
          boxShadow: "0 16px 32px rgba(15, 23, 42, 0.20)",
        }}
      >
        <InsightsIcon sx={{ fontSize: 36, color: "#818CF8" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, letterSpacing: 0.5 }}>
            Trading Signals
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "rgba(255,255,255,0.70)", fontWeight: 500, mt: 0.25 }}
          >
            AI-powered intelligence, ML predictions, sentiment analysis & price
            charts for {ticker}
          </Typography>
        </Box>
      </MotionBox>

      {/* Section 1: AI Trading Signal */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        sx={{ mb: 3 }}
      >
        <TradingSignalCard ticker={ticker} />
      </MotionBox>

      {/* Section 2: AI/ML Intelligence */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        sx={{ mb: 3 }}
      >
        <AIMLIntelligencePanel ticker={ticker} />
      </MotionBox>

      {/* Section 3: Price Charts */}
      <MotionBox
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <PriceChartsSection ticker={ticker} trade_date={trade_date} />
      </MotionBox>
    </Box>
  );
};

export default TradingSignalsMain;

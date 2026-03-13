import React, { useRef, useCallback, useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import NewspaperIcon from "@mui/icons-material/Newspaper";

import IntelligenceSourcesBar from "./IntelligenceSourcesBar";
import TradingSignalCard from "./TradingSignalCard";
import AIMLIntelligencePanel from "./AIMLIntelligencePanel";
import PriceChartsSection from "./PriceChartsSection";
import type { SourceStatus } from "./types";

const MotionBox = motion(Box);

interface Props {
  ticker: string;
  trade_date: string;
  isUpcoming?: boolean;
  dealStatus?: string;
  issuerName?: string;
  expectedDate?: string;
}

const TradingSignalsMain: React.FC<Props> = ({
  ticker,
  trade_date,
  isUpcoming,
  dealStatus,
  issuerName,
  expectedDate,
}) => {
  const mlPredictionsRef = useRef<HTMLDivElement>(null);
  const aiModelRef = useRef<HTMLDivElement>(null);
  const aiSentimentRef = useRef<HTMLDivElement>(null);
  const priceChartsRef = useRef<HTMLDivElement>(null);

  const [sourceStatus, setSourceStatus] = useState<SourceStatus>({
    mlModel: false,
    aiModel: false,
    aiSentiment: false,
  });

  const [sourceDataPoints, setSourceDataPoints] = useState<
    Record<string, string>
  >({});

  const handleDataStatus = useCallback((status: SourceStatus) => {
    setSourceStatus(status);
  }, []);

  const handleDataPoints = useCallback(
    (points: Record<string, string>) => {
      setSourceDataPoints(points);
    },
    []
  );

  const [marketNewsOpen, setMarketNewsOpen] = useState(false);

  const handleSourceClick = useCallback((sectionId: string) => {
    if (sectionId === "market-news") {
      setMarketNewsOpen(true);
      return;
    }

    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      "ml-predictions": mlPredictionsRef,
      "ai-model": aiModelRef,
      "ai-sentiment": aiSentimentRef,
      "price-charts": priceChartsRef,
    };
    const el = refMap[sectionId]?.current;
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 240;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  }, []);

  return (
    <Box sx={{ maxWidth: "100%" }}>
      {/* Intelligence Sources */}
      <IntelligenceSourcesBar
        onSourceClick={handleSourceClick}
        sourceStatus={sourceStatus}
        isUpcoming={isUpcoming}
        sourceDataPoints={sourceDataPoints}
      />

      {/* Arrow from Synthesized Signal → Trading Signal Card */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 0.5,
        }}
      >
        <Box
          sx={{
            width: 2,
            height: 16,
            bgcolor: "#262268",
            opacity: 0.35,
            borderRadius: 1,
          }}
        />
        <Box
          sx={{
            width: 0,
            height: 0,
            borderLeft: "6px solid transparent",
            borderRight: "6px solid transparent",
            borderTop: "8px solid #262268",
            opacity: 0.5,
          }}
        />
      </Box>

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
        <AIMLIntelligencePanel
          ticker={ticker}
          mlPredictionsRef={mlPredictionsRef}
          aiModelRef={aiModelRef}
          aiSentimentRef={aiSentimentRef}
          onDataStatus={handleDataStatus}
          onDataPoints={handleDataPoints}
        />
      </MotionBox>

      {/* Section 3: Price Charts */}
      <MotionBox
        ref={priceChartsRef}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        sx={{ scrollMarginTop: "240px" }}
      >
        <PriceChartsSection
          ticker={ticker}
          trade_date={trade_date}
          isUpcoming={isUpcoming}
          dealStatus={dealStatus}
          issuerName={issuerName}
          expectedDate={expectedDate}
        />
      </MotionBox>

      {/* Market News Info Dialog */}
      <Dialog
        open={marketNewsOpen}
        onClose={() => setMarketNewsOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxWidth: 480,
            p: 1,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            pb: 1,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "#EEF2FF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <NewspaperIcon sx={{ fontSize: 22, color: "#262268" }} />
          </Box>
          <Typography sx={{ fontWeight: 800, fontSize: 17, color: "#0F172A" }}>
             News Agent Intelligence
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Box
            sx={{
              bgcolor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: 2,
              p: 2.5,
              mb: 1,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1.5,
              }}
            >
              <TravelExploreIcon sx={{ color: "#6366F1", fontSize: 20 }} />
              <Typography
                sx={{ fontWeight: 700, fontSize: 13.5, color: "#334155" }}
              >
                AI-Powered Web Search Agent
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#475569",
                fontSize: 13,
                lineHeight: 1.75,
                fontWeight: 500,
              }}
            >
              Our AI agent automatically searches and analyzes the latest market
              news, press releases, analyst reports, and financial articles from
              across the web. This real-time intelligence is factored into the
              final trading signal to ensure the recommendation reflects the most
              current market conditions and sentiment.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setMarketNewsOpen(false)}
            variant="contained"
            sx={{
              bgcolor: "#262268",
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 700,
              px: 4,
              "&:hover": { bgcolor: "#3A3790" },
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TradingSignalsMain;

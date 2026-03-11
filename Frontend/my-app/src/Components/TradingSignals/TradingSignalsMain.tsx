import React, { useRef, useCallback, useState } from "react";
import { Box } from "@mui/material";
import { motion } from "framer-motion";

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

  const handleSourceClick = useCallback((sectionId: string) => {
    const refMap: Record<string, React.RefObject<HTMLDivElement>> = {
      "ml-predictions": mlPredictionsRef,
      "ai-model": aiModelRef,
      "ai-sentiment": aiSentimentRef,
      "market-news": aiSentimentRef,
      "price-charts": priceChartsRef,
    };
    refMap[sectionId]?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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
        sx={{ scrollMarginTop: "120px" }}
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
    </Box>
  );
};

export default TradingSignalsMain;

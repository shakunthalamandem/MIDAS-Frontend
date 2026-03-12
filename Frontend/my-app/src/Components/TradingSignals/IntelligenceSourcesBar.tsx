import React, { useRef, useEffect, useState, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SentimentSatisfiedIcon from "@mui/icons-material/SentimentSatisfied";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import BoltIcon from "@mui/icons-material/Bolt";

import type { SourceStatus } from "./types";

const MotionBox = motion(Box);

const BLUE_PRIMARY = "#262268";
const BLUE_LIGHT = "#E8E8F5";

interface SourceCardConfig {
  id: string;
  label: string;
  activeStatus: string;
  pendingStatus: string;
  icon: React.ReactNode;
  statusKey: keyof SourceStatus | "priceAction";
}

const SOURCES: SourceCardConfig[] = [
  {
    id: "ml-predictions",
    label: "ML Model",
    activeStatus: "Active",
    pendingStatus: "Pending",
    icon: <PsychologyIcon sx={{ fontSize: 20 }} />,
    statusKey: "mlModel",
  },
  {
    id: "ai-model",
    label: "Prediction Agent",
    activeStatus: "Active",
    pendingStatus: "Pending",
    icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />,
    statusKey: "aiModel",
  },
  {
    id: "ai-sentiment",
    label: "Sentiment Agent",
    activeStatus: "Active",
    pendingStatus: "Pending",
    icon: <SentimentSatisfiedIcon sx={{ fontSize: 20 }} />,
    statusKey: "aiSentiment",
  },
  {
    id: "market-news",
    label: "Market News",
    activeStatus: "Analyzed",
    pendingStatus: "Pending",
    icon: <NewspaperIcon sx={{ fontSize: 20 }} />,
    statusKey: "aiSentiment",
  },
  {
    id: "price-charts",
    label: "Price Action",
    activeStatus: "Live Data",
    pendingStatus: "Pending",
    icon: <CandlestickChartIcon sx={{ fontSize: 20 }} />,
    statusKey: "priceAction",
  },
];

interface IntelligenceSourcesBarProps {
  onSourceClick: (sectionId: string) => void;
  sourceStatus?: SourceStatus;
  isUpcoming?: boolean;
  sourceDataPoints?: Record<string, string>;
}

const LINE_COLORS = ["#F59E0B", "#6366F1", "#3B82F6", "#10B981", "#EF4444"];

const DATA_POINT_KEYS: Record<string, string> = {
  "ml-predictions": "mlModel",
  "ai-model": "aiModel",
  "ai-sentiment": "aiSentiment",
  "market-news": "marketNews",
  "price-charts": "priceAction",
};

function getDataPointStyle(value: string): { color: string; bg: string } {
  const v = (value || "").toLowerCase();
  if (v.includes("up") || v.includes("bullish"))
    return { color: "#166534", bg: "#DCFCE7" };
  if (v.includes("down") || v.includes("bearish"))
    return { color: "#991B1B", bg: "#FEE2E2" };
  if (v.includes("neutral"))
    return { color: "#92400E", bg: "#FEF3C7" };
  return { color: "#64748B", bg: "#F1F5F9" };
}

const IntelligenceSourcesBar: React.FC<IntelligenceSourcesBarProps> = ({
  onSourceClick,
  sourceStatus,
  isUpcoming,
  sourceDataPoints,
}) => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const svgContainerRef = useRef<HTMLDivElement>(null);
  const [cardCenters, setCardCenters] = useState<number[]>([]);
  const [svgWidth, setSvgWidth] = useState(0);

  const updateLines = useCallback(() => {
    const svgEl = svgContainerRef.current;
    if (!svgEl) return;
    const svgRect = svgEl.getBoundingClientRect();
    setSvgWidth(svgRect.width);

    const centers = cardRefs.current.map((el) => {
      if (!el) return svgRect.width / 2;
      const rect = el.getBoundingClientRect();
      return rect.left + rect.width / 2 - svgRect.left;
    });
    setCardCenters(centers);
  }, []);

  useEffect(() => {
    const timer = setTimeout(updateLines, 350);
    window.addEventListener("resize", updateLines);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateLines);
    };
  }, [updateLines, sourceStatus]);

  const getIsActive = (source: SourceCardConfig): boolean => {
    if (!sourceStatus) return true;
    if (source.statusKey === "priceAction") return !isUpcoming;
    return sourceStatus[source.statusKey];
  };

  return (
    <MotionBox
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      sx={{
        borderRadius: 2,
        bgcolor: "#FFFFFF",
        border: "1px solid #E2E8F0",
        overflow: "hidden",
        mb: 2,
      }}
    >
      {/* Top gradient bar */}
      <Box
        sx={{
          height: 3,
          background: `linear-gradient(90deg, ${BLUE_PRIMARY}, #4A47A3, #6C69B3, #4A47A3, ${BLUE_PRIMARY})`,
        }}
      />

      {/* Header */}
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: 1,
              bgcolor: BLUE_PRIMARY,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BoltIcon sx={{ fontSize: 13, color: "#FFFFFF" }} />
          </Box>
          <Typography
            sx={{ fontWeight: 800, fontSize: 12.5, color: "#0F172A" }}
          >
            Intelligence Sources
          </Typography>
          <Typography
            sx={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}
          >
            Signal derived from multiple data sources
          </Typography>
        </Box>
      </Box>

      {/* Source Cards Row */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          gap: 1.5,
          px: 2,
          pt: 1.5,
          pb: 0.5,
          flexWrap: "wrap",
        }}
      >
        {SOURCES.map((source, idx) => {
          const isActive = getIsActive(source);
          return (
            <MotionBox
              key={source.id}
              ref={(el: HTMLDivElement | null) => {
                cardRefs.current[idx] = el;
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.04 }}
              onClick={isActive ? () => onSourceClick(source.id) : undefined}
              sx={{
                flex: "1 1 110px",
                maxWidth: 150,
                minWidth: 100,
                bgcolor: "#FFFFFF",
                border: "1px solid",
                borderColor: isActive ? "#E2E8F0" : "#F1F5F9",
                borderRadius: 2,
                p: 1.25,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                cursor: isActive ? "pointer" : "default",
                position: "relative",
                opacity: isActive ? 1 : 0.6,
                transition: "all 0.25s ease",
                ...(isActive && {
                  "&:hover": {
                    borderColor: BLUE_PRIMARY,
                    boxShadow: `0 4px 12px ${BLUE_PRIMARY}15`,
                    transform: "translateY(-1px)",
                  },
                }),
              }}
            >
              {/* Checkmark / Pending indicator */}
              {isActive ? (
                <CheckCircleIcon
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    fontSize: 13,
                    color: "#10B981",
                  }}
                />
              ) : (
                <RadioButtonUncheckedIcon
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 5,
                    fontSize: 13,
                    color: "#CBD5E1",
                  }}
                />
              )}

              {/* Icon */}
              <Box
                sx={{
                  width: 34,
                  height: 34,
                  borderRadius: 1.5,
                  bgcolor: isActive ? BLUE_LIGHT : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isActive ? BLUE_PRIMARY : "#94A3B8",
                }}
              >
                {source.icon}
              </Box>

              {/* Label */}
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: 11.5,
                  color: isActive ? "#0F172A" : "#94A3B8",
                  textAlign: "center",
                  lineHeight: 1.2,
                }}
              >
                {source.label}
              </Typography>

              {/* 1-Month Data Point */}
              {(() => {
                const key = DATA_POINT_KEYS[source.id];
                const val = key && sourceDataPoints?.[key];
                if (!val || val === "-") return null;
                const dpStyle = getDataPointStyle(val);
                return (
                  <Box
                    sx={{
                      mt: 0.25,
                      px: 0.75,
                      py: 0.2,
                      borderRadius: 1,
                      bgcolor: dpStyle.bg,
                      maxWidth: "100%",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 11,
                        fontWeight: 800,
                        color: dpStyle.color,
                        textAlign: "center",
                        lineHeight: 1.3,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      1M: {val}
                    </Typography>
                  </Box>
                );
              })()}
            </MotionBox>
          );
        })}
      </Box>

      {/* Curved connecting threads from each source to synthesized signal */}
      <Box
        ref={svgContainerRef}
        sx={{
          position: "relative",
          height: 50,
        }}
      >
        <svg
          width="100%"
          height="100%"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            overflow: "visible",
          }}
        >
          <defs>
            {LINE_COLORS.map((color, i) => (
              <linearGradient
                key={`grad-${i}`}
                id={`line-grad-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                <stop offset="100%" stopColor={BLUE_PRIMARY} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          {cardCenters.map((cx, i) => {
            const color = LINE_COLORS[i % LINE_COLORS.length];
            const midX = svgWidth / 2;
            const h = 50;
            const centerThreshold = 12;
            const curveOffset = Math.min(1, Math.max(12, svgWidth * 0.04));
            const isCenterCard = Math.abs(cx - midX) < centerThreshold;
            const startCtrlX = isCenterCard ? Math.max(0, cx - curveOffset) : cx;
            const endCtrlX = isCenterCard ? Math.max(0, midX - curveOffset) : midX;
            // Cubic bezier: start vertical from card, curve to center
            const d = `M ${cx},0 C ${startCtrlX},${h * 0.55} ${endCtrlX},${h * 0.45} ${midX},${h}`;
            return (
              <React.Fragment key={i}>
                <path
                  d={d}
                  stroke={`url(#line-grad-${i})`}
                  strokeWidth={2}
                  fill="none"
                  strokeOpacity={0.8}
                />
                <circle cx={cx} cy={0} r={3.5} fill={color} fillOpacity={0.9} />
              </React.Fragment>
            );
          })}
          {cardCenters.length > 0 && (
            <circle
              cx={svgWidth / 2}
              cy={50}
              r={5}
              fill={BLUE_PRIMARY}
              fillOpacity={0.8}
            />
          )}
        </svg>
      </Box>

      {/* SYNTHESIZED INTO FINAL SIGNAL banner */}
      <Box sx={{ px: 2, pb: 1.5, pt: 0 }}>
        <Box
          sx={{
            background: `linear-gradient(135deg, ${BLUE_PRIMARY} 0%, #3A3790 50%, ${BLUE_PRIMARY} 100%)`,
            borderRadius: 2,
            py: 1,
            px: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <BoltIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: 11.5,
              color: "#FFFFFF",
              letterSpacing: 1.2,
              textTransform: "uppercase",
            }}
          >
            Synthesized Into Final Signal
          </Typography>
          <BoltIcon sx={{ fontSize: 14, color: "#F59E0B" }} />
        </Box>
      </Box>
    </MotionBox>
  );
};

export default IntelligenceSourcesBar;

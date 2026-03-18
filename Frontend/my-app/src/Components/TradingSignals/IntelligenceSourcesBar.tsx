import React from "react";
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
    label: "AI Model",
    activeStatus: "Active",
    pendingStatus: "Pending",
    icon: <AutoAwesomeIcon sx={{ fontSize: 20 }} />,
    statusKey: "aiModel",
  },
  {
    id: "ai-sentiment",
    label: "AI Sentiment",
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
}

const IntelligenceSourcesBar: React.FC<IntelligenceSourcesBarProps> = ({
  onSourceClick,
  sourceStatus,
  isUpcoming,
}) => {
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

              {/* Status */}
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 10,
                  color: isActive ? BLUE_PRIMARY : "#CBD5E1",
                  textAlign: "center",
                }}
              >
                {isActive ? source.activeStatus : source.pendingStatus}
              </Typography>
            </MotionBox>
          );
        })}
      </Box>

      {/* Connecting lines visual */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: 0,
            height: 10,
            borderLeft: "1.5px dashed #CBD5E1",
          }}
        />
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

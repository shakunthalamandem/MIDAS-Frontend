import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Divider,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface HeatmapMetadataProps {
  updated_ist_time: string;
  updated_us_time: string;
  news_from_date: string;
  news_to_date: string;
  us_news_from_date: string;
  us_news_to_date: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }); // 30-Jul-2025
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }); // 10:36:26 AM
};

const HeatmapMetadata: React.FC<HeatmapMetadataProps> = ({
  updated_ist_time,
  updated_us_time,
  news_from_date,
  news_to_date,
  us_news_from_date,
  us_news_to_date,
}) => {
  return (
    <Accordion defaultExpanded={false} sx={{ mb: 2, background: "#f9f9f9" }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h6" fontWeight={600} color="#002060">
          📅 Heatmap Data Timing
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Divider sx={{ mb: 2 }} />
        <Box>
          <Typography variant="body1" gutterBottom>
            <strong>Updated IST:</strong> {formatDate(updated_ist_time)} at {formatTime(updated_ist_time)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Updated US:</strong> {formatDate(updated_us_time)} at {formatTime(updated_us_time)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>IST News Range:</strong><br />
            ➤ From: {formatDate(news_from_date)} at {formatTime(news_from_date)}<br />
            ➤ To: {formatDate(news_to_date)} at {formatTime(news_to_date)}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>US News Range:</strong><br />
            ➤ From: {formatDate(us_news_from_date)} at {formatTime(us_news_from_date)}<br />
            ➤ To: {formatDate(us_news_to_date)} at {formatTime(us_news_to_date)}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default HeatmapMetadata;

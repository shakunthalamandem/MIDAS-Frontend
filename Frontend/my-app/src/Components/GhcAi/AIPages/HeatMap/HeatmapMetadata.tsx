import React from "react";
import { Typography, Divider, Box } from "@mui/material";

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
  }); // e.g., 30-Jul-2025
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }); // e.g., 10:36:26 AM
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
<>
      <Typography variant="h5" fontWeight={600} color="#002060" gutterBottom>
         Heat Map of Portfolio Sentiment by Sector
      </Typography>
      <Typography variant="subtitle1" color="#000000" gutterBottom>
        Data updated on: {formatDate(updated_us_time)} 
        {/* at {formatTime(updated_us_time)} */}
      </Typography>
      <Typography variant="body1" sx={{ mb: 2, color: "#333" }}>
  This heatmap visualizes the <strong>real-time social media sentiment</strong> for various stocks in your portfolio. 
  Each cell represents a stock, color-coded based on sentiment strength.
  <br />
  ➤ <strong>Hover</strong> over any cell to view the stock ticker and  sentiment score.
  <br />
  ➤ <strong>Click</strong> on a stock to open our integrated <strong>GenAI  Tool</strong>, which will auto-search the stock and provide detailed insights and analysis.
</Typography>

      
</>
      

  );
};

export default HeatmapMetadata;

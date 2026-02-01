import React from "react";
import { Box, Card, CardContent, Chip, Typography } from "@mui/material";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";

type OutlookSummaryRowProps = {
  week: string;
  month: string;
  volatility: string;
  confidence: string;
};

const sentimentTone = (value?: string) => {
  const text = (value || "").toLowerCase();
  if (text.includes("bull")) return { label: value || "Bullish", bg: "#DCFCE7", color: "#047857" };
  if (text.includes("bear")) return { label: value || "Bearish", bg: "#FFE4E6", color: "#BE123C" };
  if (text.includes("neutral") || text.includes("cautious"))
    return { label: value || "Neutral", bg: "#E5E7EB", color: "#334155" };
  return { label: value || "-", bg: "#E2E8F0", color: "#0F172A" };
};

const OutlookSummaryRow: React.FC<OutlookSummaryRowProps> = ({ week, month, volatility, confidence }) => {
  const cards = [
    { label: "1-Week Sentiment", value: week, isSentiment: true, icon: <TrendingUpRoundedIcon sx={{ fontSize: 16 }} /> },
    { label: "1-Month Sentiment", value: month, isSentiment: true },
    { label: "Expected Volatility", value: volatility, isSentiment: false },
    { label: "Confidence", value: confidence, isSentiment: false },
  ];

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "#5D0163", textAlign: "center" }}
      >
        Outlook Summary
      </Typography>
      <Box
        sx={{
          mt: 1.5,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
        }}
      >
        {cards.map(({ label, value, isSentiment, icon }) => {
          const tone = sentimentTone(value);
          const isVol = label.toLowerCase().includes("volatility");
          return (
            <Card
              key={label}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: "grey.200",
                background: "#FFFFFF",
                boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
                overflow: "hidden",
                height: "100%",
                minHeight: 120,
              }}
            >
              <Box sx={{ height: 6, bgcolor: "#F1F5F9" }} />
              <CardContent
                sx={{
                  p: 2.25,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 1,
                }}
              >
                <Typography variant="h6" sx={{ color: "#002060", textAlign: "center" }}>
                  {label}
                </Typography>
                {isSentiment ? (
                  <Chip
                    icon={icon || undefined}
                    label={tone.label}
                    size="small"
                    sx={{
                      height: 32,
                      px: 1.75,
                      bgcolor: tone.bg,
                      color: tone.color,
                      borderRadius: 2,
                      border: "1px solid rgba(0,0,0,0.04)",
                      fontWeight: 700,
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: 32,
                      px: 1.75,
                      borderRadius: 2,
                      bgcolor: isVol ? "#E0F2FE" : "#FEF9C3",
                      color: isVol ? "#075985" : "#854D0E",
                      fontWeight: 700,
                      minWidth: "fit-content",
                    }}
                  >
                    {value || "-"}
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default OutlookSummaryRow;

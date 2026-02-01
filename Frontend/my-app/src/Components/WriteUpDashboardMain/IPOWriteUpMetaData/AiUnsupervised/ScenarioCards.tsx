import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import ActivityIcon from "@mui/icons-material/ShowChartRounded";
import AlertTriangleIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";

type ScenarioCardsProps = {
  base?: string;
  bullish?: string;
  bearish?: string;
};

const ScenarioCards: React.FC<ScenarioCardsProps> = ({ base, bullish, bearish }) => {
  const cards = [
    {
      title: "Bullish Scenario",
      body: bullish,
      tone: "bullish" as const,
      icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
    },
    {
      title: "Base Case",
      body: base,
      tone: "base" as const,
      icon: <ActivityIcon sx={{ fontSize: 18 }} />,
    },
    {
      title: "Bearish Scenario",
      body: bearish,
      tone: "bearish" as const,
      icon: <AlertTriangleIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const toneStyle = (tone: "base" | "bullish" | "bearish") => {
    if (tone === "bullish")
      return { bg: "#F0FFF6", border: "#DCFCE7", iconBg: "#DCFCE7", iconColor: "#059669" };
    if (tone === "bearish")
      return { bg: "#FFF5F7", border: "#FFE4E8", iconBg: "#FFE4E8", iconColor: "#E11D48" };
    return { bg: "#F8FAFF", border: "#EEF2FF", iconBg: "#EEF2FF", iconColor: "#4F46E5" };
  };

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: "#1d2b5a", textAlign: "center" }}
      >
        Scenario Analysis
      </Typography>
      <Box
        sx={{
          mt: 1.5,
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "repeat(3, 1fr)" },
        }}
      >
        {cards.map(({ title, body, tone, icon }) => {
          const toneDef = toneStyle(tone);
          return (
            <Card
              key={title}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor: toneDef.border,
                background: toneDef.bg,
                boxShadow: "0 10px 26px rgba(0,0,0,0.05)",
                overflow: "hidden",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: toneDef.iconBg,
                      color: toneDef.iconColor,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "#1d2b5a" }}>
                    {title}
                  </Typography>
                </Box>
                <Typography
                  component="div"
                  variant="body2"
                  sx={{ mt: 1.5, color: "#141414", lineHeight: 1.8, whiteSpace: "pre-line" }}
                >
                  {body || "-"}
                </Typography>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};

export default ScenarioCards;

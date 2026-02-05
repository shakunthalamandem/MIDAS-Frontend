import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";

type NoDataNoticeProps = {
  title?: string;
  subtitle?: string;
};

const NoDataNotice: React.FC<NoDataNoticeProps> = ({
  title = "No data yet",
  subtitle = "There is no data for this ticker. We will update soon.",
}) => (
  <Card
    elevation={0}
    className="pdf-hidden"
    sx={{
      width: "100%",
      maxWidth: "100%",
      borderRadius: 4,
      border: "1px solid #dbe3f0",
      background: "linear-gradient(180deg, #ffffff 0%, #f4f7ff 100%)",
      boxShadow: "0 12px 24px rgba(15, 23, 42, 0.08)",
      overflow: "hidden",
    }}
  >
    <Box sx={{ height: 6, bgcolor: "#e0e7ff" }} />
    <CardContent sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1.5,
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            bgcolor: "#eef2ff",
            color: "#4f46e5",
            boxShadow: "inset 0 0 0 1px rgba(79, 70, 229, 0.1)",
          }}
        >
          <HourglassEmptyRoundedIcon fontSize="large" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0f172a" }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "#475569", maxWidth: 520 }}>
          {subtitle}
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default NoDataNotice;

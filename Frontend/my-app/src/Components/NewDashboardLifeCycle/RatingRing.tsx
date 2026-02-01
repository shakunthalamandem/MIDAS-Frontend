import React from "react";
import { Box, Card, CardContent, Stack, Typography, CircularProgress } from "@mui/material";

function clamp0to100(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function RatingRing({
  title = "Overall Rating",
  value,
  size = 120,
  thickness = 7,
}: {
  title?: string;
  value: number; // out of 100
  size?: number;
  thickness?: number;
}) {
  const v = clamp0to100(value);

  return (
    // <Card variant="outlined">
      <CardContent >
        <Stack alignItems="center" spacing={1.25}>
          <Box sx={{ position: "relative", display: "inline-flex" }}>
            {/* Track (background ring) */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={size}
              thickness={thickness}
              sx={{ color: "grey.300" }}
            />

            {/* Progress (foreground ring) */}
            <CircularProgress
              variant="determinate"
              value={v}
              size={size}
              thickness={thickness}
              sx={{
                position: "absolute",
                left: 0,
                top: 0,
                // rotate so it starts at 12 o'clock like your screenshot
                transform: "rotate(-90deg)",
                color: "primary.main",
              }}
            />

            {/* Center text */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h6" fontWeight={900}>
                {v}/100
              </Typography>
            </Box>
          </Box>

          <Typography variant="body2" fontWeight={800} color="primary.main">
            {title} ({v}%)
          </Typography>
        </Stack>
      </CardContent>
    // </Card>
  );
}

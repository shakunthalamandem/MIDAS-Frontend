import React from "react";
import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";

function MetricTile({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7ef",
        background: "#eceff5",
        boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
        p: 2.25,
        minHeight: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
      }}
    >
      <Typography variant="subtitle2" sx={{ fontSize: "1rem", fontWeight: 700, color: "#1d2b5a" }}>
        {label}
      </Typography>
      <Typography variant="body1" sx={{ mt: 1, fontWeight: 600, color: "#111827" }}>
        {value ?? "-"}
      </Typography>
    </Box>
  );
}

export default function DealTopMetrics({
  fairValue,
  indicationOfInterest,
  afterMarketThreshold,
}: {
  fairValue: string;
  indicationOfInterest: string;
  afterMarketThreshold: string;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        background: "#f7f9ff",
        boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)"
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#121f44" }}>
            Key Deal Metrics
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <MetricTile label="Fair Value Estimate" value={fairValue} />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricTile label="Indication of Interest" value={indicationOfInterest} />
            </Grid>
            <Grid item xs={12} md={4}>
              <MetricTile label="After Market Threshold" value={afterMarketThreshold} />
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

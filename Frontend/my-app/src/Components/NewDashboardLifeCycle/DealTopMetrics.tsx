import React from "react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";

function MetricTile({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1}>
          <Typography variant="caption" color="#000000" fontWeight={600}>
            {label}
          </Typography>
          <Typography variant="h6" fontWeight={800}>
            {value ?? "-"}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
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
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={800}>
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

import React from "react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";

export default function DealAMStrategy({
  recommendation,
  potentialQty,
}: {
  recommendation: string;
  potentialQty: number | null;
}) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="subtitle1" fontWeight={800}>
            After Market (AM) Strategy
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <Card variant="outlined" sx={{ bgcolor: "grey.50", height: "100%" }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    AM Strategy Recommendation
                  </Typography>
                  <Typography sx={{ mt: 1, whiteSpace: "pre-line", lineHeight: 1.7 }}>
                    {recommendation || "-"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={3}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    Potential AM Quantity
                  </Typography>
                  <Typography variant="h5" fontWeight={900} sx={{ mt: 1 }}>
                    {potentialQty ?? "-"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    As per API output
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Stack>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, Divider, Grid, Stack, Typography } from "@mui/material";
import type { DealRecommendationResponse } from "./DealRecomendation";

import { RatingRing } from "./RatingRing";
import {
  AIMLPredictions,
  DealMomentum,
  MarketSentiment,
  OutlookSummary,
  OverallAISummary,
  SectionCard,
} from "./DealSecondRowParts";

export default function DealSecondRow({ data }: { data: DealRecommendationResponse }) {
  return (
    <Card variant="outlined" sx={{ bgcolor: "background.default" }}>
      <CardContent>
        <Grid container spacing={2}>
          {/* LEFT */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <SectionCard title="Valuation">
                <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
                  {data.valuation || "-"}
                </Typography>
              </SectionCard>

              <DealMomentum data={data} />

              {/* ✅ BELOW DEAL MOMENTUM */}
              <RatingRing title="Overall Rating" value={data.writeup_overall_rating} />
            </Stack>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <AIMLPredictions data={data} />

              <OutlookSummary data={data} />

              <MarketSentiment oneWeek={data.one_week_sentiment} oneMonth={data.one_month_sentiment} />

              <Divider />

              <OverallAISummary
                t1d={data.t1d_overall_prediction}
                t1w={data.t1w_overall_prediction}
                t1m={data.t1m_overall_prediction}
              />

              {/* ✅ BELOW OVERALL AI SUMMARY */}
              <RatingRing title="Overall Rating" value={data.ai_ml_overall_rating} />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

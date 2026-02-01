import React, { useMemo, useState } from "react";
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

function ReadMoreText({
  text,
  clampLines = 6,
}: {
  text: string;
  clampLines?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const showToggle = useMemo(() => (text || "").length > 260, [text]);

  if (!text) {
    return (
      <Typography variant="body2" sx={{ whiteSpace: "pre-line", lineHeight: 1.7 }}>
        -
      </Typography>
    );
  }

  return (
    <Stack spacing={1}>
      <Typography
        variant="body2"
        sx={{
          whiteSpace: "pre-line",
          lineHeight: 1.7,
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : clampLines,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {text}
      </Typography>
      {showToggle ? (
        <Typography
          role="button"
          onClick={() => setExpanded((prev) => !prev)}
          sx={{
            alignSelf: "flex-start",
            cursor: "pointer",
            fontWeight: 700,
            color: "#1f3b73",
          }}
        >
          {expanded ? "Show less" : "Read more"}
        </Typography>
      ) : null}
    </Stack>
  );
}

export default function DealSecondRow({ data }: { data: DealRecommendationResponse }) {
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
        <Grid container spacing={2}>
          {/* LEFT */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <SectionCard title="Valuation">
                <ReadMoreText text={data.valuation || ""} />
              </SectionCard>

              <DealMomentum data={data} />
              <MarketSentiment oneWeek={data.one_week_sentiment} oneMonth={data.one_month_sentiment} />
            </Stack>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <AIMLPredictions data={data} />

              <OutlookSummary data={data} />
              
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
      {/* ✅ BELOW OVERALL AI SUMMARY */}
      {/* <RatingRing title="Overall Rating" value={data.writeup_overall_rating} /> */}

    </Card>
  );
}

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { DealRecommendationResponse } from "./DealRecomendation";

function formatPct(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return `${n.toFixed(1)}%`;
}
function formatNum(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toFixed(2);
}

type Tone = "success" | "warning" | "default" | "info";

function toneFromText(text: string): Tone {
  const t = (text || "").toLowerCase();
  if (t.includes("positive") || t.includes("bull") || t.includes("up")) return "success";
  if (t.includes("low") || t.includes("negative") || t.includes("bear")) return "warning";
  if (t.includes("high")) return "info";
  return "default";
}

function SentimentChip({ text }: { text: string }) {
  const tone = toneFromText(text);
  const color =
    tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "info" ? "info" : "default";

  return <Chip size="small" label={text || "-"} color={color as any} variant={color === "default" ? "outlined" : "filled"} />;
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={800}>
            {title}
          </Typography>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PredictionTile({
  title,
  pred,
  confidence,
}: {
  title: string;
  pred: string;
  confidence: number;
}) {
  const tone = toneFromText(pred);
  const color =
    tone === "success" ? "success" : tone === "warning" ? "warning" : tone === "info" ? "info" : "inherit";

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Stack spacing={1.25}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>
            {title}
          </Typography>

          <Chip
            size="small"
            label={(pred || "NEUTRAL").toUpperCase()}
            color={color as any}
            variant={tone === "default" ? "outlined" : "filled"}
            sx={{ alignSelf: "flex-start" }}
          />

          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, Math.min(100, confidence || 0))}
              sx={{ height: 8, borderRadius: 99 }}
              color={tone === "success" ? "success" : tone === "warning" ? "warning" : "inherit"}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.75, display: "block" }}>
              Prob. <Typography component="span" variant="caption" fontWeight={800} color="text.primary">{formatPct(confidence)}</Typography>
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function DealMomentum({ data }: { data: DealRecommendationResponse }) {
  return (
    <SectionCard title="Deal Momentum (Avg Price)">
      <Typography variant="body2" color="text.secondary">
        Last 5 vs last 10 deals across 1D / 1W / 1M windows
      </Typography>

      <TableContainer component={Card} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Window</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Last 5 Deals</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Last 10 Deals</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>1st Day</TableCell>
              <TableCell>{formatNum(data.last_5_t1d_avg_price)}</TableCell>
              <TableCell>{formatNum(data.last_10_t1d_avg_price)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>1st Week</TableCell>
              <TableCell>{formatNum(data.last_5_t1w_avg_price)}</TableCell>
              <TableCell>{formatNum(data.last_10_t1w_avg_price)}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>1st Month</TableCell>
              <TableCell>{formatNum(data.last_5_t1m_avg_price)}</TableCell>
              <TableCell>{formatNum(data.last_10_t1m_avg_price)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}

function OutlookSummary({ data }: { data: DealRecommendationResponse }) {
  return (
    <SectionCard title="Outlook Summary">
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  1-Week Sentiment
                </Typography>
                <SentimentChip text={data.fs_1w_sentiment} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  1-Month Sentiment
                </Typography>
                <SentimentChip text={data.fs_1m_sentiment} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  Expected Volatility
                </Typography>
                <SentimentChip text={data.fs_expected_volatility} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" fontWeight={700} color="text.secondary">
                  Confidence
                </Typography>
                <SentimentChip text={data.fs_confidence_level} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

function MarketSentiment({ oneWeek, oneMonth }: { oneWeek: string; oneMonth: string }) {
  return (
    <SectionCard title="Market Sentiment">
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Chip label={`One Week: ${oneWeek || "-"}`} variant="outlined" />
        <Chip label={`One Month: ${oneMonth || "-"}`} variant="outlined" />
      </Stack>
    </SectionCard>
  );
}

function OverallAISummary({
  t1d,
  t1w,
  t1m,
}: {
  t1d: string;
  t1w: string;
  t1m: string;
}) {
  return (
    <SectionCard title="Overall AI Summary">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                T+1 Day
              </Typography>
              <Typography sx={{ mt: 1 }} fontWeight={800}>
                {t1d || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                T+1 Week
              </Typography>
              <Typography sx={{ mt: 1 }} fontWeight={800}>
                {t1w || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                T+1 Month
              </Typography>
              <Typography sx={{ mt: 1 }} fontWeight={800}>
                {t1m || "-"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

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
            </Stack>
          </Grid>

          {/* RIGHT */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={2}>
              <SectionCard title="AI/ML Predictions">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <PredictionTile title="T+1 Day" pred={data.t1d_pred} confidence={data.t1d_confidence} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PredictionTile title="T+1 Week" pred={data.t1w_pred} confidence={data.t1w_confidence} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <PredictionTile title="T+1 Month" pred={data.t1m_pred} confidence={data.t1m_confidence} />
                  </Grid>
                </Grid>
              </SectionCard>

              <OutlookSummary data={data} />

              <MarketSentiment oneWeek={data.one_week_sentiment} oneMonth={data.one_month_sentiment} />

              <Divider />

              <OverallAISummary
                t1d={data.t1d_overall_prediction}
                t1w={data.t1w_overall_prediction}
                t1m={data.t1m_overall_prediction}
              />
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

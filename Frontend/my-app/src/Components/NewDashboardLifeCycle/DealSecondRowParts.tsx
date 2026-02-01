import React from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
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

export function formatPct(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return `${n.toFixed(1)}%`;
}
export function formatNum(n: number) {
  if (typeof n !== "number" || Number.isNaN(n)) return "-";
  return n.toFixed(2);
}

type Tone = "success" | "warning" | "default" | "info";

function toneFromText(text: string): Tone {
  const t = (text || "").toLowerCase();
  if (t.includes("positive") || t.includes("bull") || t.includes("up"))
    return "success";
  if (t.includes("low") || t.includes("negative") || t.includes("bear"))
    return "warning";
  if (t.includes("high")) return "info";
  return "default";
}

function SentimentChip({ text }: { text: string }) {
  const tone = toneFromText(text);

  const color =
    tone === "success"
      ? "success"
      : tone === "warning"
        ? "warning"
        : tone === "info"
          ? "info"
          : "default";

  return (
    <Chip
      label={text || "-"}
      color={color as any}
      variant={color === "default" ? "outlined" : "filled"}
      sx={{
        height: "auto", // allow chip to grow vertically
        "& .MuiChip-label": {
          display: "block",
          whiteSpace: "normal", // ✅ wrap text
          wordBreak: "break-word", // break long words
          paddingTop: "6px",
          paddingBottom: "6px",
          textAlign: "center",
        },
      }}
    />
  );
}

export function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        background: "#f7f9ff",
        boxShadow: "0 10px 20px rgba(32, 70, 150, 0.08)",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
        <Stack spacing={1.5}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#121f44" }} align="center">
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
    tone === "success"
      ? "success"
      : tone === "warning"
        ? "warning"
        : tone === "info"
          ? "info"
          : "inherit";

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7ef",
        background: "#eceff5",
        boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
        p: 2.25,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack spacing={1.25}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
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
            color={
              tone === "success"
                ? "success"
                : tone === "warning"
                  ? "warning"
                  : "inherit"
            }
          />
          <Typography
            variant="caption"
            color="#000000"
            sx={{ mt: 0.75, display: "block" }}
          >
            Prob.{" "}
            <Typography
              component="span"
              variant="caption"
              fontWeight={800}
              color="text.primary"
            >
              {formatPct(confidence)}
            </Typography>
          </Typography>
        </Box>
      </Stack>
    </Box>
  );
}

export function DealMomentum({ data }: { data: DealRecommendationResponse }) {
  return (
    <SectionCard title="Deal Momentum (Avg Price)">
      <Typography variant="body2" color="#000000">
        Average price performance of recent deals in similar sectors/industries
      </Typography>

      <TableContainer
        component={Card}
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid #e5e7ef",
          background: "#ffffff",
          boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
        }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 800 }}>Deals</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>1st Day</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>1st Week</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>1st Month</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Last 5 Deals</TableCell>
              <TableCell>{formatNum(data.last_5_t1d_avg_price)}%</TableCell>
              <TableCell>{formatNum(data.last_5_t1w_avg_price)}%</TableCell>
              <TableCell>{formatNum(data.last_5_t1m_avg_price)}%</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Last 10 Deals</TableCell>
              <TableCell>{formatNum(data.last_10_t1d_avg_price)}%</TableCell>
              <TableCell>{formatNum(data.last_10_t1w_avg_price)}%</TableCell>
              <TableCell>{formatNum(data.last_10_t1m_avg_price)}%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </SectionCard>
  );
}

export function OutlookSummary({ data }: { data: DealRecommendationResponse }) {
  return (
    <SectionCard title="AI Unsupervised Summary">
      <Grid container spacing={1} sx={{ pb: 0.5 }}>
        <Grid item xs={12} md={3}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#f7f9ff",
              boxShadow: "0 6px 14px rgba(32, 70, 150, 0.08)",
              p: 2,
              height: "70%",
              textAlign: "center",
              
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={700} color="#111827">
                1-Week
              </Typography>
              <SentimentChip text={data.fs_1w_sentiment} />
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#f7f9ff",
              boxShadow: "0 6px 14px rgba(32, 70, 150, 0.08)",
              p: 2,
              height: "70%",
              textAlign: "center",
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={700} color="#111827">
                1-Month
              </Typography>
              <SentimentChip text={data.fs_1m_sentiment} />
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#f7f9ff",
              boxShadow: "0 6px 14px rgba(32, 70, 150, 0.08)",
              p: 2,
              height: "70%",
              textAlign: "center",
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={700} color="#111827">
                Expected Volatility
              </Typography>
              <SentimentChip text={data.fs_expected_volatility} />
            </Stack>
          </Box>
        </Grid>

        <Grid item xs={12} md={3}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#f7f9ff",
              boxShadow: "0 6px 14px rgba(32, 70, 150, 0.08)",
              p: 2,
              height: "70%",
              textAlign: "center",
            }}
          >
            <Stack spacing={1} alignItems="center">
              <Typography variant="body2" fontWeight={700} color="#111827">
                Confidence
              </Typography>
              <SentimentChip text={data.fs_confidence_level} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

export function MarketSentiment({
  oneWeek,
  oneMonth,
}: {
  oneWeek: string;
  oneMonth: string;
}) {
  return (
    <SectionCard title="Social Media Buzz (Public Sentiment)">
      <Grid container spacing={1} sx={{ pb: 0.5 }}>
        <Grid item xs={4} >
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
              height: "70%",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={700} color="#000000">
                First Week
              </Typography>
              <SentimentChip text={oneWeek} />
            </Stack>
          </Box>
        </Grid>
        <Grid item xs={4} >
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
              height: "70%",
            }}
          >
            <Stack spacing={1}>
              <Typography variant="body2" fontWeight={700} color="#000000">
                First Month
              </Typography>
              <SentimentChip text={oneMonth} />
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

export function OverallAISummary({
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
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
              T+1 Day
            </Typography>
            <Typography sx={{ mt: 1, fontWeight: 700, color: "#111827" }}>
              {t1d || "-"}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
              T+1 Week
            </Typography>
            <Typography sx={{ mt: 1, fontWeight: 700, color: "#111827" }}>
              {t1w || "-"}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              borderRadius: 2,
              border: "1px solid #e5e7ef",
              background: "#eceff5",
              boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
              p: 2,
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
              T+1 Month
            </Typography>
            <Typography sx={{ mt: 1, fontWeight: 700, color: "#111827" }}>
              {t1m || "-"}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </SectionCard>
  );
}

export function AIMLPredictions({
  data,
}: {
  data: DealRecommendationResponse;
}) {
  return (
    <SectionCard title="AI-ML Predictions">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <PredictionTile
            title="T+1 Day"
            pred={data.t1d_pred}
            confidence={data.t1d_confidence}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PredictionTile
            title="T+1 Week"
            pred={data.t1w_pred}
            confidence={data.t1w_confidence}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <PredictionTile
            title="T+1 Month"
            pred={data.t1m_pred}
            confidence={data.t1m_confidence}
          />
        </Grid>
      </Grid>
    </SectionCard>
  );
}

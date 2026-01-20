// src/components/DealDetailsPanel.tsx
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Grid,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PredictionCell, { ActualCell } from "./PredictionCell";
import DealDetailsHeader from "./DealDetailsHeader";
import type { DealRecord } from "./types";
import DealNewsPanel from "./DealNewsPanel";

interface AIInsightBlockProps {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
}

const AIInsightBlock: React.FC<AIInsightBlockProps> = ({
  title,
  value,
  subtitle,
}) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      borderRadius: 1.5,
      border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
      background:
        theme.palette.mode === "light"
          ? alpha(theme.palette.info.main, 0.035)
          : alpha(theme.palette.info.main, 0.15),
      px: 1.25,
      py: 0.75, // ⬅️ reduced vertical padding
      height: "100%",
    })}
  >
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.3, // ⬅️ tighter spacing
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: 0.4,
          textTransform: "uppercase",
          color: "text.secondary",
        }}
      >
        {title}
      </Typography>

      {subtitle && (
        <Typography
          variant="caption"
          sx={{ fontSize: 11, color: "text.secondary" }}
        >
          {subtitle}
        </Typography>
      )}

      <Typography
        variant="body1" // ⬅️ smaller than h6
        sx={{
          fontWeight: 700,
          textAlign: "center",
          mt: 0.25,
        }}
      >
        {value || "—"}
      </Typography>
    </Box>
  </Paper>
);

const formatNumber = (
  value: number | string | null | undefined,
  options?: { suffix?: string; decimals?: number }
): string => {
  const { suffix = "", decimals = 2 } = options || {};
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return String(value);

  const base =
    Math.abs(num) >= 1000
      ? num.toLocaleString(undefined, { maximumFractionDigits: decimals })
      : num.toFixed(decimals).replace(/\.00$/, "");
  return suffix ? `${base}${suffix}` : base;
};

const DetailRow: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "baseline",
      gap: 1.5,
      py: 0.35,
    }}
  >
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 0.4 }}
    >
      {label}
    </Typography>
    <Typography
      variant="body2"
      sx={{
        fontWeight: 500,
        textAlign: "right",
        wordBreak: "break-word",
      }}
    >
      {value || "—"}
    </Typography>
  </Box>
);

interface SectionCardProps {
  title: string;
  accent?: "primary" | "info" | "success" | "warning";
  children: React.ReactNode;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  accent = "primary",
  children,
}) => (
  <Paper
    elevation={0}
    sx={(theme) => {
      const color = theme.palette[accent].main;
      return {
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
        background:
          theme.palette.mode === "light"
            ? `linear-gradient(145deg, ${alpha(
                color,
                0.04
              )}, ${theme.palette.background.paper})`
            : theme.palette.background.paper,
        overflow: "hidden",
        height: "100%",
      };
    }}
  >
    <Box
      sx={(theme) => ({
        px: 1.5,
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette[accent].main, 0.06),
      })}
    >
      <Typography
        variant="subtitle2"
        sx={{
          textTransform: "uppercase",
          letterSpacing: 0.7,
          fontSize: 11,
          fontWeight: 700,
          color: "text.secondary",
        }}
      >
        {title}
      </Typography>
    </Box>
    <Box sx={{ px: 1.5, py: 1.25 }}>{children}</Box>
  </Paper>
);

interface PredictionBlockProps {
  title: string;
  subtitle?: string;
  pred: string;
  confidence: number | string;
  actual: number | string;
  tone?: "primary" | "info" | "success" | "warning";
}

const PredictionBlock: React.FC<PredictionBlockProps> = ({
  title,
  pred,
  confidence,
  actual,
  tone = "primary",
}) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      borderRadius: 1.5,
      border: `1px solid ${alpha(theme.palette[tone].main, 0.35)}`,
      background:
        theme.palette.mode === "light"
          ? alpha(theme.palette[tone].main, 0.035)
          : alpha(theme.palette[tone].main, 0.15),
      px: 1.25,
      py: 1, // ✅ smaller than before
      height: "100%",
    })}
  >
    {/* Title */}
    <Box sx={{ mb: 0.6 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.2 }}
      >
        {title}
      </Typography>
    </Box>

    {/* Prediction */}
    <Box sx={{ mb: 0.75 }}>
      <Box mt={0.25}>
        <PredictionCell pred={pred} confidence={confidence} />
      </Box>
    </Box>

    {/* Actual inline right */}
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
        pt: 0.6,
        borderTop: (theme) => `1px solid ${alpha(theme.palette.divider, 0.8)}`,
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 600, letterSpacing: 0.2 }}
      >
        Actual return
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "flex-end", minWidth: 80 }}>
        <ActualCell value={actual} />
      </Box>
    </Box>
  </Paper>
);

const DealDetailsPanel: React.FC<{ deal: DealRecord | null }> = ({ deal }) => {
  if (!deal) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Deal details
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Select a row in the table to view full deal analytics here.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
      {/* HEADER */}
      <Box
        sx={(theme) => ({
          px: 2,
          pt: 1.5,
          pb: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor:
            theme.palette.mode === "light"
              ? theme.palette.grey[50]
              : theme.palette.background.default,
        })}
      >
        <DealDetailsHeader deal={deal} />
      </Box>

      <CardContent sx={{ pt: 2.5 }}>
        <Grid container spacing={2} alignItems="flex-start">
          {/* LEFT: 75% main content */}
          <Grid item xs={12} md={9}>
            {/* ROW 1: DEAL PARAMETER CARDS */}
            <Box mb={2}>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
                Deal parameters & market sentiment
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <SectionCard title="Deal economics" accent="primary">
                    <DetailRow
                      label="Deal size"
                      value={
                        formatNumber(deal.deal_size, { decimals: 0 })
                          ? `$${formatNumber(deal.deal_size, { decimals: 0 })}`
                          : undefined
                      }
                    />
                    <DetailRow
                      label="Issue price"
                      value={
                        formatNumber(deal.issue_price, { decimals: 2 })
                          ? `$${formatNumber(deal.issue_price, { decimals: 2 })}`
                          : undefined
                      }
                    />
                    {deal.deal_type !== "IPO" &&
                      formatNumber(deal.discount_from_announcement_price, {
                        suffix: "%",
                        decimals: 2,
                      }) && (
                        <DetailRow
                          label="Disc from announcement"
                          value={formatNumber(
                            deal.discount_from_announcement_price,
                            {
                              suffix: "%",
                              decimals: 2,
                            }
                          )}
                        />
                      )}
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={4}>
                  <SectionCard title="Allocations" accent="success">
                    <DetailRow
                      label="Alloc as % of deal size"
                      value={formatNumber(
                        deal.allocation_as_percentage_of_deal_size,
                        {
                          suffix: "%",
                          decimals: 2,
                        }
                      )}
                    />
                    <DetailRow
                      label="Alloc as % of IOI"
                      value={formatNumber(
                        deal.allocation_as_percentage_of_ioi,
                        {
                          suffix: "%",
                          decimals: 2,
                        }
                      )}
                    />
                  </SectionCard>
                </Grid>

                <Grid item xs={12} md={4}>
                  <SectionCard title="Market sentiment" accent="info">
                    <DetailRow
                      label="1W sentiment"
                      value={deal.one_week_sentiment || "—"}
                    />
                    <DetailRow
                      label="1M sentiment"
                      value={deal.one_month_sentiment || "—"}
                    />
                  </SectionCard>
                </Grid>
              </Grid>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ROW 2: ML MODEL PREDICTIONS */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                  fontSize: 11,
                  color: "text.secondary",
                }}
              >
                ML model predictions & outcomes
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <PredictionBlock
                    title="1st Day Close from Issue Price"
                    pred={deal.t1d_pred}
                    confidence={deal.t1d_confidence}
                    actual={deal.t1d_actual_return}
                    tone="primary"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <PredictionBlock
                    title="1st Day Close from Open Price"
                    pred={deal.t1d_openprice_pred}
                    confidence={deal.t1d_openprice_confidence}
                    actual={deal.t1d_openprice_actual_return}
                    tone="info"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <PredictionBlock
                    title="1 Week Close from 1st Day Close"
                    pred={deal.t1w_pred}
                    confidence={deal.t1w_confidence}
                    actual={deal.t1w_actual_return}
                    tone="success"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <PredictionBlock
                    title="1 Month Close from 1st Day Close"
                    pred={deal.t1m_pred}
                    confidence={deal.t1m_confidence}
                    actual={deal.t1m_actual_return}
                    tone="warning"
                  />
                </Grid>
              </Grid>
            </Box>
            {/* IPO ONLY: AI MODEL PREDICTIONS */}
            {deal.deal_type === "IPO" && (
              <>
                <Divider sx={{ my: 2 }} />

                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      mb: 1,
                      textTransform: "uppercase",
                      letterSpacing: 0.6,
                      fontSize: 11,
                      color: "text.secondary",
                    }}
                  >
                    AI model predictions
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <AIInsightBlock
                        title="FS 1 Week Sentiment"
                        subtitle="AI sentiment signal"
                        value={deal.fs_1w_sentiment}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <AIInsightBlock
                        title="FS 1 Month Sentiment"
                        subtitle="AI sentiment signal"
                        value={deal.fs_1m_sentiment}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <AIInsightBlock
                        title="Expected Volatility"
                        subtitle="AI estimated"
                        value={
                          deal.fs_expected_volatility
                            ? `${formatNumber(deal.fs_expected_volatility, {
                                decimals: 2,
                              })}%`
                            : "—"
                        }
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <AIInsightBlock
                        title="Confidence Level"
                        subtitle="Model confidence"
                        value={
                          deal.fs_confidence_level
                            ? `${formatNumber(deal.fs_confidence_level, {
                                decimals: 0,
                              })}%`
                            : "—"
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              </>
            )}
          </Grid>

          {/* RIGHT: 25% News rail */}
          <Grid item xs={12} md={3}>
            <Box
              sx={{
                position: { md: "sticky" },
                top: { md: 16 },
              }}
            >
              <DealNewsPanel ticker={deal.ticker} />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DealDetailsPanel;

import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
  Paper,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import PredictionCell, { ActualCell } from "./PredictionCell";

export interface DealRecord {
  ticker: string;
  issuer_name: string;
  deal_type: string;
  fo_type: string;
  pricing_date: string;
  region: string;
  sector: string;
  deal_size: number | string;
  issue_price: number | string;
  discount_from_announcement_price: number | string;
  allocation_as_percentage_of_deal_size: number | string;
  allocation_as_percentage_of_ioi: number | string;
  t1d_pred: string;
  t1d_confidence: number | string;
  t1d_actual_return: number | string;
  t1d_openprice_pred: string;
  t1d_openprice_confidence: number | string;
  t1d_openprice_actual_return: number | string;
  t1w_pred: string;
  t1w_confidence: number | string;
  t1w_actual_return: number | string;
  t1m_pred: string;
  t1m_confidence: number | string;
  t1m_actual_return: number | string;
}

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

const formatPricingDate = (date: string | null | undefined): string => {
  if (!date || !date.trim()) return "TBD";
  return date;
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

const SectionCard: React.FC<{
  title: string;
  children: React.ReactNode;
}> = ({ title, children }) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      borderRadius: 2,
      border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
      background:
        theme.palette.mode === "light"
          ? `linear-gradient(145deg, ${theme.palette.grey[50]}, ${theme.palette.background.paper})`
          : theme.palette.background.paper,
      overflow: "hidden",
      height: "100%",
    })}
  >
    <Box
      sx={(theme) => ({
        px: 1.5,
        py: 0.75,
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: alpha(theme.palette.primary.main, 0.03),
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

const PredictionBlock: React.FC<{
  title: string;
  subtitle?: string;
  pred: string;
  confidence: number | string;
  actual: number | string;
}> = ({ title, subtitle, pred, confidence, actual }) => (
  <Paper
    elevation={0}
    sx={(theme) => ({
      borderRadius: 2,
      border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
      background:
        theme.palette.mode === "light"
          ? theme.palette.grey[50]
          : theme.palette.background.paper,
      padding: 1.25,
      height: "100%",
    })}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 1,
        mb: 0.75,
      }}
    >
      <Box>
        <Typography variant="subtitle2" sx={{ fontSize: 13, fontWeight: 600 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>

    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 0.75,
      }}
    >
      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Model prediction
        </Typography>
        <Box mt={0.25}>
          <PredictionCell pred={pred} confidence={confidence} />
        </Box>
      </Box>

      <Divider sx={{ my: 0.75 }} />

      <Box>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontWeight: 500 }}
        >
          Actual return
        </Typography>
        <Box mt={0.25}>
          <ActualCell value={actual} />
        </Box>
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

  const pricingDateText = formatPricingDate(deal.pricing_date);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.background.default,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 1.5,
          }}
        >
          {/* LEFT: Ticker + Issuer + key meta pills */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.75,
            }}
          >
            {/* Ticker badge + issuer */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Box
                sx={(theme) => ({
                  px: 1.6,
                  py: 0.5,
                  borderRadius: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.8,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.common.white
                      : theme.palette.background.paper,
                  border: `1px solid ${theme.palette.primary.main}`,
                  boxShadow:
                    theme.palette.mode === "light"
                      ? "0 0 0 1px rgba(0,0,0,0.02)"
                      : "none",
                })}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.7,
                    color: "text.secondary",
                    fontSize: 10.5,
                  }}
                >
                  Ticker
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    letterSpacing: 0.8,
                  }}
                >
                  {deal.ticker}
                </Typography>
              </Box>

              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  lineHeight: 1.2,
                  maxWidth: { xs: "100%", sm: 420 },
                }}
                color="text.primary"
              >
                {deal.issuer_name}
              </Typography>
            </Box>

            {/* Meta row: pricing · region · sector as small financial chips */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 0.75,
                alignItems: "center",
                mt: 0.25,
              }}
            >
              <Box
                sx={(theme) => ({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 1,
                  py: 0.35,
                  borderRadius: 999,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.background.paper,
                })}
              >
                <CalendarTodayOutlinedIcon
                  sx={{ fontSize: 14, opacity: 0.8 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {`Pricing: ${pricingDateText}`}
                </Typography>
              </Box>

              <Box
                sx={(theme) => ({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 1,
                  py: 0.35,
                  borderRadius: 999,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.background.paper,
                })}
              >
                <PublicOutlinedIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                <Typography variant="caption" color="text.secondary">
                  {deal.region || "Region N/A"}
                </Typography>
              </Box>

              <Box
                sx={(theme) => ({
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                  px: 1,
                  py: 0.35,
                  borderRadius: 999,
                  backgroundColor:
                    theme.palette.mode === "light"
                      ? theme.palette.grey[100]
                      : theme.palette.background.paper,
                })}
              >
                <Typography variant="caption" color="text.secondary">
                  {deal.fo_type || "Sector N/A"}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.6,
              alignItems: "center",
              justifyContent: { xs: "flex-start", sm: "flex-end" },
            }}
          >
            {deal.deal_type && (
              <Chip
                label={deal.deal_type}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              />
            )}

            {deal.fo_type && (
              <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                <CategoryOutlinedIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                <Chip
                  label={deal.sector || deal.fo_type}
                  size="small"
                  color="secondary"
                  variant="outlined"
                  sx={{
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                />
              </Box>
            )}
          </Box>
          </Box>
          </Box>

      <CardContent sx={{ pt: 2.5 }}>
        {/* ROW 1: DEAL PARAMETER CARDS (HORIZONTAL) */}
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
            Deal parameters
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <SectionCard title="Deal classification">
                <DetailRow label="Deal type" value={deal.deal_type || "—"} />
                <DetailRow label="FO type" value={deal.fo_type || "—"} />
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <SectionCard title="Deal economics">
                <DetailRow
                  label="Deal size"
                  value={formatNumber(deal.deal_size, { decimals: 0 })}
                />
                <DetailRow
                  label="Issue price"
                  value={formatNumber(deal.issue_price, { decimals: 2 })}
                />
                <DetailRow
                  label="Disc vs announcement"
                  value={formatNumber(deal.discount_from_announcement_price, {
                    suffix: "%",
                    decimals: 2,
                  })}
                />
              </SectionCard>
            </Grid>

            <Grid item xs={12} md={4}>
              <SectionCard title="Allocations">
                <DetailRow
                  label="Alloc · % of deal"
                  value={formatNumber(
                    deal.allocation_as_percentage_of_deal_size,
                    { suffix: "%", decimals: 2 }
                  )}
                />
                <DetailRow
                  label="Alloc · % of IOI"
                  value={formatNumber(deal.allocation_as_percentage_of_ioi, {
                    suffix: "%",
                    decimals: 2,
                  })}
                />
              </SectionCard>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* ROW 2: PREDICTION CARDS (HORIZONTAL) */}
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
            Model predictions & outcomes
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1st Day Close from Issue Price"
                subtitle="From issue price"
                pred={deal.t1d_pred}
                confidence={deal.t1d_confidence}
                actual={deal.t1d_actual_return}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1st Day Close from Open Price"
                subtitle="Intraday from open"
                pred={deal.t1d_openprice_pred}
                confidence={deal.t1d_openprice_confidence}
                actual={deal.t1d_openprice_actual_return}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1 Week from 1st Day Close"
                subtitle="From 1st day close"
                pred={deal.t1w_pred}
                confidence={deal.t1w_confidence}
                actual={deal.t1w_actual_return}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1 Month from 1st Day Close"
                subtitle="From 1st day close"
                pred={deal.t1m_pred}
                confidence={deal.t1m_confidence}
                actual={deal.t1m_actual_return}
              />
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default DealDetailsPanel;

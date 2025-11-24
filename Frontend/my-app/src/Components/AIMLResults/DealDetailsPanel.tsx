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
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={1}
        >
          <Box>
            <Typography variant="h6" fontWeight={700}>
              {deal.ticker}
            </Typography>
            <Typography
              variant="subtitle2"
              color="text.secondary"
              sx={{ maxWidth: 520 }}
            >
              {deal.issuer_name}
            </Typography>
            <Box
              mt={0.5}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
                alignItems: "center",
                fontSize: 12,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {`Pricing: ${pricingDateText}`}
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, my: 0.25 }}
              />
              <Typography variant="caption" color="text.secondary">
                {deal.region}
              </Typography>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 0.5, my: 0.25 }}
              />
              <Typography variant="caption" color="text.secondary">
                {deal.sector}
              </Typography>
            </Box>
          </Box>

          <Box display="flex" flexWrap="wrap" gap={0.5}>
            {deal.deal_type && (
              <Chip
                label={deal.deal_type}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {deal.fo_type && (
              <Chip
                label={deal.fo_type}
                size="small"
                color="secondary"
                variant="outlined"
              />
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
                  value={formatNumber(
                    deal.discount_from_announcement_price,
                    { suffix: "%", decimals: 2 }
                  )}
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
                  value={formatNumber(
                    deal.allocation_as_percentage_of_ioi,
                    { suffix: "%", decimals: 2 }
                  )}
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
                title="1st Day Close"
                subtitle="From issue price"
                pred={deal.t1d_pred}
                confidence={deal.t1d_confidence}
                actual={deal.t1d_actual_return}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1st Day Open → Close"
                subtitle="Intraday from open"
                pred={deal.t1d_openprice_pred}
                confidence={deal.t1d_openprice_confidence}
                actual={deal.t1d_openprice_actual_return}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1 Week"
                subtitle="From 1st day close"
                pred={deal.t1w_pred}
                confidence={deal.t1w_confidence}
                actual={deal.t1w_actual_return}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <PredictionBlock
                title="1 Month"
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

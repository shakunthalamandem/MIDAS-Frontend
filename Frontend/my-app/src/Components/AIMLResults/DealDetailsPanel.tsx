import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
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

const DealDetailsPanel: React.FC<{ deal: DealRecord | null }> = ({ deal }) => {
  if (!deal) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600}>
            Deal details
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Select a row in the table to view full details here.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header strip */}
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
              {deal.ticker} – {deal.issuer_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pricing date: {deal.pricing_date} · Sector: {deal.sector} ·
              Region: {deal.region}
            </Typography>
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
        {/* Core deal info */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Deal overview
            </Typography>
            <Typography variant="body2">
              <strong>Ticker:</strong> {deal.ticker}
            </Typography>
            <Typography variant="body2">
              <strong>Issuer:</strong> {deal.issuer_name}
            </Typography>
            <Typography variant="body2">
              <strong>Pricing date:</strong> {deal.pricing_date}
            </Typography>
            <Typography variant="body2">
              <strong>Region:</strong> {deal.region}
            </Typography>
            <Typography variant="body2">
              <strong>Sector:</strong> {deal.sector}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Deal economics
            </Typography>
            <Typography variant="body2">
              <strong>Deal size:</strong>{" "}
              {formatNumber(deal.deal_size, { decimals: 0 })}
            </Typography>
            <Typography variant="body2">
              <strong>Issue price:</strong>{" "}
              {formatNumber(deal.issue_price, { decimals: 2 })}
            </Typography>
            <Typography variant="body2">
              <strong>Disc vs announcement:</strong>{" "}
              {formatNumber(deal.discount_from_announcement_price, {
                suffix: "%",
              })}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Typography variant="subtitle2" gutterBottom>
              Allocation
            </Typography>
            <Typography variant="body2">
              <strong>Alloc % of deal:</strong>{" "}
              {formatNumber(deal.allocation_as_percentage_of_deal_size, {
                suffix: "%",
              })}
            </Typography>
            <Typography variant="body2">
              <strong>Alloc % of IOI:</strong>{" "}
              {formatNumber(deal.allocation_as_percentage_of_ioi, {
                suffix: "%",
              })}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Predictions and actuals, colored */}
        <Typography variant="subtitle2" gutterBottom>
          Predictions & outcomes
        </Typography>

        <Grid container spacing={2}>
          {/* 1D close */}
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              1st Day Close
            </Typography>
            <Box
              mt={0.5}
              p={1}
              borderRadius={1.5}
              sx={{ bgcolor: (t) => t.palette.action.hover }}
            >
              <Typography variant="caption" color="text.secondary">
                Model prediction
              </Typography>
              <PredictionCell
                pred={deal.t1d_pred}
                confidence={deal.t1d_confidence}
              />
              <Box mt={0.75}>
                <Typography variant="caption" color="text.secondary">
                  Actual return
                </Typography>
                <ActualCell value={deal.t1d_actual_return} />
              </Box>
            </Box>
          </Grid>

          {/* 1D open→close */}
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              1st Day Open → Close
            </Typography>
            <Box
              mt={0.5}
              p={1}
              borderRadius={1.5}
              sx={{ bgcolor: (t) => t.palette.action.hover }}
            >
              <Typography variant="caption" color="text.secondary">
                Model prediction
              </Typography>
              <PredictionCell
                pred={deal.t1d_openprice_pred}
                confidence={deal.t1d_openprice_confidence}
              />
              <Box mt={0.75}>
                <Typography variant="caption" color="text.secondary">
                  Actual return
                </Typography>
                <ActualCell value={deal.t1d_openprice_actual_return} />
              </Box>
            </Box>
          </Grid>

          {/* 1W */}
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              1 Week
            </Typography>
            <Box
              mt={0.5}
              p={1}
              borderRadius={1.5}
              sx={{ bgcolor: (t) => t.palette.action.hover }}
            >
              <Typography variant="caption" color="text.secondary">
                Model prediction
              </Typography>
              <PredictionCell
                pred={deal.t1w_pred}
                confidence={deal.t1w_confidence}
              />
              <Box mt={0.75}>
                <Typography variant="caption" color="text.secondary">
                  Actual return
                </Typography>
                <ActualCell value={deal.t1w_actual_return} />
              </Box>
            </Box>
          </Grid>

          {/* 1M */}
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              1 Month
            </Typography>
            <Box
              mt={0.5}
              p={1}
              borderRadius={1.5}
              sx={{ bgcolor: (t) => t.palette.action.hover }}
            >
              <Typography variant="caption" color="text.secondary">
                Model prediction
              </Typography>
              <PredictionCell
                pred={deal.t1m_pred}
                confidence={deal.t1m_confidence}
              />
              <Box mt={0.75}>
                <Typography variant="caption" color="text.secondary">
                  Actual return
                </Typography>
                <ActualCell value={deal.t1m_actual_return} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default DealDetailsPanel;

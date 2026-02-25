import React from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { Activity, AlertTriangle, TrendingUp } from "lucide-react";

interface SummaryProps {
  summary: {
    market_view: string;
    portfolio_bias: string;
    key_opportunities: string[];
    main_risks: string[];
    forward_sentiment_outlook: string;
    news_sentiment_importance?: string;
  };
  actionSummary: {
    buy_more: number;
    hold: number;
    reduce: number;
    sell_down: number;
  };
  metadata: {
    fund_style: string;
    report_date: string;
    analysis_focus: string;
    investment_horizon: string;
  };
}

const statConfig: Record<string, { bg: string; border: string; color: string }> = {
  Buy: { bg: "#ecfdf5", border: "#a7f3d0", color: "#059669" },
  Hold: { bg: "#eff6ff", border: "#bfdbfe", color: "#2563eb" },
  Reduce: { bg: "#fff7ed", border: "#fed7aa", color: "#ea580c" },
  Sell: { bg: "#fef2f2", border: "#fecaca", color: "#dc2626" },
};

const SummaryStat = ({ label, value }: { label: string; value: number }) => {
  const cfg = statConfig[label] || { bg: "#f8fafc", border: "#e2e8f0", color: "#475569" };
  return (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        px: 2,
        py: 1.2,
        minWidth: 80,
        textAlign: "center",
        borderRadius: 2.5,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        transition: "all 0.2s",
        "&:hover": { boxShadow: `0 3px 10px ${cfg.border}` },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: cfg.color }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ letterSpacing: 1.5, textTransform: "uppercase", color: cfg.color, fontWeight: 600, fontSize: 10 }}>
        {label}
      </Typography>
    </Paper>
  );
};

export const ExecutiveSummary = ({ summary, actionSummary, metadata }: SummaryProps) => {
  const stats = [
    { label: "Buy", value: actionSummary.buy_more },
    { label: "Hold", value: actionSummary.hold },
    { label: "Reduce", value: actionSummary.reduce },
    { label: "Sell", value: actionSummary.sell_down },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* Header row */}
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={3} mb={3}>
        <Box>
          <Typography variant="h5" sx={{ color: "#1e293b", fontWeight: 700 }}>
            {metadata.fund_style}
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            {metadata.analysis_focus} · {metadata.investment_horizon} horizon · {metadata.report_date}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5} flexWrap="wrap" alignItems="flex-end">
          {stats.map((item) => (
            <SummaryStat key={item.label} label={item.label} value={item.value} />
          ))}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Left column */}
        <Grid item xs={12} md={7}>
          <Box
            sx={{
              backgroundColor: "#f8fafc",
              borderRadius: 2.5,
              border: "1px solid #e2e8f0",
              p: 2.5,
              mb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Activity size={18} color="#2563eb" />
              <Typography variant="subtitle2" sx={{ letterSpacing: 1, textTransform: "uppercase", color: "#2563eb", fontWeight: 700 }}>
                Market View
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.7 }}>
              {summary.market_view}
            </Typography>
          </Box>

          <Box
            sx={{
              backgroundColor: "#faf5ff",
              borderRadius: 2.5,
              border: "1px solid #e9d5ff",
              p: 2.5,
            }}
          >
            <Typography variant="subtitle2" sx={{ letterSpacing: 1, textTransform: "uppercase", color: "#7c3aed", fontWeight: 700, mb: 1 }}>
              Forward Outlook
            </Typography>
            <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.7 }}>
              {summary.forward_sentiment_outlook}
            </Typography>
          </Box>
        </Grid>

        {/* Right column */}
        <Grid item xs={12} md={5}>
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: "#ecfdf5",
              border: "1px solid #a7f3d0",
              mb: 2,
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <TrendingUp size={18} color="#059669" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#059669", letterSpacing: 1, textTransform: "uppercase" }}>
                Top Picks
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {summary.key_opportunities.map((ticker) => (
                <Box
                  key={ticker}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                    border: "1px solid #a7f3d0",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "#059669",
                    mb: 0.5,
                  }}
                >
                  {ticker}
                </Box>
              ))}
            </Stack>
          </Box>

          <Box
            sx={{
              p: 2.5,
              borderRadius: 2.5,
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
            }}
          >
            <Box display="flex" alignItems="center" gap={1} mb={1.5}>
              <AlertTriangle size={18} color="#dc2626" />
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#dc2626", letterSpacing: 1, textTransform: "uppercase" }}>
                Key Risks
              </Typography>
            </Box>
            <Stack spacing={0.8}>
              {summary.main_risks.slice(0, 4).map((risk, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#dc2626", mt: 0.8, flexShrink: 0 }} />
                  <Typography variant="body2" sx={{ color: "#991b1b", lineHeight: 1.5 }}>
                    {risk}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

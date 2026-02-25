import React from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { Activity, AlertTriangle, BarChart3, TrendingUp } from "lucide-react";

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

const SummaryStat = ({ label, value }: { label: string; value: number }) => (
  <Paper
    variant="outlined"
    sx={{
      flex: 1,
      px: 2,
      py: 1,
      minWidth: 80,
      textAlign: "center",
      borderRadius: 2,
      backgroundColor: "#f8fafc",
      border: "1px solid #e2e8f0",
      color: "#1e293b",
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1, color: "#2563eb" }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ letterSpacing: 2, textTransform: "uppercase", color: "#64748b" }}>
      {label}
    </Typography>
  </Paper>
);

export const ExecutiveSummary = ({ summary, actionSummary, metadata }: SummaryProps) => {
  const stats = [
    { label: "Buy", value: actionSummary.buy_more },
    { label: "Hold", value: actionSummary.hold },
    { label: "Reduce", value: actionSummary.reduce },
    { label: "Sell", value: actionSummary.sell_down },
  ];

  return (
    <Paper
      elevation={3}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        backgroundColor: "#fff",
        boxShadow: "0 20px 45px rgba(15,23,42,0.15)",
      }}
    >
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={3} mb={3}>
        <Box>
          <Typography variant="h4" sx={{ color: "#530478", fontWeight: 600, letterSpacing: 1 }}>
            {metadata.fund_style}
          </Typography>
          {/* <Typography variant="h3" fontWeight={700} color="text.primary">
            AI Portfolio <Box component="span" color="primary.main">Sentinel</Box>
          </Typography> */}
          <Typography variant="body2" color="text.secondary">
            {metadata.analysis_focus} | {metadata.investment_horizon} horizon | {metadata.report_date}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="flex-end">
          {stats.map((item) => (
            <SummaryStat key={item.label} label={item.label} value={item.value} />
          ))}
        </Stack>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Box display="flex" alignItems="center" gap={1} mb={1}>
            <Activity size={18} color="#0f172a" />
            <Typography variant="h6" sx={{ letterSpacing: 2, textTransform: "uppercase", color: "#184dc9" }}>
              Market View
            </Typography>
          </Box>
          <Typography variant="body1" color="#000000" paragraph>
            {summary.market_view}
          </Typography>
          <Box borderTop="1px solid rgba(15,23,42,0.08)" pt={2} mt={2}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5}>
              {/* <BarChart3 size={16} color="#0f172a" /> */}
            <Typography variant="h6" sx={{ fontWeight: 2, textTransform: "uppercase", color: "#184dc9" }}>
                Forward Outlook
              </Typography>
            </Box>
          <Typography variant="body1" color="#000000" paragraph>
              {summary.forward_sentiment_outlook}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 2 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <TrendingUp size={18} color="#047857" />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#5618c9" }}
              >
                Top Picks
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {summary.key_opportunities.map((ticker) => (
                <Box
                  key={ticker}
                  sx={{
                    px: 2,
                    py: 0.5,
                    borderRadius: 1.5,
                    border: "1px solid rgba(15,23,42,0.08)",
                    fontWeight: 600,
                    fontSize: "0.8rem",
                    color: "primary.main",
                  }}
                >
                  {ticker}
                </Box>
              ))}
            </Stack>
          </Paper>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 3 }}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <AlertTriangle size={18} color="#dc2626" />
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, fontSize: "0.875rem", color: "#dc2626" }}
              >
                Key Risks
              </Typography>
            </Box>
            <Stack spacing={1}>
              {summary.main_risks.slice(0, 4).map((risk, idx) => (
                <Box key={idx} sx={{ display: "flex", gap: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "text.secondary" }}>
                    •
                  </Typography>
                  <Typography variant="body2" color="#dc2626">
                    {risk}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Paper>
  );
};

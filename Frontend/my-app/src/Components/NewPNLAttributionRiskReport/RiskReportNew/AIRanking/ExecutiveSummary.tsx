import React from "react";
import { Box, Grid, Paper, Stack, Typography } from "@mui/material";
import { Activity, AlertTriangle, Eye, TrendingUp } from "lucide-react";

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
  Buy: { bg: "#059669", border: "#059669", color: "#fff" },
  Hold: { bg: "#2563eb", border: "#2563eb", color: "#fff" },
  Reduce: { bg: "#ea580c", border: "#ea580c", color: "#fff" },
  Sell: { bg: "#dc2626", border: "#dc2626", color: "#fff" },
};

const SummaryStat = ({ label, value }: { label: string; value: number }) => {
  const cfg = statConfig[label] || { bg: "#64748b", border: "#64748b", color: "#fff" };
  return (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        px: 2,
        py: 1.2,
        minWidth: 72,
        textAlign: "center",
        borderRadius: 2,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        transition: "transform 0.2s, box-shadow 0.2s",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 4px 12px ${cfg.bg}66`,
        },
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1, color: cfg.color }}>
        {value}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: cfg.color,
          fontWeight: 600,
          fontSize: 10,
          opacity: 0.9,
        }}
      >
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
        borderRadius: 3,
        overflow: "hidden",
        backgroundColor: "#fff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header band */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #f8fafc 0%, #eef2ff 100%)",
          borderBottom: "2px solid #e2e8f0",
          px: { xs: 3, md: 4 },
          py: 2.5,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h5" sx={{ color: "#002060", fontWeight: 700 }}>
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

      {/* Content area */}
      <Box sx={{ p: { xs: 3, md: 4 } }}>
        <Grid container spacing={2.5}>
          {/* Left column */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                backgroundColor: "#f0f5ff",
                borderRadius: 2.5,
                borderLeft: "4px solid #2563eb",
                p: 2.5,
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Activity size={16} color="#2563eb" />
                <Typography
                  variant="subtitle2"
                  sx={{
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "#002060",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Market View
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.75 }}>
                {summary.market_view}
              </Typography>
            </Box>

            <Box
              sx={{
                backgroundColor: "#faf5ff",
                borderRadius: 2.5,
                borderLeft: "4px solid #7c3aed",
                p: 2.5,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <Eye size={16} color="#7c3aed" />
                <Typography
                  variant="subtitle2"
                  sx={{
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    color: "#5b21b6",
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  Forward Outlook
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.75 }}>
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
                borderLeft: "4px solid #059669",
                mb: 2,
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <TrendingUp size={16} color="#059669" />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "#065f46",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontSize: 12,
                  }}
                >
                  Top Picks
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {summary.key_opportunities.map((ticker) => (
                  <Box
                    key={ticker}
                    sx={{
                      px: 2,
                      py: 0.6,
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
                borderLeft: "4px solid #dc2626",
              }}
            >
              <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                <AlertTriangle size={16} color="#dc2626" />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 700,
                    color: "#991b1b",
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontSize: 12,
                  }}
                >
                  Key Risks
                </Typography>
              </Box>
              <Stack spacing={1}>
                {summary.main_risks.slice(0, 4).map((risk, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: "#dc2626",
                        mt: 0.8,
                        flexShrink: 0,
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "#991b1b", lineHeight: 1.6 }}>
                      {risk}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

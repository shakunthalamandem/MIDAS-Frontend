import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  TrendingFlat,
  InfoOutlined,
} from "@mui/icons-material";

interface InsightCardProps {
  title: string;
  metric: string;
  change: string;
  status: "up" | "down" | "neutral";
  comment: string;
}

const statusIcon = {
  up: <ArrowUpward sx={{ color: "green" }} />,
  down: <ArrowDownward sx={{ color: "red" }} />,
  neutral: <TrendingFlat sx={{ color: "grey.600" }} />,
};

const InsightCard = ({
  title,
  metric,
  change,
  status,
  comment,
}: InsightCardProps) => (
  <Card
    sx={{
      borderRadius: 2,
      borderLeft: `6px solid ${status === "up" ? "#4caf50" : status === "down" ? "#f44336" : "#90a4ae"}`,
      p: 2,
    }}
  >
    <CardContent>
      <Box alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
      </Box>
      <Chip
        icon={statusIcon[status]}
        label={change}
        variant="outlined"
        size="small"
        sx={(theme) => ({
          backgroundColor:
            status === "up"
              ? theme.palette.success.light
              : status === "down"
                ? theme.palette.error.light
                : theme.palette.grey[200],
        })}
      />
      <Typography variant="body1" color="#002060" sx={{ mt: 1 }}>
        {metric}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {comment}
      </Typography>
    </CardContent>
  </Card>
);

const InsightsMain = () => {
  const insights: InsightCardProps[] = [
    {
      title: "Deal Count (May’24 vs May’25)",
      metric: "+9 IPOs / +6 FOs",
      change: "+40% YoY",
      status: "up",
      comment:
        "Increase driven by stronger FO issuance and U.S. pipeline recovery.",
    },
    {
      title: "Deal Volume (Q2’25 vs Q1’25)",
      metric: "$12.7 B",
      change: "–12% QoQ",
      status: "down",
      comment:
        "Seasonal slowdown and absence of mega-deals in Q2 weighed on volumes.",
    },
    {
      title: "Opportunity Value (May’24 vs May’25)",
      metric: "$1.4 B",
      change: "+75% YoY",
      status: "up",
      comment: "Surge driven by large-cap Tech & Healthcare offerings.",
    },
    {
      title: "% Positively Performing Deals (YTD ’24 vs ’25)",
      metric: "+3 pts",
      change: "+3% YoY",
      status: "up",
      comment:
        "Improved IRR returns thanks to selective pricing and strong demand.",
    },
    {
      title: "Region Performance – US vs EMEA",
      metric: "US: $9.7 M Gap / EMEA: $10.2 M Gap",
      change: "mixed",
      status: "up",
      comment: "US deals outperformed model; EMEA FO returns lagged behind.",
    },
    {
      title: "Sector Strength – Tech & Healthcare",
      metric: "Tech: $3.1 B / Healthcare: $2.9 B",
      change: "+15% / +12%",
      status: "up",
      comment:
        "High premium returns in both sectors driven by robust pipelines.",
    },
    {
      title: "Allocation Trends",
      metric: "IPO vs FO",
      change: "-0.1% / -0.2%",
      status: "down",
      comment: "Allocations are down in both segments",
    },
    {
      title: "APAC Region (2025 YTD)",
      metric: "–$13.5 M Gap",
      change: "down",
      status: "down",
      comment:
        "Underperformance despite strong IPO volume; exits remain muted.",
    },
    {
      title: "EMEA Region (2025 YTD)",
      metric: "–$16.4 M Gap",
      change: "down",
      status: "down",
      comment: "Weak FO returns in EMEA offset otherwise healthy allocations.",
    },
    {
      title: "US Region (2025 YTD)",
      metric: "–$14.3 M Gap",
      change: "down",
      status: "down",
      comment:
        "FO segment underperformance in US despite highest capital allocated.",
    },
    {
      title: "Overall 2025 YTD GAP",
      metric: "–$44.2 M Total Gap",
      change: "down",
      status: "down",
      comment: "All regions missed modeled returns, especially in FO deals.",
    },
    {
      title: "IPO Deals (2025 YTD)",
      metric: "–$21.1 M Gap",
      change: "down",
      status: "down",
      comment:
        "Actual IPO PnL trailed model due to later‐than‐expected exit timing.",
    },
    {
      title: "FO Deals (2025 YTD)",
      metric: "–$23.1 M Gap",
      change: "down",
      status: "down",
      comment:
        "FO PnL underperformed model forecasts, driven by mix and timing.",
    },
  ];

  return (
    <Box sx={{ px: 2, py: 1 }}>
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        color="#FFFFFF"
        align="center"
      >
        AI Market Insights Overview 2025
      </Typography>
      <Grid container spacing={2}>
        {insights.map((insight, idx) => (
          <Grid item xs={12} key={idx}>
            <InsightCard {...insight} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default InsightsMain;

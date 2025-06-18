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
      "title": "FOs Sustain Larger Volumes Even in 2025 H1",
      "metric": "FO Volume: ~$153B vs IPO: ~$40B (H1 2025)",
      "change": "",
      "status": "neutral",
      "comment": "FO volume remains elevated relative to IPOs, consistent with trends seen in 2023 and 2024."
    },
    {
      "title": "IPO Deal Activity Holds Steady in 2025 H1",
      "metric": "121 Deals | $39.9B Volume",
      "change": "",
      "status": "neutral",
      "comment": "IPO deal count remained strong in H1 2025, slightly higher than H1 2024, though opportunity value declined to $4.3B."
    },
    {
      "title": "Shift in Relative Attractiveness: IPOs Match FOs in Returns",
      "metric": "IPO Excess Return: 10.8% vs FO: 3.0%",
      "change": "",
      "status": "up",
      "comment": "IPOs outperformed FOs in expected return excess by a wide margin, reversing the FO-driven strength seen in H1 2024."
    },
    {
      "title": "EMEA IPOs Lead in Performance and Return Quality",
      "metric": "66.7% Pos. Deals | 13.3% Return Excess",
      "change": "",
      "status": "up",
      "comment": "EMEA IPOs topped all regions in both return quality and success rate, making it the most attractive IPO market in H1 2025."
    },
    {
      "title": "APAC FOs Show Balanced Risk-Reward",
      "metric": "64.6% Pos. Deals | 4.6% Return Excess",
      "change": "",
      "status": "neutral",
      "comment": "APAC FOs provided a steady middle-ground—stronger return excess than US, but slightly lower win rate than EMEA."
    },
    {
      "title": "Health Care Shows High Activity and Solid Returns",
      "metric": "75 Deals | $2.1B Opportunity | 6.7% Excess Return",
      "change": "",
      "status": "up",
      "comment": "Health Care remains a high-volume, high-quality sector with strong deal count and one of the top return profiles."
    },
    {
      "title": "Consumer Discretionary Tops in Opportunity and Returns",
      "metric": "$2.2B Opportunity | 9.0% Excess Return",
      "change": "",
      "status": "up",
      "comment": "With a strong 75.7% hit rate, Consumer Discretionary leads all sectors in both return potential and deal quality."
    },
    {
      "title": "Energy Sector Faces Sharp Underperformance",
      "metric": "-$813M Opportunity | -8.3% Excess Return",
      "change": "",
      "status": "down",
      "comment": "Energy stands out as the only sector with negative return excess and opportunity value, reflecting broad investor caution."
    },
    {
      "title": "FO Activity Recovers as IPOs Continue to Slow (2025 Q2)",
      "metric": "FO: 40 vs IPO: 22",
      "change": "",
      "status": "up",
      "comment": "FO deal count rebounded slightly after a sharp Q1 dip, while IPO activity remained subdued."
    },
    {
      "title": "Deal Size Allocation Stays Skewed Towards FOs (2025 Q2)",
      "metric": "FO: 0.37%, IPO: 0.11%",
      "change": "",
      "status": "neutral",
      "comment": "FOs continue to secure a higher allocation share of deal size, though both segments show low absolute values."
    }
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

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
  status: "up" | "down" | "flat";
  comment: string;
}

const statusIcon = {
  up: <ArrowUpward sx={{ color: "green" }} />,
  down: <ArrowDownward sx={{ color: "red" }} />,
  flat: <TrendingFlat sx={{ color: "grey.600" }} />,
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
      title: "FOs Sustain Larger Volumes Even in 2025 H1",
      metric: "FO Volume: ~$153B vs IPO: ~$40B (H1 2025)",
      change: "",
      status: "flat",
      comment:
        "FO volume remains elevated relative to IPOs, consistent with trends seen in 2023 and 2024.",
    },
    {
      title: "IPO Deal Activity Holds Steady in 2025 H1",
      metric: "121 Deals | $39.9B Volume",
      change: "",
      status: "flat",
      comment:
        "IPO deal count remained strong in H1 2025, slightly higher than H1 2024, though opportunity value declined to $4.3B.",
    },
    {
      title: "Shift in Relative Attractiveness: IPOs Match FOs in Returns",
      metric: "IPO Excess Return: 10.8% vs FO: 3.0%",
      change: "",
      status: "up",
      comment:
        "IPOs outperformed FOs in expected return excess by a wide margin, reversing the FO-driven strength seen in H1 2024.",
    },
    {
      title: "EMEA IPOs Lead in Performance and Return Quality",
      metric: "66.7% Pos. Deals | 13.3% Return Excess",
      change: "",
      status: "up",
      comment:
        "EMEA IPOs topped all regions in both return quality and success rate, making it the most attractive IPO market in H1 2025.",
    },
    {
      title: "Health Care Shows High Activity and Solid Returns",
      metric: "75 Deals | $2.1B Opportunity | 6.7% Excess Return",
      change: "",
      status: "up",
      comment:
        "Health Care remains a high-volume, high-quality sector with strong deal count and one of the top return profiles.",
    },
    {
      title: "Deal Size Allocation Stays Skewed Towards FOs (2025 Q2)",
      metric: "FO: 0.38%, IPO: 0.12%",
      change: "",
      status: "flat",
      comment:
        "FOs continue to secure a higher allocation share of deal size, though both segments show low absolute values.",
    },
    {
      title: "APAC Returns Significantly Lag Model Expectations",
      metric: "-$18.7M Gap on $109.5M Allocation",
      change: "",
      status: "down",
      comment:
        "Across deal types, APAC generated $3.4M in actual PnL vs $22.1M modeled — a realization of just 3% on allocated capital, compared to the model’s implied 20%+.",
    },
    {
      title: "EMEA FO Outperforms Model with Largest Positive Gap",
      metric: "+$16.3M Gap on $338.1M Allocation",
      change: "",
      status: "up",
      comment:
        "With the highest FO deal volume across regions, EMEA generated $19.2M in actual PnL vs $3.0M modeled — a 6x outperformance.",
    },
    {
      title: "US IPO Gap Suggests Material Overestimation in Modeled Returns",
      metric: "-$64.0M Gap on $33.5M Allocation",
      change: "",
      status: "down",
      comment:
        "With just $2.5M in actual PnL vs $66.6M modeled, US IPOs delivered the most severe miss relative to allocation across all segments. The model implied nearly 2x return on capital but realized only ~7%.",
    },
    {
      title: "US FO: High Capital Deployment, Low Return Efficiency",
      metric: "-$21.0M Gap on $449.0M Allocation",
      change: "",
      status: "down",
      comment:
        "Despite a sizable allocation, US FO actual PnL fell short of the model by $21M. The gap is notable given that deal volume was only half of EMEA’s, which suggests that the capital may have been deployed across lower-quality deals than the model anticipated.",
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

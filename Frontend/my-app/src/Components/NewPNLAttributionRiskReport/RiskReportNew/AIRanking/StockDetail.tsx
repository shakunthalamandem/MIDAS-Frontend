import React from "react";
import { Box, Card, CardContent, Divider, Grid, IconButton, Stack, Typography } from "@mui/material";
import { ActionBadge } from "./ActionBadge";
import { ConvictionStars } from "./ConvictionStars";
import {
  BarChart3,
  Calendar,
  DollarSign,
  Eye,
  MessageSquare,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";
import { SentimentBar } from "./SentimentBar";

interface StockData {
  ticker: string;
  decision: { action: string; confidence_level: string; conviction_rating: number };
  cio_commentary: string;
  price_analysis: {
    ipo_price: number;
    current_price: number;
    avg_entry_price: number;
    risk_to_stop: string;
    trend_since_ipo: string;
    distance_to_target: string;
    first_day_behavior: string;
  };
  portfolio_context: {
    days_held: number;
    performance_status: string;
    portfolio_exposure: string;
  };
  catalysts: string[];
  risks: string[];
  sentiment_analysis: {
    news_sentiment: string;
    volume_behavior: string;
    investor_sentiment: string;
  };
  fundamental_analysis: {
    revenue_growth_view: string;
    profitability_view: string;
    long_term_potential: string;
  };
  suggested_positioning: string;
  forward_sentiment_prediction: {
    sentiment_driver: string;
    expected_volatility: string;
    next_1_2_month_outlook: string;
  };
}

interface Props {
  stock: StockData;
  onClose: () => void;
}

const SectionHeading = ({ icon: Icon, title }: { icon: React.ElementType; title: string }) => (
  <Box display="flex" alignItems="center" gap={1} mb={1}>
    <Icon size={16} color="#0f172a" />
    <Typography variant="button" sx={{ letterSpacing: 2, textTransform: "uppercase", color: "text.secondary" }}>
      {title}
    </Typography>
  </Box>
);

const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 0.4 }}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" color={valueColor ?? "text.primary"} fontWeight={600}>
      {value}
    </Typography>
  </Grid>
);

const pnlColor = (status: string) => {
  if (status.toLowerCase().includes("winner")) return "success.main";
  if (status.toLowerCase().includes("loser")) return "error.main";
  return "text.secondary";
};

export const StockDetail = ({ stock, onClose }: Props) => {
  const { decision, price_analysis: pa, portfolio_context: pc, sentiment_analysis: sa, fundamental_analysis: fa, forward_sentiment_prediction: fsp } =
    stock;

  return (
    <Card elevation={4} sx={{ borderRadius: 3 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" fontWeight={700}>
              {stock.ticker}
            </Typography>
            <ActionBadge action={decision.action} />
            <ConvictionStars rating={decision.conviction_rating} />
            <Typography variant="caption" color="text.secondary">
              {decision.confidence_level} Confidence
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <X />
          </IconButton>
        </Box>
        <Box mb={3}>
          <SectionHeading icon={MessageSquare} title="CIO Commentary" />
          <Typography variant="body2" color="text.secondary">
            {stock.cio_commentary}
          </Typography>
        </Box>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <SectionHeading icon={DollarSign} title="Price Analysis" />
                <DataRow label="Current" value={`$${pa.current_price.toFixed(2)}`} />
                <DataRow label="IPO Price" value={`$${pa.ipo_price.toFixed(2)}`} />
                <DataRow label="Avg Entry" value={`$${pa.avg_entry_price.toFixed(2)}`} />
                <DataRow label="Risk to Stop" value={pa.risk_to_stop} valueColor="error.main" />
                <DataRow
                  label="To Target"
                  value={pa.distance_to_target}
                  valueColor={pa.distance_to_target.includes("+") ? "success.main" : "text.secondary"}
                />
                <Typography variant="caption" color="text.secondary">
                  {pa.trend_since_ipo}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <SectionHeading icon={BarChart3} title="Portfolio Context" />
                <DataRow label="Days Held" value={pc.days_held} />
                <DataRow label="Exposure" value={pc.portfolio_exposure} />
                <DataRow label="Status" value={pc.performance_status.split("(")[0].trim()} valueColor={pnlColor(pc.performance_status)} />
                <Typography variant="caption" color="text.secondary">
                  {pc.performance_status}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <SectionHeading icon={Eye} title="Forward Outlook" />
                <DataRow label="Driver" value={fsp.sentiment_driver} />
                <DataRow label="Volatility" value={fsp.expected_volatility} valueColor={fsp.expected_volatility === "High" ? "error.main" : fsp.expected_volatility === "Medium" ? "text.secondary" : "success.main"} />
                <Typography variant="caption" color="text.secondary">
                  {fsp.next_1_2_month_outlook}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <SectionHeading icon={Zap} title="Catalysts" />
                <StackSection items={stock.catalysts} prefix="+" />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent>
                <SectionHeading icon={Shield} title="Risks" />
                <StackSection items={stock.risks} prefix="!" color="error.main" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} mb={3}>
          <Grid item xs={12} md={6}>
            <Box>
              <SectionHeading icon={TrendingUp} title="Sentiment Analysis" />
              <Grid container spacing={1}>
                {Object.entries(sa).map(([key, val]) => (
                  <Grid item xs={12} key={key}>
                    <Typography variant="caption" color="text.secondary">
                      {key.replace(/_/g, " ")}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {val}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <SectionHeading icon={TrendingDown} title="Fundamentals" />
              <Grid container spacing={1}>
                {Object.entries(fa).map(([key, val]) => (
                  <Grid item xs={12} key={key}>
                    <Typography variant="caption" color="text.secondary">
                      {key.replace(/_/g, " ")}
                    </Typography>
                    <Typography variant="body2" color="text.primary">
                      {val}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <SectionHeading icon={Target} title="Suggested Positioning" />
            <Typography variant="body2" color="text.secondary">
              {stock.suggested_positioning}
            </Typography>
          </Box>
          <Box sx={{ width: 180 }}>
            <SentimentBar score={(decision.conviction_rating - 3) / 2} label="Conviction" />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const StackSection = ({
  items,
  prefix,
  color,
}: {
  items: string[];
  prefix: string;
  color?: string;
}) => (
  <Stack spacing={1}>
    {items.map((item, idx) => (
      <Box key={idx} display="flex" gap={1}>
        <Typography variant="body2" color={color ?? "text.primary"} fontWeight={600}>
          {prefix}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {item}
        </Typography>
      </Box>
    ))}
  </Stack>
);

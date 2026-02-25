import React from "react";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
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

export interface StockData {
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
    <Icon size={16} color="#0a2870" />
    <Typography variant="button" sx={{   color: "#0a2870" }}>
      {title}
    </Typography>
  </Box>
);

const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
    <Typography variant="body1"  color="#580a70">
      {label}
    </Typography>
    <Typography variant="body1" color={valueColor ?? "text.primary"} fontWeight={700}>
      {value}
    </Typography>
  </Grid>
);

type SectionRow = { label: string; value: React.ReactNode; color?: string };

const pnlColor = (status: string) => {
  if (status.toLowerCase().includes("winner")) return "success.main";
  if (status.toLowerCase().includes("loser")) return "error.main";
  return "text.secondary";
};

const getDetailSections = (
  pa: StockData["price_analysis"],
  pc: StockData["portfolio_context"],
  fsp: StockData["forward_sentiment_prediction"]
) => {
  const sections: {
    title: string;
    icon: React.ElementType;
    rows: SectionRow[];
    footer: string;
  }[] = [
    {
      title: "Price Analysis",
      icon: DollarSign,
      rows: [
        { label: "Current", value: `$${pa.current_price.toFixed(2)}` },
        { label: "IPO Price", value: `$${pa.ipo_price.toFixed(2)}` },
        { label: "Avg Entry", value: `$${pa.avg_entry_price.toFixed(2)}` },
        { label: "Risk to Stop", value: pa.risk_to_stop, color: "error.main" },
        { label: "To Target", value: pa.distance_to_target },
      ],
      footer: pa.trend_since_ipo,
    },
    {
      title: "Portfolio Context",
      icon: BarChart3,
      rows: [
        { label: "Days Held", value: pc.days_held },
        { label: "Exposure", value: pc.portfolio_exposure },
        {
          label: "Status",
          value: pc.performance_status.split("(")[0].trim(),
          color: pnlColor(pc.performance_status),
        },
      ],
      footer: pc.performance_status,
    },
    {
      title: "Forward Outlook",
      icon: Eye,
      rows: [
        { label: "Driver", value: fsp.sentiment_driver },
        {
          label: "Volatility",
          value: fsp.expected_volatility,
          color:
            fsp.expected_volatility === "High"
              ? "error.main"
              : fsp.expected_volatility === "Medium"
              ? "text.secondary"
              : "success.main",
        },
      ],
      footer: fsp.next_1_2_month_outlook,
    },
  ];

  return sections;
};

export const StockDetail = ({ stock, onClose }: Props) => {
  const { decision, price_analysis: pa, portfolio_context: pc, sentiment_analysis: sa, fundamental_analysis: fa, forward_sentiment_prediction: fsp } =
    stock;

  return (
    <Card elevation={0} sx={{ borderRadius: 3, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #eff6ff, #eef2ff)",
          borderBottom: "2px solid #bfdbfe",
          px: 4,
          py: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={700} color="#1e293b">
              {stock.ticker}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={0.5}>
              <ActionBadge action={decision.action} />
              <Typography variant="body2" color="#64748b">
                {decision.confidence_level} Confidence
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ConvictionStars rating={decision.conviction_rating} />
            <IconButton onClick={onClose} sx={{ color: "#64748b", "&:hover": { backgroundColor: "#e2e8f0" } }}>
              <X />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="subtitle2" mt={2} sx={{ letterSpacing: 2, textTransform: "uppercase", color: "#2563eb", fontWeight: 700 }}>
          CIO Commentary
        </Typography>
        <Typography variant="body2" mt={1} color="#334155" sx={{ lineHeight: 1.7 }}>
          {stock.cio_commentary}
        </Typography>
      </Box>

      <CardContent>
        <Grid container spacing={2} mb={3}>
          {getDetailSections(pa, pc, fsp).map((section, idx) => (
            <Grid item xs={12} md={4} key={section.title}>
              <Card
                elevation={0}
                sx={{
                  border: "1px solid rgba(15,23,42,0.08)",
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Stack direction="row" sx={{ height: "100%" }}>
                  <Box
                    sx={{
                      width: 6,
                      bgcolor: ["#22c55e", "#2563eb", "#f97316"][idx % 3],
                      borderRadius: "0 0 0 10px",
                    }}
                  />
                  <CardContent
                    sx={{
                      flex: 1,
                      bgcolor: "rgba(255,255,255,0.95)",
                      borderLeft: "2px solid transparent",
                      minHeight: 220,
                    }}
                  >
                    <SectionHeading icon={section.icon} title={section.title} />
                    {section.rows.map(({ label, value, color }, rowIdx) => (
                      <DataRow key={rowIdx} label={label} value={value} valueColor={color} />
                    ))}
                    <Typography variant="caption" color="text.secondary">
                      {section.footer}
                    </Typography>
                  </CardContent>
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} mb={3} mt={3}>
          {[
            {
              title: "Catalysts",
              icon: Zap,
              items: stock.catalysts,
              prefix: "+",
              color: "success.main",
            },
            {
              title: "Risks",
              icon: Shield,
              items: stock.risks,
              prefix: "!",
              color: "error.main",
            },
          ].map((section) => (
            <Grid item xs={12} md={6} key={section.title}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.08)",
                  minHeight: 200,
                }}
              >
                <CardContent sx={{ py: 2, px: 3 }}>
                  <SectionHeading icon={section.icon} title={section.title} />
                  <Stack spacing={1}>
                    {section.items.map((item, idx) => (
                      <Box display="flex" gap={1} key={`${section.title}-${idx}`}>
                        <Typography variant="body2" color={section.color} fontWeight={700}>
                          {section.prefix}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Grid container spacing={2} mb={3}>
          {[
            { title: "Sentiment Analysis", icon: TrendingUp, data: sa },
            { title: "Fundamentals", icon: TrendingDown, data: fa },
          ].map((section) => (
            <Grid item xs={12} lg={6} key={section.title}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.08)",
                }}
              >
                <CardContent sx={{ py: 2, px: 3 }}>
                  <SectionHeading icon={section.icon} title={section.title} />
                  <Grid container spacing={1}>
                    {Object.entries(section.data).map(([key, val]) => (
                      <Grid item xs={12} key={key}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: "#580a70" }}>
                          {key.replace(/_/g, " ")}
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {val}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* <Divider sx={{ mb: 3 }} /> */}
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <SectionHeading icon={Target} title="Suggested Positioning" />
            <Typography variant="body1" color="#410b7e">
              {stock.suggested_positioning}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

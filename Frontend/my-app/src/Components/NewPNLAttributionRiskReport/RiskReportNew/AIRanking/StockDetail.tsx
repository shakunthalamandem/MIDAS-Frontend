import React from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { ActionBadge } from "./ActionBadge";
import { ConvictionStars } from "./ConvictionStars";
import {
  BarChart3,
  DollarSign,
  Eye,
  Shield,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
  X,
} from "lucide-react";

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

const SectionHeading = ({ icon: Icon, title, color = "#002060" }: { icon: React.ElementType; title: string; color?: string }) => (
  <Box display="flex" alignItems="center" gap={1} mb={1.5}>
    <Icon size={16} color={color} />
    <Typography
      variant="subtitle2"
      sx={{
        color,
        fontWeight: 700,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        fontSize: 12,
      }}
    >
      {title}
    </Typography>
  </Box>
);

const DataRow = ({ label, value, valueColor }: { label: string; value: React.ReactNode; valueColor?: string }) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 0.6,
      borderBottom: "1px solid #f1f5f9",
      "&:last-child": { borderBottom: "none" },
    }}
  >
    <Typography variant="body2" sx={{ color: "#64748b", fontSize: 13 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ color: valueColor ?? "#1e293b", fontWeight: 700, fontSize: 13 }}>
      {value}
    </Typography>
  </Box>
);

type SectionRow = { label: string; value: React.ReactNode; color?: string };

const pnlColor = (status: string) => {
  if (status.toLowerCase().includes("winner")) return "success.main";
  if (status.toLowerCase().includes("loser")) return "error.main";
  return "text.secondary";
};

const sectionColors = [
  { accent: "#059669", bg: "#f0fdf4", border: "#bbf7d0" },
  { accent: "#2563eb", bg: "#eff6ff", border: "#bfdbfe" },
  { accent: "#ea580c", bg: "#fff7ed", border: "#fed7aa" },
];

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
        { label: "Risk to Stop", value: pa.risk_to_stop, color: "#dc2626" },
        { label: "To Target", value: pa.distance_to_target, color: "#059669" },
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
              ? "#dc2626"
              : fsp.expected_volatility === "Medium"
              ? "#64748b"
              : "#059669",
        },
      ],
      footer: fsp.next_1_2_month_outlook,
    },
  ];

  return sections;
};

export const StockDetail = ({ stock, onClose }: Props) => {
  const {
    decision,
    price_analysis: pa,
    portfolio_context: pc,
    sentiment_analysis: sa,
    fundamental_analysis: fa,
    forward_sentiment_prediction: fsp,
  } = stock;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #071852 0%, #0f2a7a 100%)",
          px: 4,
          py: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" fontWeight={800} color="#fff">
              {stock.ticker}
            </Typography>
            <Box display="flex" alignItems="center" gap={2} mt={0.5}>
              <ActionBadge action={decision.action} />
              <Typography variant="body2" color="rgba(255,255,255,0.6)">
                {decision.confidence_level} Confidence
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ConvictionStars rating={decision.conviction_rating} />
            <IconButton
              onClick={onClose}
              sx={{ color: "rgba(255,255,255,0.7)", "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" } }}
            >
              <X />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* CIO Commentary */}
      <Box
        sx={{
          backgroundColor: "#fef9c3",
          borderLeft: "4px solid #eab308",
          px: 4,
          py: 2,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#92400e",
            fontWeight: 700,
            fontSize: 11,
            mb: 0.5,
          }}
        >
          CIO Commentary
        </Typography>
        <Typography variant="body2" color="#78350f" sx={{ lineHeight: 1.7 }}>
          {stock.cio_commentary}
        </Typography>
      </Box>

      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        {/* Three detail sections */}
        <Grid container spacing={2.5} mb={3}>
          {getDetailSections(pa, pc, fsp).map((section, idx) => {
            const sc = sectionColors[idx % 3];
            return (
              <Grid item xs={12} md={4} key={section.title}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: 2.5,
                    height: "100%",
                    backgroundColor: sc.bg,
                    borderLeft: `4px solid ${sc.accent}`,
                    border: `1px solid ${sc.border}`,
                    borderLeftWidth: 4,
                    borderLeftColor: sc.accent,
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <SectionHeading icon={section.icon} title={section.title} color={sc.accent} />
                    {section.rows.map(({ label, value, color }, rowIdx) => (
                      <DataRow key={rowIdx} label={label} value={value} valueColor={color} />
                    ))}
                    <Typography
                      variant="caption"
                      sx={{ color: "#64748b", mt: 1.5, display: "block", lineHeight: 1.5 }}
                    >
                      {section.footer}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Catalysts & Risks */}
        <Grid container spacing={2.5} mb={3}>
          {[
            {
              title: "Catalysts",
              icon: Zap,
              items: stock.catalysts,
              prefix: "+",
              accent: "#059669",
              bg: "#f0fdf4",
              border: "#bbf7d0",
              textColor: "#166534",
            },
            {
              title: "Risks",
              icon: Shield,
              items: stock.risks,
              prefix: "!",
              accent: "#dc2626",
              bg: "#fef2f2",
              border: "#fecaca",
              textColor: "#991b1b",
            },
          ].map((section) => (
            <Grid item xs={12} md={6} key={section.title}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  backgroundColor: section.bg,
                  borderLeft: `4px solid ${section.accent}`,
                  border: `1px solid ${section.border}`,
                  borderLeftWidth: 4,
                  borderLeftColor: section.accent,
                  height: "100%",
                }}
              >
                <CardContent sx={{ py: 2.5, px: 3 }}>
                  <SectionHeading icon={section.icon} title={section.title} color={section.accent} />
                  <Stack spacing={1.2}>
                    {section.items.map((item, idx) => (
                      <Box display="flex" gap={1} key={`${section.title}-${idx}`}>
                        <Typography variant="body2" fontWeight={800} color={section.accent}>
                          {section.prefix}
                        </Typography>
                        <Typography variant="body2" sx={{ color: section.textColor, lineHeight: 1.6 }}>
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

        {/* Sentiment & Fundamentals */}
        <Grid container spacing={2.5} mb={3}>
          {[
            {
              title: "Sentiment Analysis",
              icon: TrendingUp,
              data: sa,
              accent: "#7c3aed",
              bg: "#faf5ff",
              border: "#e9d5ff",
            },
            {
              title: "Fundamentals",
              icon: TrendingDown,
              data: fa,
              accent: "#0369a1",
              bg: "#f0f9ff",
              border: "#bae6fd",
            },
          ].map((section) => (
            <Grid item xs={12} lg={6} key={section.title}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2.5,
                  backgroundColor: section.bg,
                  borderLeft: `4px solid ${section.accent}`,
                  border: `1px solid ${section.border}`,
                  borderLeftWidth: 4,
                  borderLeftColor: section.accent,
                  height: "100%",
                }}
              >
                <CardContent sx={{ py: 2.5, px: 3 }}>
                  <SectionHeading icon={section.icon} title={section.title} color={section.accent} />
                  <Stack spacing={1.5}>
                    {Object.entries(section.data).map(([key, val]) => (
                      <Box key={key}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 700, color: section.accent, textTransform: "capitalize", mb: 0.3 }}
                        >
                          {key.replace(/_/g, " ")}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#334155", lineHeight: 1.6 }}>
                          {val}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Suggested Positioning */}
        <Box
          sx={{
            backgroundColor: "#f0fdf4",
            borderRadius: 2.5,
            borderLeft: "4px solid #059669",
            p: 2.5,
          }}
        >
          <SectionHeading icon={Target} title="Suggested Positioning" color="#059669" />
          <Typography variant="body2" sx={{ color: "#166534", lineHeight: 1.7 }}>
            {stock.suggested_positioning}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

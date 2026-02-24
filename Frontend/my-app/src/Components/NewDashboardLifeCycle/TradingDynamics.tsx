import React, { useMemo } from "react";
import { Box, Grid, Typography, Paper, Chip } from "@mui/material";
import {
  ShowChart as ShowChartIcon,
  TrendingUp as TrendingUpIcon,
  Analytics as AnalyticsIcon,
  BarChart as BarChartIcon,
  Checklist as ChecklistIcon,
  CandlestickChart as CandlestickChartIcon,
  Assessment as AssessmentIcon,
  AutoGraph as AutoGraphIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import AIMLDealDetails from "./AIMLDealDetails";
import NewDashboardTradingWidget from "../Main/InvestmentStrategy/Tradingview/NewDashboardTradingWidget";
import TrendlyneQVTWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneQVTWidget";
import TrendlyneWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneWidget";
import TrendlyneTechnicalWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneTechnicalWidget";
import TrendlyneChecklistWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneChecklistWidget";
import NewDashboardDealPricesChart from "../AIMLResults/NewDashboardDealPricesChart";

interface TradingDynamicsProps {
  ticker: string;
  trade_date?: string;
}

const MotionBox = motion.create(Box);
const MotionPaper = motion.create(Paper);

/* ───────── Section Header ───────── */
const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  gradient: string;
  chipLabel?: string;
  chipColor?: string;
}> = ({ icon, title, subtitle, gradient, chipLabel, chipColor }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      mb: 2.5,
    }}
  >
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: "12px",
        background: gradient,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        flexShrink: 0,
      }}
    >
      {icon}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography
          sx={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "#1a1a2e",
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {chipLabel && (
          <Chip
            label={chipLabel}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              bgcolor: chipColor || "#e8f4fd",
              color: chipColor ? "#fff" : "#1565c0",
              borderRadius: "6px",
              letterSpacing: "0.03em",
            }}
          />
        )}
      </Box>
      {subtitle && (
        <Typography
          sx={{
            fontSize: "0.78rem",
            color: "#6b7280",
            fontWeight: 500,
            mt: 0.2,
          }}
        >
          {subtitle}
        </Typography>
      )}
    </Box>
  </Box>
);

/* ───────── Analysis Card Wrapper ───────── */
const AnalysisCard: React.FC<{
  children: React.ReactNode;
  accentColor: string;
  icon: React.ReactNode;
  title: string;
  tag?: string;
  tagColor?: string;
  delay?: number;
}> = ({ children, accentColor, icon, title, tag, tagColor, delay = 0 }) => (
  <MotionPaper
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.45, delay, ease: "easeOut" }}
    elevation={0}
    sx={{
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid",
      borderColor: "rgba(0,0,0,0.06)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
      transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
      "&:hover": {
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        transform: "translateY(-2px)",
      },
      height: "100%",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Accent top bar */}
    <Box
      sx={{
        height: 4,
        background: accentColor,
        width: "100%",
      }}
    />
    {/* Card header */}
    <Box
      sx={{
        px: 2.5,
        pt: 2,
        pb: 1.5,
        display: "flex",
        alignItems: "center",
        gap: 1.2,
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        bgcolor: "rgba(249,250,251,0.6)",
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "8px",
          bgcolor: `${accentColor}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accentColor,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontSize: "0.88rem",
          fontWeight: 700,
          color: "#1a1a2e",
          flex: 1,
        }}
      >
        {title}
      </Typography>
      {tag && (
        <Chip
          label={tag}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: tagColor || `${accentColor}18`,
            color: tagColor ? "#fff" : accentColor,
            borderRadius: "5px",
          }}
        />
      )}
    </Box>
    {/* Card body */}
    <Box
      sx={{
        flex: 1,
        overflow: "hidden",
      }}
    >
      {children}
    </Box>
  </MotionPaper>
);

const WIDGET_CLASS =
  "flex-1 overflow-x-auto bg-white rounded-none p-4 h-[560px]";

/* ═══════════════════════════════════════════════════════════
   TRADING DYNAMICS — Main Component
   ═══════════════════════════════════════════════════════════ */
const TradingDynamics: React.FC<TradingDynamicsProps> = ({
  ticker,
  trade_date,
}) => {
  const widgetTicker = useMemo(
    () => (ticker || "").replace(/\s*US\b/i, "").trim() || ticker,
    [ticker]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0f4ff 0%, #faf5ff 40%, #fff5f5 100%)",
        pb: 6,
      }}
    >
      {/* ────── Page Hero Header ────── */}
      <MotionBox
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #1a365d 100%)",
          borderRadius: "0 0 24px 24px",
          px: { xs: 2, md: 4 },
          pt: 3,
          pb: 3.5,
          mb: 3,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -30,
            left: "30%",
            width: 150,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)",
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "14px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 16px rgba(99,102,241,0.4)",
              }}
            >
              <ShowChartIcon sx={{ color: "#fff", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.3rem", md: "1.5rem" },
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                }}
              >
                Trading Dynamics
              </Typography>
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  mt: 0.3,
                }}
              >
                Comprehensive market analysis & AI-powered insights
              </Typography>
            </Box>
          </Box>

          {/* Ticker badge */}
          {ticker && (
            <Box sx={{ display: "flex", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Chip
                label={ticker}
                sx={{
                  bgcolor: "rgba(99,102,241,0.2)",
                  color: "#c7d2fe",
                  fontWeight: 800,
                  fontSize: "0.85rem",
                  height: 32,
                  borderRadius: "10px",
                  border: "1px solid rgba(99,102,241,0.3)",
                  letterSpacing: "0.02em",
                }}
              />
              {trade_date && (
                <Chip
                  label={`Trade Date: ${trade_date}`}
                  sx={{
                    bgcolor: "rgba(236,72,153,0.15)",
                    color: "#f9a8d4",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    height: 32,
                    borderRadius: "10px",
                    border: "1px solid rgba(236,72,153,0.25)",
                  }}
                />
              )}
            </Box>
          )}
        </Box>
      </MotionBox>

      {/* ────── Content Area ────── */}
      <Box sx={{ px: { xs: 1.5, md: 3 }, maxWidth: 1600, mx: "auto" }}>
        {/* ── Section 1: AI/ML Deal Insights ── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          sx={{ mb: 3.5 }}
        >
          <SectionHeader
            icon={<AutoGraphIcon sx={{ fontSize: 22 }} />}
            title="AI / ML Deal Insights"
            subtitle="Machine learning predictions and deal analysis"
            gradient="linear-gradient(135deg, #6366f1, #8b5cf6)"
            chipLabel="AI POWERED"
            chipColor="#7c3aed"
          />
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(99,102,241,0.12)",
              boxShadow: "0 4px 20px rgba(99,102,241,0.08)",
              overflow: "hidden",
              background: "linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)",
            }}
          >
            <Box
              sx={{
                height: 3,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa)",
              }}
            />
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <AIMLDealDetails ticker={ticker} />
            </Box>
          </Paper>
        </MotionBox>

        {/* ── Section 2: Live Trading Chart ── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          sx={{ mb: 3.5 }}
        >
          <SectionHeader
            icon={<CandlestickChartIcon sx={{ fontSize: 22 }} />}
            title="Live Trading Chart"
            subtitle="Real-time price action with advanced charting tools"
            gradient="linear-gradient(135deg, #0ea5e9, #2563eb)"
            chipLabel="LIVE"
            chipColor="#0ea5e9"
          />
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(14,165,233,0.12)",
              boxShadow: "0 4px 20px rgba(14,165,233,0.08)",
              overflow: "hidden",
              background: "#ffffff",
            }}
          >
            <Box
              sx={{
                height: 3,
                background: "linear-gradient(90deg, #0ea5e9, #2563eb, #3b82f6)",
              }}
            />
            <NewDashboardTradingWidget ticker={ticker} />
          </Paper>
        </MotionBox>

        {/* ── Section 3: Market Analysis Grid ── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.3 }}
          sx={{ mb: 3.5 }}
        >
          <SectionHeader
            icon={<AnalyticsIcon sx={{ fontSize: 22 }} />}
            title="Market Analysis & Technicals"
            subtitle="In-depth fundamental and technical indicators"
            gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
          />
          <Grid container spacing={2.5}>
            {/* QVT Widget */}
            <Grid item xs={12} md={6}>
              <AnalysisCard
                accentColor="#10b981"
                icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
                title="Quality Value Trend"
                tag="QVT Score"
                delay={0.35}
              >
                <TrendlyneQVTWidget
                  companyCode={widgetTicker}
                  companyName={widgetTicker}
                  className={WIDGET_CLASS}
                />
              </AnalysisCard>
            </Grid>

            {/* SWOT Widget */}
            <Grid item xs={12} md={6}>
              <AnalysisCard
                accentColor="#f59e0b"
                icon={<BarChartIcon sx={{ fontSize: 18 }} />}
                title="SWOT Analysis"
                tag="Fundamentals"
                delay={0.4}
              >
                <TrendlyneWidget
                  companyCode={widgetTicker}
                  companyName={widgetTicker}
                  className={WIDGET_CLASS}
                />
              </AnalysisCard>
            </Grid>

            {/* Technical Widget */}
            <Grid item xs={12} md={6}>
              <AnalysisCard
                accentColor="#8b5cf6"
                icon={<AssessmentIcon sx={{ fontSize: 18 }} />}
                title="Technical Indicators"
                tag="Signals"
                delay={0.45}
              >
                <TrendlyneTechnicalWidget
                  companyCode={widgetTicker}
                  className={WIDGET_CLASS}
                />
              </AnalysisCard>
            </Grid>

            {/* Checklist Widget */}
            <Grid item xs={12} md={6}>
              <AnalysisCard
                accentColor="#ef4444"
                icon={<ChecklistIcon sx={{ fontSize: 18 }} />}
                title="Investment Checklist"
                tag="Due Diligence"
                delay={0.5}
              >
                <TrendlyneChecklistWidget
                  companyCode={widgetTicker}
                  companyName={widgetTicker}
                  className={WIDGET_CLASS}
                />
              </AnalysisCard>
            </Grid>
          </Grid>
        </MotionBox>

        {/* ── Section 4: Deal Price Timeseries ── */}
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.55 }}
          sx={{ mb: 2 }}
        >
          <SectionHeader
            icon={<ShowChartIcon sx={{ fontSize: 22 }} />}
            title="Deal Price Timeseries"
            subtitle="Historical candlestick chart with prediction markers"
            gradient="linear-gradient(135deg, #ec4899, #f43f5e)"
          />
          <Paper
            elevation={0}
            sx={{
              borderRadius: "16px",
              border: "1px solid rgba(236,72,153,0.12)",
              boxShadow: "0 4px 20px rgba(236,72,153,0.08)",
              overflow: "hidden",
              background: "linear-gradient(135deg, #ffffff 0%, #fff5f7 100%)",
            }}
          >
            <Box
              sx={{
                height: 3,
                background: "linear-gradient(90deg, #ec4899, #f43f5e, #ef4444)",
              }}
            />
            <Box sx={{ p: { xs: 1, md: 2 } }}>
              <NewDashboardDealPricesChart
                ticker={ticker}
                trade_date={trade_date}
              />
            </Box>
          </Paper>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default TradingDynamics;

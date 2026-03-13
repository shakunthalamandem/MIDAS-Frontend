// components/AIMLResults/AIMLDealInsightsPanel.tsx
import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import type { DealRecord } from "../AIMLResults/types";
import DealHeaderHero from "./DealHeaderHero";
import PredictionCard from "./PredictionCard";

type Props = { deal: DealRecord };

function toNumber(v: number | string | null | undefined): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const n = Number(String(v).replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

function fmtPlain(v: any): string {
  if (v === null || v === undefined || String(v).trim() === "") return "-";
  return String(v);
}

function fmtMoney(
  v: number | string | null | undefined,
  currency = "$",
): string {
  const n = toNumber(v);
  if (n === null) return "-";
  const abs = Math.abs(n);
  if (abs >= 1_000_000_000)
    return `${currency}${(n / 1_000_000_000).toFixed(1)}B`;
  if (abs >= 1_000_000) return `${currency}${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${currency}${n.toLocaleString()}`;
  return `${currency}${n}`;
}

function fmtPct(v: number | string | null | undefined, digits = 1): string {
  const n = toNumber(v);
  if (n === null) return "-";
  return `${n.toFixed(digits)}%`;
}

function StatRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        py: 1,
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "#000000",
            fontWeight: 700,
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </Typography>
        {hint ? (
          <Tooltip title={hint} arrow>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ cursor: "help" }}
            >
              ⓘ
            </Typography>
          </Tooltip>
        ) : null}
      </Box>

      <Typography
        variant="body2"
        sx={{
          fontWeight: 900,
          color: "text.primary",
          textAlign: "right",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "65%",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function FancyCard({
  title,
  children,
  tone = "cool",
}: {
  title: string;
  children: React.ReactNode;
  tone?: "cool" | "neutral";
}) {
  const bg =
    tone === "cool"
      ? "linear-gradient(180deg, rgba(33,150,243,0.10), rgba(33,150,243,0.02))"
      : "linear-gradient(180deg, rgba(148,163,184,0.10), rgba(148,163,184,0.02))";

  return (
    <Box
      sx={{
        borderRadius: 4,
        height: "100%",
        bgcolor: "#FFFFFF",
        border: "1px solid #EEF2F7",
        backgroundImage: bg,
        boxShadow: "0 10px 24px rgba(16, 24, 40, 0.08)",
        p: 2.25,
        transition: "transform 180ms ease, box-shadow 180ms ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 14px 30px rgba(16, 24, 40, 0.12)",
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 1000, letterSpacing: 0.4, mb: 1.25 }}
      >
        {title.toUpperCase()}
      </Typography>
      <Divider sx={{ mb: 1.25, borderColor: "#EEF2F7" }} />
      {children}
    </Box>
  );
}

const AIMLDealInsightsPanel: React.FC<Props> = ({ deal }) => {
  const theme = useTheme();

  const priceChangeT1dToIssue = (() => {
    const prev = toNumber(deal.previous_day_close_price);
    const issue = toNumber(deal.issue_price);
    if (prev === null || issue === null || issue === 0) return null;
    return ((issue - prev) / issue) * 100;
  })();

  return (
    <Box sx={{ mt: 2 }}>
      <Box
        sx={{
          borderRadius: 4,
          p: 0,
          background:
            theme.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(144,202,249,0.06), rgba(0,0,0,0))"
              : "linear-gradient(180deg, rgba(59,130,246,0.06), rgba(255,255,255,0))",
        }}
      >
        {/* ✅ Premium Header */}
        <DealHeaderHero deal={deal} fmtPlain={fmtPlain} fmtMoney={fmtMoney} />

        {/* ✅ Model Inputs Accordion */}
        <Accordion
          defaultExpanded={false}
          disableGutters
          sx={{
            mt: 2,
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid #EEF2F7",
            boxShadow: "0 10px 24px rgba(16, 24, 40, 0.06)",
            "&:before": { display: "none" },
          }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.2,
                px: 2.25,
                py: 1.25,
                borderRadius: 999,
                background: "linear-gradient(135deg, #f5f7ff, #e8ecff)",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.08)",
                width: "fit-content",
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 22, color: "#3f51b5" }} />
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 14,
                  color: "#1a237e",
                  letterSpacing: 0.4,
                }}
              >
                Key Input Factors for Model Prediction
              </Typography>
            </Box>
          </AccordionSummary>

          <AccordionDetails sx={{ bgcolor: "#FFFFFF" }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FancyCard title="Deal Overview" tone="cool">
                  <StatRow label="Region" value={fmtPlain(deal.region)} />
                  <StatRow
                    label="Ticker Symbol"
                    value={fmtPlain(deal.ticker)}
                  />
                  <StatRow
                    label="Pricing Date"
                    value={fmtPlain(deal.trade_date)}
                  />
                  <StatRow label="Deal Status" value={"Price Range"} />
                  <StatRow
                    label="Issue Price"
                    value={fmtMoney(deal.issue_price)}
                  />
                  <StatRow label="Sector" value={fmtPlain(deal.sector)} />
                </FancyCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <FancyCard title="Deal & Allocation" tone="neutral">
                  <StatRow label="Deal Size" value={fmtMoney(deal.deal_size)} />
                  <StatRow
                    label="Sponsor (Y/N)"
                    value={fmtPlain(deal.sponsor)}
                  />
                  <StatRow
                    label="Percentage Primary"
                    value={fmtPct(deal.primary_percentage, 1)}
                  />
                  <StatRow
                    label="Selected Bank"
                    value={fmtPlain(deal.lead_bank)}
                  />
                  <StatRow
                    label="Alloc. % of Deal Size"
                    value={fmtPct(
                      deal.allocation_as_percentage_of_deal_size,
                      1,
                    )}
                    hint="Allocation as a % of deal size"
                  />
                  <StatRow
                    label="Alloc. % of IOI"
                    value={fmtPct(deal.allocation_as_percentage_of_ioi, 1)}
                    hint="Allocation as a % of IOI"
                  />
                  <StatRow
                    label="Discount from Announcement"
                    value={fmtPct(deal.discount_from_announcement_price, 1)}
                  />
                </FancyCard>
              </Grid>

              <Grid item xs={12} md={4}>
                <FancyCard title="Metrics & Price Action" tone="cool">
                  <StatRow
                    label="Current Year Revenue"
                    value={fmtMoney(deal.revenue)}
                  />
                  <StatRow
                    label="Revenue Growth (YOY)"
                    value={fmtPct(deal.revenue_growth, 1)}
                  />
                  <StatRow
                    label="Net Profit Margin"
                    value={fmtPct(deal.net_profit_margin, 1)}
                  />
                  <StatRow
                    label="T-1D Close Price"
                    value={fmtMoney(deal.previous_day_close_price)}
                  />
                  <StatRow
                    label="Price Change (T-1D to Issue)"
                    value={
                      priceChangeT1dToIssue === null
                        ? "-"
                        : fmtPct(priceChangeT1dToIssue, 1)
                    }
                  />
                </FancyCard>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>

        {/* ✅ Predictions Section */}
        <Box
          sx={{
            mt: 2,
            p: 2.5,
            borderRadius: 4,
            bgcolor: "#FBF8E7",
            border: "1px solid #F3EFD8",
            boxShadow: "0 10px 24px rgba(16, 24, 40, 0.06)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 1100, mb: 0.5 }}>
            Factors Based Agent predictions & outcomes
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#111827", opacity: 0.75, fontWeight: 600, mb: 2 }}
          >
            AI-powered forecasts compared to actual market performance
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <PredictionCard
                title="1st Day Close from Issue Price"
                dirRaw={fmtPlain(deal.t1d_pred)}
                confidence={deal.t1d_confidence}
                actualReturn={deal.t1d_actual_return}
                fmtPct={fmtPct}
                toNumber={toNumber}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <PredictionCard
                title="1st Day Close from Open Price"
                dirRaw={fmtPlain(deal.t1d_openprice_pred)}
                confidence={deal.t1d_openprice_confidence}
                actualReturn={deal.t1d_openprice_actual_return}
                fmtPct={fmtPct}
                toNumber={toNumber}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <PredictionCard
                title="1 Week Close from 1st Day Close"
                dirRaw={fmtPlain(deal.t1w_pred)}
                confidence={deal.t1w_confidence}
                actualReturn={deal.t1w_actual_return}
                fmtPct={fmtPct}
                toNumber={toNumber}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <PredictionCard
                title="1 Month Close from 1st Day Close"
                dirRaw={fmtPlain(deal.t1m_pred)}
                confidence={deal.t1m_confidence}
                actualReturn={deal.t1m_actual_return}
                fmtPct={fmtPct}
                toNumber={toNumber}
              />
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AIMLDealInsightsPanel;
import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import { formatDate, formatTwoDecimals } from "./NewDashboardLifeCycleUtils";
import NewDashboardLifeCycleComparableTable from "./NewDashboardLifeCycleComparableTable";

type OverviewResponse = {
  data?: {
    deal_data?: Record<string, any>;
    comparable_company_metrics?: Array<Record<string, any>>;
  };
};

type NewDashboardLifeCycleOverviewFOProps = {
  ticker: string;
  pricingDate?: string | null;
};

const splitBullets = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-\s]+/, "").trim())
    .filter(Boolean);
};

  const formatNumber = (value: any, options?: Intl.NumberFormatOptions) => {
    if (value === null || value === undefined) return "N/A";
    const num = Number(value);
  if (Number.isNaN(num)) return "N/A";
  return new Intl.NumberFormat("en-US", options).format(num);
};

  const formatCurrency = (value: any) =>
  formatNumber(value, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

  const formatPercent = (value: any) => {
  if (value === null || value === undefined) return "N/A";
  const num = Number(value);
  if (Number.isNaN(num)) return "N/A";
  return `${formatTwoDecimals(num)}%`;
};

const NewDashboardLifeCycleOverviewFO: React.FC<NewDashboardLifeCycleOverviewFOProps> = ({
  ticker,
  pricingDate,
}) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<OverviewResponse["data"] | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    if (!apiUrl || !ticker) return;
    let isActive = true;

    const fetchOverview = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${apiUrl}/api/new_dashboard_maincycle/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token") || ""}`,
          },
          body: JSON.stringify({
            operation: "fo",
            ticker,
            pricing_date: pricingDate ?? "",
          }),
        });
        if (!response.ok) throw new Error("Failed to load overview");
        const data: OverviewResponse = await response.json();
        if (isActive) setPayload(data?.data ?? null);
      } catch (error) {
        console.error("FO overview fetch failed", error);
        if (isActive) setPayload(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchOverview();
    return () => {
      isActive = false;
    };
  }, [apiUrl, ticker, pricingDate]);

  const dealData = payload?.deal_data ?? {};
  const comparables = payload?.comparable_company_metrics ?? [];
  const overviewLines = splitBullets(dealData?.company_overview);
  const highlightLines = splitBullets(dealData?.business_highlights);

  const headerChips = useMemo(
    () => [
      { label: dealData?.deal_id || "Deal", icon: <BusinessOutlinedIcon fontSize="small" /> },
      { label: dealData?.ticker || ticker, icon: <BusinessOutlinedIcon fontSize="small" /> },
      { label: formatDate(dealData?.pricing_date), icon: <CalendarMonthOutlinedIcon fontSize="small" /> },
      { label: dealData?.industry || "Industry", icon: <CategoryOutlinedIcon fontSize="small" /> },
    ],
    [dealData, ticker]
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payload) {
    return (
      <Paper sx={{ p: 3, borderRadius: 3, backgroundColor: "#f8fafc" }}>
        <Typography sx={{ fontWeight: 700, color: "#0f172a" }}>
          Overview data not available
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please try another ticker or refresh.
        </Typography>
      </Paper>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#0b1844", mb: 1 }}>
          {dealData?.ticker || ticker}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {headerChips.map((chip) => (
            <Chip
              key={chip.label}
              icon={chip.icon}
              label={chip.label}
              sx={{ bgcolor: "#eef2ff", color: "#1d4ed8", fontWeight: 600 }}
            />
          ))}
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  backgroundColor: "#eef2ff",
                  borderRadius: 2,
                  py: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
                >
                  Company Overview
                </Typography>
              </Box>
              {overviewLines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Overview not available.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {overviewLines.map((line, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: "#334155" }}>
                      - {line}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <Stack spacing={1.5}>
              <Box
                sx={{
                  backgroundColor: "#eef2ff",
                  borderRadius: 2,
                  py: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
                >
                  Business Highlights
                </Typography>
              </Box>
              {highlightLines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Highlights not available.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {highlightLines.slice(0, 6).map((line, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: "#334155" }}>
                      - {line}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Box
          sx={{
            backgroundColor: "#eef2ff",
            borderRadius: 2,
            py: 1,
            mb: 2,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
          >
            Deal Snapshot
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {[
            {
              label: "Current Share Price",
              value: formatCurrency(dealData?.current_share_price),
              icon: <PaidOutlinedIcon fontSize="small" />,
            },
            {
              label: "Current Market Cap",
              value: formatCurrency(dealData?.current_market_cap),
              icon: <InsightsOutlinedIcon fontSize="small" />,
            },
            {
              label: "Shares Offered",
              value: formatNumber(dealData?.shares_offered),
              icon: <GroupOutlinedIcon fontSize="small" />,
            },
            {
              label: "Shares Outstanding",
              value: formatNumber(dealData?.number_of_shares_outstanding),
              icon: <GroupOutlinedIcon fontSize="small" />,
            },
            {
              label: "Float % of Shares",
              value: formatPercent(dealData?.float_as_percent_shares_outstanding),
              icon: <TrendingUpOutlinedIcon fontSize="small" />,
            },
            {
              label: "Short Interest % Float",
              value: formatPercent(dealData?.short_interest_as_percent_float),
              icon: <TrendingUpOutlinedIcon fontSize="small" />,
            },
            {
              label: "Mean Target Price",
              value: formatCurrency(dealData?.mean_target_price),
              icon: <PaidOutlinedIcon fontSize="small" />,
            },
            {
              label: "Consensus",
              value: dealData?.concensus_recomendations ?? "N/A",
              icon: <InsightsOutlinedIcon fontSize="small" />,
            },
          ].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.label}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                  height: "100%",
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <Box
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: "#e8efff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {React.cloneElement(item.icon, { sx: { color: "#2f6fed" } })}
                    </Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.label}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {item.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Box
          sx={{
            backgroundColor: "#eef2ff",
            borderRadius: 2,
            py: 1,
            mb: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
          >
            Comparable Metrics
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <NewDashboardLifeCycleComparableTable rows={comparables} />
      </Paper>
    </Stack>
  );
};

export default NewDashboardLifeCycleOverviewFO;

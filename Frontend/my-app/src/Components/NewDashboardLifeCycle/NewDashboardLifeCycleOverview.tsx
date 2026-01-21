import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CategoryOutlinedIcon from "@mui/icons-material/CategoryOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import { formatDate, formatDateISO, formatTwoDecimals } from "./NewDashboardLifeCycleUtils";
import NewDashboardLifeCycleComparableTable from "./NewDashboardLifeCycleComparableTable";

type OverviewResponse = {
  data?: {
    deal_data?: Record<string, any>;
    financial_forecasts?: Array<Record<string, any>>;
    comparable_company_metrics?: Array<Record<string, any>>;
  };
};

type NewDashboardLifeCycleOverviewProps = {
  ticker: string;
  pricingDate?: string | null;
  dealType?: string | null;
};

const splitBullets = (value?: string | null) => {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.replace(/^[-\s]+/, "").trim())
    .filter(Boolean);
};

const NewDashboardLifeCycleOverview: React.FC<NewDashboardLifeCycleOverviewProps> = ({
  ticker,
  pricingDate,
  dealType,
}) => {
  const [loading, setLoading] = useState(false);
  const [payload, setPayload] = useState<OverviewResponse["data"] | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const isIpo = String(dealType || "").toUpperCase() === "IPO";

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
            operation: isIpo ? "ipo" : "fo",
            ticker,
            pricing_date: isIpo ? undefined : pricingDate ?? "",
          }),
        });
        if (!response.ok) throw new Error("Failed to load overview");
        const data: OverviewResponse = await response.json();
        if (isActive) setPayload(data?.data ?? null);
      } catch (error) {
        console.error("Overview fetch failed", error);
        if (isActive) setPayload(null);
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchOverview();
    return () => {
      isActive = false;
    };
  }, [apiUrl, ticker, pricingDate, isIpo]);

  const dealData = payload?.deal_data ?? {};
  const overviewLines = splitBullets(dealData?.business_overview);
  const summaryLines = splitBullets(dealData?.differentiated_summary);
  const valuationLines = splitBullets(dealData?.valuation);

  const financialForecasts = payload?.financial_forecasts ?? [];
  const comparables = payload?.comparable_company_metrics ?? [];

  const summaryChips = useMemo(() => {
    return [
      { label: dealData?.ticker_name || ticker, icon: <BusinessOutlinedIcon fontSize="small" /> },
      { label: dealData?.company_name || "Company", icon: <BusinessOutlinedIcon fontSize="small" /> },
      { label: formatDate(dealData?.pricing_date), icon: <EventAvailableOutlinedIcon fontSize="small" /> },
      { label: dealData?.deal_type || dealType || "Deal", icon: <PaidOutlinedIcon fontSize="small" /> },
      { label: dealData?.region || "Region", icon: <CategoryOutlinedIcon fontSize="small" /> },
    ];
  }, [dealData, ticker, dealType]);

  const dateTimeline = [
    { label: "Filed Date", value: dealData?.filed_date },
    { label: "Pricing Range Date", value: dealData?.term_date },
    { label: "Pricing Date", value: dealData?.pricing_date },
    { label: "First Trade Date", value: dealData?.trade_date },
  ];

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
          {dealData?.company_name || ticker}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {summaryChips.map((chip) => (
            <Chip
              key={chip.label}
              icon={chip.icon}
              label={chip.label}
              sx={{
                bgcolor: "#eef2ff",
                color: "#1d4ed8",
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
        <Box
          sx={{
            mt: 2.5,
            px: { xs: 0, md: 2 },
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 22,
              left: 8,
              right: 8,
              height: 2,
              backgroundColor: "#c7d2fe",
            }}
          />
          <Grid container spacing={2} justifyContent="space-between" sx={{ position: "relative" }}>
            {dateTimeline.map((item) => (
              <Grid item xs={6} md={3} key={item.label}>
                <Stack spacing={0.5} alignItems="center">
                  <Box
                    sx={{
                      width: 14,
                      height: 14,
                      borderRadius: "50%",
                      backgroundColor: "#1e3a8a",
                    }}
                  />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#0b1844" }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155" }}>
                    {formatDateISO(item.value)}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
            <Stack spacing={1.5}>
              <Box sx={{ backgroundColor: "#eef2ff", borderRadius: 2, py: 1 }}>
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
              <Box sx={{ backgroundColor: "#eef2ff", borderRadius: 2, py: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
                >
                  Differentiated Summary
                </Typography>
              </Box>
              {summaryLines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Summary not available.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {summaryLines.slice(0, 6).map((line, idx) => (
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
        <Box sx={{ backgroundColor: "#eef2ff", borderRadius: 2, py: 1, mb: 1 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
          >
            Valuation Highlights
          </Typography>
        </Box>
        {valuationLines.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Valuation data not available.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {valuationLines.map((line, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: "#334155" }}>
                - {line}
              </Typography>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Box sx={{ backgroundColor: "#eef2ff", borderRadius: 2, py: 1, mb: 2 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, color: "#002060", textAlign: "center" }}
          >
            Financial Forecasts
          </Typography>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f1f5ff" }}>
              <TableCell sx={{ fontWeight: 700, color: "#0b1844" }}>Metric</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#0b1844" }}>Current Year</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#0b1844" }}>1Y Later</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#0b1844" }}>2Y Later</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {financialForecasts.map((item, idx) => (
              <TableRow key={`${item.metric_name}-${idx}`}>
                <TableCell sx={{ fontWeight: 600 }}>{item.metric_name || "N/A"}</TableCell>
                <TableCell>{formatTwoDecimals(item.current_year)}</TableCell>
                <TableCell>{formatTwoDecimals(item.one_year_later)}</TableCell>
                <TableCell>{formatTwoDecimals(item.two_years_later)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}>
        <Box sx={{ backgroundColor: "#eef2ff", borderRadius: 2, py: 1, mb: 1 }}>
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

export default NewDashboardLifeCycleOverview;

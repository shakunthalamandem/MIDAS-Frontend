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
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { formatDate } from "./NewDashboardLifeCycleUtils";

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
    .map((line) => line.replace(/^[-•\s]+/, "").trim())
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
          background: "linear-gradient(180deg, #ffffff 0%, #f7f9ff 100%)",
          border: "1px solid #e2e8f0",
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
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff" }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Company Overview
              </Typography>
              {overviewLines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Overview not available.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {overviewLines.map((line, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: "#334155" }}>
                      • {line}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff" }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                Differentiated Summary
              </Typography>
              {summaryLines.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Summary not available.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {summaryLines.slice(0, 6).map((line, idx) => (
                    <Typography key={idx} variant="body2" sx={{ color: "#334155" }}>
                      • {line}
                    </Typography>
                  ))}
                </Stack>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
          Valuation Highlights
        </Typography>
        {valuationLines.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Valuation data not available.
          </Typography>
        ) : (
          <Stack spacing={1}>
            {valuationLines.map((line, idx) => (
              <Typography key={idx} variant="body2" sx={{ color: "#334155" }}>
                • {line}
              </Typography>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
          Financial Forecasts
        </Typography>
        <Grid container spacing={2}>
          {financialForecasts.slice(0, 6).map((item, idx) => (
            <Grid item xs={12} sm={6} md={4} key={`${item.metric_name}-${idx}`}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <TrendingUpOutlinedIcon fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {item.metric_name}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Current: {item.current_year ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Next: {item.one_year_later ?? "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Paper sx={{ p: 2.5, borderRadius: 3, backgroundColor: "#ffffff" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a", mb: 1 }}>
          Comparable Metrics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          {comparables.slice(0, 6).map((row, idx) => (
            <Grid item xs={12} sm={6} md={4} key={`${row.competitor}-${idx}`}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: "1px solid #e2e8f0",
                  backgroundColor: "#f8fafc",
                }}
              >
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                    <InsightsOutlinedIcon fontSize="small" />
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {row.competitor}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    EV/Sales: {row.present_year_ev_sales ?? "N/A"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    EV/EBITDA: {row.present_year_ev_ebitda ?? "N/A"}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
};

export default NewDashboardLifeCycleOverview;

import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Grid } from "@mui/material";
import DashboardStateCard from "../../NewDashboardLifeCycle/DashboardStateCard";

interface TechnicalAgentTabProps {
  ticker?: string;
  dealType?: string;
}

interface TechnicalData {
  ticker: string;
  deal_type?: string;
  rsi?: number;
  dma9?: number;
  dma20?: number;
  dma50?: number;
  dma200?: number;
  price?: number;
  volume?: number;
  triggers_fired?: any;
  full_data?: any;
}

const TechnicalAgentTab: React.FC<TechnicalAgentTabProps> = ({ ticker, dealType }) => {
  const [data, setData] = useState<TechnicalData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnicalData = async () => {
      if (!ticker) return;

      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("access_token");

        const payload: any = {
          ticker: ticker.trim(),
        };

        if (dealType) {
          payload.deal_type = dealType;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/get_technical_analysis_by_ticker/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        setData(responseData);
      } catch (err: any) {
        console.error("Error fetching technical data:", err);
        setError(err.message || "Failed to load technical analysis");
      } finally {
        setLoading(false);
      }
    };

    fetchTechnicalData();
  }, [ticker, dealType]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <DashboardStateCard
        variant="empty"
        title="No data available"
        message="Technical Agent data not available for this ticker."
      />
    );
  }

  const formatValue = (value: number | null | undefined, isCurrency = true) => {
    if (value === undefined || value === null) return "—";
    if (isCurrency) return `$${value.toFixed(2)}`;
    if (value > 1000) return (value as number).toLocaleString();
    return value.toFixed(2);
  };

  const technicalMetrics = [
    { label: "Price", value: data?.price, isCurrency: true },
    { label: "RSI", value: data?.rsi, isCurrency: false },
    { label: "DMA 9", value: data?.dma9, isCurrency: true },
    { label: "DMA 20", value: data?.dma20, isCurrency: true },
    { label: "DMA 50", value: data?.dma50, isCurrency: true },
    { label: "DMA 200", value: data?.dma200, isCurrency: true },
  ];

  const tradingMetrics = [
    { label: "Volume", value: data?.volume, isCurrency: false },
    { label: "Avg Volume", value: data?.full_data?.avg_vol, isCurrency: false },
    { label: "DTD PnL", value: data?.full_data?.dtd_pnl, isCurrency: true },
    { label: "Target Price", value: data?.full_data?.target_price, isCurrency: true },
    { label: "Ultimate Stop", value: data?.full_data?.ultimate_stop, isCurrency: true },
    { label: "Vol 60", value: data?.full_data?.vol60, isCurrency: false },
  ];

  const renderTable = (metrics: typeof technicalMetrics, title: string) => (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#1976d2", fontSize: "0.95rem" }}>
        {title}
      </Typography>
      <TableContainer sx={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)", borderRadius: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
              <TableCell sx={{ fontWeight: 700, color: "#1976d2", width: "50%" }}>Metric</TableCell>
              <TableCell sx={{ fontWeight: 700, color: "#1976d2", width: "50%" }}>Value</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {metrics.map((metric, idx) => (
              <TableRow key={idx} sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}>
                <TableCell sx={{ color: "#666", fontWeight: 500, fontSize: "0.9rem" }}>
                  {metric.label}
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1a1a1a", fontSize: "0.95rem" }}>
                  {formatValue(metric.value, metric.isCurrency)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  return (
    <Box sx={{ p: 0 }}>
      {data ? (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              {renderTable(technicalMetrics, "Technical Indicators")}
            </Grid>
            <Grid item xs={12} md={6}>
              {renderTable(tradingMetrics, "Trading Metrics")}
            </Grid>
          </Grid>

          {data.triggers_fired && (
            <Paper sx={{ p: 2.5, backgroundColor: "#f5f5f5", borderLeft: "4px solid #1976d2" }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: "#1976d2" }}>
                Triggers Fired
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {Array.isArray(data.triggers_fired) ? (
                  data.triggers_fired.map((trigger: string, idx: number) => (
                    <Chip
                      key={idx}
                      label={trigger}
                      size="small"
                      sx={{
                        backgroundColor: "#e3f2fd",
                        color: "#1976d2",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2">{data.triggers_fired}</Typography>
                )}
              </Box>
            </Paper>
          )}
        </Box>
      ) : (
        <Paper sx={{ p: 3, textAlign: "center" }}>
          <Typography color="textSecondary">No data available</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default TechnicalAgentTab;

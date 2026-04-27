import React, { useEffect, useState } from "react";
import { Box, CircularProgress, Alert, Paper, Typography, Grid, Card, CardContent } from "@mui/material";

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
    return <Alert severity="error">{error}</Alert>;
  }

  const MetricCard = ({ label, value, isCurrency = true }: { label: string; value?: number | null; isCurrency?: boolean }) => (
    <Card sx={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
      <CardContent sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: "#666", fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a", mt: 0.5 }}>
          {value !== undefined && value !== null ? (
            isCurrency ? `$${value.toFixed(2)}` : value.toFixed(2)
          ) : (
            "—"
          )}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 0 }}>
      {data ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
            Technical Analysis
          </Typography>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            {data.price !== undefined && data.price !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard label="Price" value={data.price} />
              </Grid>
            )}
            {data.rsi !== undefined && data.rsi !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard label="RSI" value={data.rsi} isCurrency={false} />
              </Grid>
            )}
            {data.dma9 !== undefined && data.dma9 !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard label="DMA 9" value={data.dma9} />
              </Grid>
            )}
            {data.dma20 !== undefined && data.dma20 !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard label="DMA 20" value={data.dma20} />
              </Grid>
            )}
            {data.dma50 !== undefined && data.dma50 !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard label="DMA 50" value={data.dma50} />
              </Grid>
            )}
            {data.dma200 !== undefined && data.dma200 !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <MetricCard label="DMA 200" value={data.dma200} />
              </Grid>
            )}
            {data.volume !== undefined && data.volume !== null && (
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="caption" sx={{ color: "#666", fontWeight: 500 }}>
                      Volume
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: "#1a1a1a", mt: 0.5 }}>
                      {(data.volume as number)?.toLocaleString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>

          {data.triggers_fired && (
            <Card sx={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Triggers Fired
                </Typography>
                <Typography variant="body2">
                  {Array.isArray(data.triggers_fired) ? data.triggers_fired.join(", ") : data.triggers_fired}
                </Typography>
              </CardContent>
            </Card>
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

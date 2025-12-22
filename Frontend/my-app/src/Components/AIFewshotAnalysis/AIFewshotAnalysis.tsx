import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { DataGrid, type GridColDef, type GridRowParams } from "@mui/x-data-grid";
import AiAnalysis from "./AiAnalysis";

type ApiState = "idle" | "loading" | "success" | "error";

type TickerItem = {
  ticker: string;
  pricing_date?: string | null;
  deal_colour_present?: string;
  deal_captain?: string;
  deal_type?: string;
  allocation_as_percentage_of_deal_size?: number;
};

const formatPricingDate = (dateStr?: string | null) => {
  if (!dateStr) return "N/A";
  return dateStr;
};

const formatAllocation = (value?: number) => {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(2)}%`;
};

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const SelectedTickerDetails: React.FC<{ ticker: TickerItem | null }> = ({ ticker }) => (
  <Card elevation={3} sx={{ borderRadius: 3 }}>
    <CardHeader
      title={
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Selected ticker details
        </Typography>
      }
      subheader={
        <Typography variant="body2" color="text.secondary">
          Click a row above to preview the ticker details.
        </Typography>
      }
      sx={{ pb: 0 }}
    />
    <CardContent>
      {ticker ? (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Ticker
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{ticker.ticker}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Pricing Date
            </Typography>
            <Typography>{formatPricingDate(ticker.pricing_date)}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Deal Colour Present
            </Typography>
            <Typography>{ticker.deal_colour_present || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Deal Captain
            </Typography>
            <Typography>{ticker.deal_captain || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Deal Type
            </Typography>
            <Typography>{ticker.deal_type || "N/A"}</Typography>
          </Box>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Allocation (% of deal size)
            </Typography>
            <Typography>{formatAllocation(ticker.allocation_as_percentage_of_deal_size)}</Typography>
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          No ticker selected yet.
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AIFewshotAnalysis: React.FC = () => {
  const API_URL = process.env.REACT_APP_API_URL;

  const [tickers, setTickers] = useState<TickerItem[]>([]);
  const [status, setStatus] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | number | null>(null);

  const loadTickers = async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      if (!API_URL) {
        throw new Error("REACT_APP_API_URL is not set.");
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...getAuthHeaders(),
      };

      const res = await fetch(`${API_URL}/api/unified_new_deal_data/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type: "ticker_list" }),
      });

      const text = await res.text();
      const data = text ? JSON.parse(text) : null;

      if (!res.ok) {
        throw new Error(data?.error || data?.detail || "Failed to load tickers");
      }

      const items = Array.isArray(data?.tickers) ? (data.tickers as TickerItem[]) : [];
      setTickers(items);
      setStatus("success");
    } catch (error: any) {
      console.error("Error fetching tickers:", error);
      setStatus("error");
      setErrorMessage(error?.message || "Could not load tickers. Please retry.");
    }
  };

  useEffect(() => {
    if (!API_URL) {
      setErrorMessage("REACT_APP_API_URL is not set.");
      setStatus("error");
      return;
    }
    loadTickers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [API_URL]);

  const isLoading = status === "loading";
  const hasError = status === "error";

  const rows = useMemo(
    () =>
      tickers.map((item, idx) => ({
        id: `${item.ticker}-${item.pricing_date ?? idx}`,
        ...item,
      })),
    [tickers]
  );

  const columns = useMemo<GridColDef[]>(
    () => [
      { field: "ticker", headerName: "Ticker", flex: 1, minWidth: 140 },
      {
        field: "pricing_date",
        headerName: "Pricing Date",
        flex: 1,
        minWidth: 140,
        valueFormatter: (params) => formatPricingDate(params as string | null),
      },
      { field: "deal_colour_present", headerName: "Deal Colour Present", flex: 1, minWidth: 170 },
      { field: "deal_captain", headerName: "Deal Captain", flex: 1, minWidth: 140 },
      { field: "deal_type", headerName: "Deal Type", flex: 1, minWidth: 120 },
      {
        field: "allocation_as_percentage_of_deal_size",
        headerName: "Allocation (% of deal size)",
        flex: 1,
        minWidth: 210,
        valueFormatter: (params) => formatAllocation(params as number | undefined),
      },
    ],
    []
  );

  const handleRowClick = (params: GridRowParams) => {
    setSelectedId(params.id);
  };

  const selectedTicker = useMemo(
    () => rows.find((row) => row.id === selectedId) ?? null,
    [rows, selectedId]
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: 6,
        mt: 5,
        background:
          "linear-gradient(180deg, rgba(248,250,252,1) 0%, rgba(255,255,255,1) 40%, rgba(255,255,255,1) 100%)",
      }}
    >
      <Box sx={{ maxWidth: 1100, mx: "auto", px: { xs: 2, sm: 3, lg: 4 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              height: 44,
              width: 44,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              bgcolor: "primary.main",
              color: "primary.contrastText",
              opacity: 0.9,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 800, color: "inherit" }}>
              AI
            </Typography>
          </Box>

          <Box>
            <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 600, letterSpacing: 1 }}>
              Few-shot AI Analysis
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.1 }}>
              Ticker list
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live data pulled from the unified deal data API, rendered in a table.
            </Typography>
          </Box>
        </Box>

        <Card elevation={6} sx={{ borderRadius: 3 }}>
          <CardHeader
            title={
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Available tickers
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={isLoading ? <CircularProgress size={16} /> : <RefreshIcon />}
                  onClick={loadTickers}
                  disabled={isLoading}
                  sx={{ borderRadius: 999 }}
                >
                  Refresh
                </Button>
              </Box>
            }
            sx={{ pb: 0 }}
          />

          <CardContent>
            {hasError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <Box sx={{ height: 520, width: "100%", mt: 1 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={isLoading}
                checkboxSelection={false}
                onRowClick={handleRowClick}
                rowHeight={35}
                disableRowSelectionOnClick
                getRowClassName={(params) => (selectedId === params.id ? "Mui-selected" : "")}
                sx={{
                  "& .MuiDataGrid-container--top [role='row']": {
                    backgroundColor: "#002060",
                    color: "#FFFFFF",
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#cad0f1ff !important",
                  },
                  "& .MuiDataGrid-columnHeader .MuiDataGrid-sortIcon": {
                    color: "#FFFFFF",
                  },
                  cursor: "pointer",
                  border: "1px solid #ccccccff",
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3 }}>
          <SelectedTickerDetails ticker={selectedTicker} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Card elevation={3} sx={{ borderRadius: 3 }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  AI review
                </Typography>
              }
              subheader={
                <Typography variant="body2" color="text.secondary">
                  Clicking a ticker above will load the few-shot review from the API.
                </Typography>
              }
            />
            <CardContent>
              <AiAnalysis ticker={selectedTicker?.ticker ?? null} />
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default AIFewshotAnalysis;

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  CircularProgress,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Tooltip,
  Collapse,
  Typography,
  TextField,
  InputAdornment,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import SearchIcon from "@mui/icons-material/Search";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import {
  DataGrid,
  GridColDef,
  GridSortModel,
  GridToolbarExport,
  GridToolbarQuickFilter,
} from "@mui/x-data-grid";
import type { TickerItem, AttributionGroupBy } from "./types";
import { formatCurrency } from "./utils";
import "./AttributionDetail.css";

const apiUrl = process.env.REACT_APP_API_URL;
const FONT = "Inter, ui-sans-serif, system-ui, sans-serif";
const formatPctVal = (value: number) => `${value.toFixed(2)}%`;

const GROUP_BY_LABELS: Record<AttributionGroupBy, string> = {
  analyst: "Analyst",
  sector: "Sector",
  industry: "Industry",
  holding_period: "Holding Period",
  issuer: "Issuer",
};

/* Sub-filters available for each main groupBy tab */
const SUB_FILTERS: Record<AttributionGroupBy, AttributionGroupBy[]> = {
  analyst: ["sector", "industry"],
  sector: ["analyst", "industry"],
  industry: ["analyst", "sector"],
  holding_period: ["analyst", "sector", "industry"],
  issuer: ["analyst", "sector", "industry"],
};

interface TabTheme {
  headerBg: string;
  activeTab: string;
  evenRow: string;
  hoverRow: string;
  toolbarBg: string;
  exportBg: string;
}

interface ClosedTickerDetail {
  ticker: string;
  dtd_pnl: number;
  dtd_pnl_pct: number;
  wtd_pnl: number;
  wtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
}

interface AttributionDetailProps {
  groupBy: AttributionGroupBy;
  groupValue: string;
  selectedFunds: string[];
  selectedDate: string;
  showPct: boolean;
  theme: TabTheme;
  onClose: () => void;
}

const DetailToolbar = () => (
  <Box className="attr-detail-toolbar">
    <GridToolbarExport
      printOptions={{ disableToolbarButton: true }}
      csvOptions={{ fileName: "ticker_detail_data" }}
    />
    <GridToolbarQuickFilter debounceMs={300} />
  </Box>
);

const AttributionDetail: React.FC<AttributionDetailProps> = ({
  groupBy,
  groupValue,
  selectedFunds,
  selectedDate,
  showPct,
  theme,
  onClose,
}) => {
  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [closedTickerDetails, setClosedTickerDetails] = useState<ClosedTickerDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "ytd_pnl", sort: "desc" }]);
  const [expandedExited, setExpandedExited] = useState(false);
  const [exitedSearch, setExitedSearch] = useState("");
  const [exitedSort, setExitedSort] = useState<"ytd_desc" | "ytd_asc" | "ticker_asc" | "ticker_desc">("ytd_desc");

  /* Active filter selections: key = sub-filter groupBy, value = selected values */
  const [activeFilters, setActiveFilters] = useState<
    Record<string, string[]>
  >({});

  /* Fetch ticker data for the selected row */
  const fetchTickerData = useCallback(async () => {
    if (selectedFunds.length === 0 || !selectedDate || !groupValue) return;
    const token = localStorage.getItem("access_token");
    setLoading(true);
    try {
      const payload: Record<string, any> = {
        fund: selectedFunds,
        date: selectedDate,
        [groupBy]: groupValue,
      };
      const res = await fetch(
        `${apiUrl}/api/portfolio_attribution_ticker_data/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Failed to fetch ticker data");
      const result = await res.json();
      const tickers = result.tickers || [];
      setTickerData(tickers);

      // Extract closed ticker details from the TRADED/EXITED row
      const exitedRow = tickers.find(
        (t: any) => t.ticker === "TRADED / EXITED"
      );
      if (exitedRow?.closed_ticker_details) {
        setClosedTickerDetails(exitedRow.closed_ticker_details);
      } else {
        setClosedTickerDetails([]);
      }
    } catch {
      setTickerData([]);
      setClosedTickerDetails([]);
    } finally {
      setLoading(false);
    }
  }, [selectedFunds, selectedDate, groupBy, groupValue]);

  useEffect(() => {
    fetchTickerData();
  }, [fetchTickerData]);

  /* Reset filters when row changes */
  useEffect(() => {
    setActiveFilters({});
    setExpandedExited(false);
    setExitedSearch("");
    setExitedSort("ytd_desc");
  }, [groupValue]);

  /* Compute unique values for each sub-filter from fetched data */
  const subFilterKeys = SUB_FILTERS[groupBy];
  const filterOptions = useMemo(() => {
    const opts: Record<string, string[]> = {};
    subFilterKeys.forEach((key) => {
      const values = new Set<string>();
      tickerData.forEach((t) => {
        const val = t[key as keyof TickerItem];
        if (val != null && val !== "") values.add(String(val));
      });
      opts[key] = Array.from(values).sort();
    });
    return opts;
  }, [tickerData, subFilterKeys]);

  /* Apply filters client-side; separate TOTAL and TRADED/EXITED to pin at bottom */
  const filteredData = useMemo(() => {
    return tickerData.filter((item) => {
      if (item.ticker === "TOTAL" || item.ticker === "TRADED / EXITED") return false;
      return Object.entries(activeFilters).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const itemValue = String(item[key as keyof TickerItem] ?? "");
        return selectedValues.includes(itemValue);
      });
    });
  }, [tickerData, activeFilters]);

  const exitedRow = useMemo(
    () => tickerData.find((item) => item.ticker === "TRADED / EXITED") ?? null,
    [tickerData]
  );

  const totalRow = useMemo(
    () => tickerData.find((item) => item.ticker === "TOTAL") ?? null,
    [tickerData]
  );

  const rows = useMemo(() => {
    let sorted = [...filteredData];
    if (sortModel.length > 0) {
      const { field, sort } = sortModel[0];
      sorted.sort((a, b) => {
        const aVal = (a as any)[field] ?? "";
        const bVal = (b as any)[field] ?? "";
        if (typeof aVal === "string" && typeof bVal === "string") {
          return sort === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sort === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
      });
    }
    const dataRows = sorted.map((item, idx) => ({ id: idx, ...item }));
    // Pin TRADED/EXITED just above TOTAL — always at bottom regardless of sort
    if (exitedRow) {
      dataRows.push({ id: -2, ...exitedRow });
    }
    if (totalRow) {
      dataRows.push({ id: -1, ...totalRow });
    }
    return dataRows;
  }, [filteredData, exitedRow, totalRow, sortModel]);

  const handleFilterChange = (filterKey: string, event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  /* Determine which P&L columns have non-zero values in closed ticker details */
  const closedHasNonZero = useMemo(() => {
    const has = { dtd: false, wtd: false, ytd: false };
    closedTickerDetails.forEach((d) => {
      if (d.dtd_pnl !== 0) has.dtd = true;
      if (d.wtd_pnl !== 0) has.wtd = true;
      if (d.ytd_pnl !== 0) has.ytd = true;
    });
    return has;
  }, [closedTickerDetails]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ticker",
        headerName: "Ticker",
        flex: 1,
        minWidth: 120,
        cellClassName: "attr-detail-cell--name",
        renderCell: ({ row }) => {
          const isExited = row.ticker === "TRADED / EXITED";
          return (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                width: "100%",
                cursor: isExited && closedTickerDetails.length > 0 ? "pointer" : "default",
              }}
              onClick={(e) => {
                if (isExited && closedTickerDetails.length > 0) {
                  e.stopPropagation();
                  setExpandedExited((prev) => !prev);
                }
              }}
            >
              {isExited && closedTickerDetails.length > 0 && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 20,
                    height: 20,
                    borderRadius: "5px",
                    bgcolor: expandedExited ? theme.activeTab : "#e2e8f0",
                    transition: "all 0.2s ease",
                    flexShrink: 0,
                  }}
                >
                  {expandedExited ? (
                    <ExpandLessIcon sx={{ fontSize: 14, color: "#fff" }} />
                  ) : (
                    <ExpandMoreIcon sx={{ fontSize: 14, color: "#475569" }} />
                  )}
                </Box>
              )}
              <span>{row.ticker}</span>
              {isExited && closedTickerDetails.length > 0 && (
                <Chip
                  label={`${closedTickerDetails.length} deals`}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "10px",
                    fontWeight: 700,
                    bgcolor: expandedExited
                      ? `${theme.activeTab}20`
                      : "#f1f5f9",
                    color: expandedExited ? theme.activeTab : "#64748b",
                    border: `1px solid ${expandedExited ? `${theme.activeTab}40` : "#e2e8f0"}`,
                    ml: 0.5,
                    transition: "all 0.2s ease",
                  }}
                />
              )}
            </Box>
          );
        },
      },
      {
        field: "issuer",
        headerName: "Issuer",
        flex: 1.4,
        minWidth: 160,
        cellClassName: "attr-detail-cell--name",
      },
      {
        field: "ytd_pnl",
        headerName: "YTD P&L",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.ytd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct ? formatPctVal(row.ytd_pnl_pct) : formatCurrency(row.ytd_pnl),
      },
      {
        field: "gross_market_value",
        headerName: "Gross Market Value",
        flex: 1,
        minWidth: 130,
        headerAlign: "right",
        align: "right",
        renderHeader: () => (
          <Tooltip
            placement="top"
            arrow
            title={
              <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                <Box sx={{ fontWeight: 700, mb: 0.5, color: "#ffffff" }}>GMV (Gross Market Value)</Box>
                <Box sx={{ color: "#93c5fd" }}>Σ Price × Quantity × PT Value</Box>
                <Box sx={{ mt: 0.5, color: "#fcd34d" }}>Uses premium price for options</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#0f172a", border: "1px solid rgba(96,165,250,0.25)", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#0f172a" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Gross Market Value</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#60a5fa", "&:hover": { color: "#93c5fd" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Tooltip>
        ),
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.gross_market_value_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.gross_market_value_pct)
            : formatCurrency(row.gross_market_value),
      },
      {
        field: "net_exp",
        headerName: "Net Notional Exposure",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        renderHeader: () => (
          <Tooltip
            placement="top"
            arrow
            title={
              <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>Net Notional Exposure</Box>
                <Box>Total Long Exposure + Total Short Exposure</Box>
                <Box>Σ (Price × Quantity × PT Value)</Box>
                <Box sx={{ mt: 0.5, color: "#fd8700" }}>Uses underlying price for options</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#0f172a", border: "1px solid rgba(96,165,250,0.25)", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#0f172a" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Net Notional Exposure</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#60a5fa", "&:hover": { color: "#93c5fd" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Tooltip>
        ),
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.net_exp_pct : value,
        renderCell: ({ row }) =>
          showPct ? formatPctVal(row.net_exp_pct) : formatCurrency(row.net_exp),
      },
      {
        field: "delta_adj_net",
        headerName: "Delta Adj Net",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        renderHeader: () => (
          <Tooltip
            placement="top"
            arrow
            title={
              <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                <Box sx={{ fontWeight: 700, mb: 0.5, color: "#ffffff" }}>Delta Adjusted Net Exposure</Box>
                <Box sx={{ color: "#93c5fd" }}>Σ (Price × Quantity × PT Value × Delta)</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#0f172a", border: "1px solid rgba(96,165,250,0.25)", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#0f172a" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Delta Adj Net</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#60a5fa", "&:hover": { color: "#93c5fd" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Tooltip>
        ),
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.delta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.delta_adj_net_pct)
            : formatCurrency(row.delta_adj_net),
      },
      {
        field: "beta_adj_net",
        headerName: "Beta Adj Net",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        renderHeader: () => (
          <Tooltip
            placement="top"
            arrow
            title={
              <Box sx={{ fontSize: "12px", lineHeight: 1.6 }}>
                <Box sx={{ fontWeight: 700, mb: 0.5, color: "#ffffff" }}>Beta Adjusted Net Exposure</Box>
                <Box sx={{ color: "#93c5fd" }}>Σ (Price × Quantity × PT Value × Delta × Beta)</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#0f172a", border: "1px solid rgba(96,165,250,0.25)", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#0f172a" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Beta Adj Net</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#60a5fa", "&:hover": { color: "#93c5fd" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Tooltip>
        ),
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.beta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.beta_adj_net_pct)
            : formatCurrency(row.beta_adj_net),
      },
    ],
    [showPct, closedTickerDetails, expandedExited, theme]
  );

  /* --- Filtered & sorted closed ticker list --- */
  const processedClosedTickers = useMemo(() => {
    let list = [...closedTickerDetails];
    // Search
    if (exitedSearch.trim()) {
      const q = exitedSearch.trim().toUpperCase();
      list = list.filter((d) => d.ticker.toUpperCase().includes(q));
    }
    // Sort
    list.sort((a, b) => {
      switch (exitedSort) {
        case "ytd_desc": return b.ytd_pnl - a.ytd_pnl;
        case "ytd_asc": return a.ytd_pnl - b.ytd_pnl;
        case "ticker_asc": return a.ticker.localeCompare(b.ticker);
        case "ticker_desc": return b.ticker.localeCompare(a.ticker);
        default: return 0;
      }
    });
    return list;
  }, [closedTickerDetails, exitedSearch, exitedSort]);

  /* Sort button helper */
  const SortBtn = ({
    label,
    sortKey,
  }: {
    label: string;
    sortKey: "ytd_desc" | "ytd_asc" | "ticker_asc" | "ticker_desc";
  }) => {
    const active = exitedSort === sortKey;
    return (
      <Chip
        label={label}
        size="small"
        onClick={() => setExitedSort(sortKey)}
        sx={{
          height: 26,
          fontSize: "11px",
          fontWeight: active ? 700 : 500,
          bgcolor: active ? `${theme.activeTab}15` : "#f8fafc",
          color: active ? theme.activeTab : "#64748b",
          border: `1px solid ${active ? `${theme.activeTab}50` : "#e2e8f0"}`,
          cursor: "pointer",
          transition: "all 0.15s",
          "&:hover": { borderColor: theme.activeTab, bgcolor: `${theme.activeTab}08` },
        }}
      />
    );
  };

  /* --- Inline Expanded Section for TRADED / EXITED --- */
  const renderExitedExpansion = () => {
    if (!expandedExited || closedTickerDetails.length === 0) return null;

    const posCount = closedTickerDetails.filter((d) => d.ytd_pnl > 0).length;
    const negCount = closedTickerDetails.filter((d) => d.ytd_pnl < 0).length;
    const totalYtd = closedTickerDetails.reduce((s, d) => s + d.ytd_pnl, 0);

    /* Custom scrollbar CSS */
    const scrollbarSx = {
      "&::-webkit-scrollbar": {
        width: "6px",
      },
      "&::-webkit-scrollbar-track": {
        bgcolor: "#f1f5f9",
        borderRadius: "3px",
      },
      "&::-webkit-scrollbar-thumb": {
        bgcolor: "#cbd5e1",
        borderRadius: "3px",
        "&:hover": { bgcolor: "#94a3b8" },
      },
      scrollbarWidth: "thin" as const,
      scrollbarColor: "#cbd5e1 #f1f5f9",
    };

    return (
      <Collapse in={expandedExited} timeout={300}>
        <Box
          sx={{
            mx: 2,
            mb: 2,
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* Header Bar */}
          <Box
            sx={{
              px: 1.5,
              py: 1,
              background: `linear-gradient(135deg, ${theme.activeTab}10, ${theme.activeTab}05)`,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {/* Left: Title + stats */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SwapVertIcon sx={{ fontSize: 16, color: theme.activeTab }} />
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 700,
                  fontFamily: FONT,
                  color: "#1e293b",
                  textTransform: "uppercase",
                  letterSpacing: "0.4px",
                }}
              >
                Exited Deals
              </Typography>
              <Chip
                label={`${processedClosedTickers.length}${exitedSearch ? ` / ${closedTickerDetails.length}` : ""}`}
                size="small"
                sx={{
                  height: 22,
                  fontSize: "11px",
                  fontWeight: 700,
                  bgcolor: `${theme.activeTab}12`,
                  color: theme.activeTab,
                }}
              />
              <Chip
                label={`${posCount} ▲`}
                size="small"
                sx={{ height: 22, fontSize: "11px", fontWeight: 700, bgcolor: "#f0fdf4", color: "#059669" }}
              />
              <Chip
                label={`${negCount} ▼`}
                size="small"
                sx={{ height: 22, fontSize: "11px", fontWeight: 700, bgcolor: "#fef2f2", color: "#dc2626" }}
              />
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 800,
                  fontFamily: FONT,
                  color: totalYtd >= 0 ? "#059669" : "#dc2626",
                  ml: 0.5,
                }}
              >
                Net: {formatCurrency(totalYtd)}
              </Typography>
            </Box>

            {/* Right: Search + Sort + Close */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
              <TextField
                size="small"
                placeholder="Search ticker..."
                value={exitedSearch}
                onChange={(e) => setExitedSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 160,
                  "& .MuiOutlinedInput-root": {
                    height: 30,
                    fontSize: "12px",
                    fontFamily: FONT,
                    borderRadius: "6px",
                    bgcolor: "#fff",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#e2e8f0",
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 0.4 }}>
                <SortBtn label="YTD ↓" sortKey="ytd_desc" />
                <SortBtn label="YTD ↑" sortKey="ytd_asc" />
                <SortBtn label="A→Z" sortKey="ticker_asc" />
                <SortBtn label="Z→A" sortKey="ticker_desc" />
              </Box>
              <IconButton
                size="small"
                onClick={() => setExpandedExited(false)}
                sx={{
                  width: 22,
                  height: 22,
                  bgcolor: "#f1f5f9",
                  "&:hover": { bgcolor: "#e2e8f0" },
                }}
              >
                <ExpandLessIcon sx={{ fontSize: 13, color: "#64748b" }} />
              </IconButton>
            </Box>
          </Box>

          {/* Card Grid with fixed height + scrollbar */}
          {processedClosedTickers.length === 0 ? (
            <Box
              sx={{
                py: 3,
                textAlign: "center",
                color: "#94a3b8",
                fontSize: "12px",
                fontFamily: FONT,
              }}
            >
              No tickers match "{exitedSearch}"
            </Box>
          ) : (
            <Box
              sx={{
                maxHeight: 260,
                overflowY: "auto",
                px: 1,
                py: 0.8,
                bgcolor: "#fafbfc",
                ...scrollbarSx,
              }}
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr 1fr 1fr",
                    sm: "1fr 1fr 1fr 1fr 1fr",
                    md: "1fr 1fr 1fr 1fr 1fr 1fr 1fr",
                  },
                  gap: "6px",
                }}
              >
                {processedClosedTickers.map((deal) => {
                  const isPositive = deal.ytd_pnl > 0;
                  const isNegative = deal.ytd_pnl < 0;
                  const badgeBg = isPositive ? "#dcfce7" : isNegative ? "#fee2e2" : "#f1f5f9";
                  const badgeColor = isPositive ? "#15803d" : isNegative ? "#dc2626" : "#64748b";
                  const cardBorder = isPositive ? "#d1fae5" : isNegative ? "#fecaca" : "#e5e7eb";

                  return (
                    <Box
                      key={deal.ticker}
                      sx={{
                        border: `1px solid ${cardBorder}`,
                        borderRadius: "6px",
                        px: 1,
                        py: 0.6,
                        bgcolor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        transition: "box-shadow 0.12s",
                        "&:hover": { boxShadow: "0 1px 6px rgba(0,0,0,0.07)" },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "12px",
                          fontWeight: 700,
                          fontFamily: FONT,
                          color: "#1e293b",
                          textTransform: "uppercase",
                          lineHeight: 1,
                        }}
                      >
                        {deal.ticker}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignSelf: "flex-start",
                          px: 0.8,
                          py: "1px",
                          borderRadius: "10px",
                          bgcolor: badgeBg,
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: 700,
                            fontFamily: FONT,
                            color: badgeColor,
                            lineHeight: 1.4,
                          }}
                        >
                          {showPct ? formatPctVal(deal.ytd_pnl_pct) : formatCurrency(deal.ytd_pnl)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Collapse>
    );
  };

  return (
    <Box className="attr-detail-section">
      {/* Header */}
      <Box className="attr-detail-header" sx={{ background: theme.activeTab }}>
        <Box className="attr-detail-header-text">
          <span className="attr-detail-header-label">
            {GROUP_BY_LABELS[groupBy]}:
          </span>{" "}
          <span className="attr-detail-header-value">{groupValue}</span>
          <span className="attr-detail-header-count">
            ({filteredData.length} ticker{filteredData.length !== 1 ? "s" : ""})
          </span>
        </Box>
        <IconButton
          size="small"
          onClick={onClose}
          className="attr-detail-close-btn"
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Sub-filters */}
      <Box className="attr-detail-filters">
        {subFilterKeys.map((filterKey) => {
          const options = filterOptions[filterKey] || [];
          const selected = activeFilters[filterKey] || [];
          if (options.length === 0) return null;
          return (
            <FormControl
              key={filterKey}
              size="small"
              sx={{ minWidth: 180, flex: 1, maxWidth: 280 }}
            >
              <InputLabel
                sx={{
                  fontFamily: FONT,
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {GROUP_BY_LABELS[filterKey]}
              </InputLabel>
              <Select
                multiple
                value={selected}
                onChange={(e) => handleFilterChange(filterKey, e)}
                input={
                  <OutlinedInput
                    label={GROUP_BY_LABELS[filterKey]}
                    sx={{ fontFamily: FONT, fontSize: "13px" }}
                  />
                }
                renderValue={(sel) => (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {(sel as string[]).map((value) => (
                      <Chip
                        key={value}
                        label={value}
                        size="small"
                        sx={{
                          fontFamily: FONT,
                          fontSize: "11px",
                          fontWeight: 600,
                          height: 22,
                          backgroundColor: theme.activeTab,
                          color: "#fff",
                        }}
                        onDelete={() => {
                          setActiveFilters((prev) => ({
                            ...prev,
                            [filterKey]: (prev[filterKey] || []).filter(
                              (v) => v !== value
                            ),
                          }));
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                      />
                    ))}
                  </Box>
                )}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 300,
                      fontFamily: FONT,
                    },
                  },
                }}
                sx={{
                  fontFamily: FONT,
                  fontSize: "13px",
                  borderRadius: "8px",
                  backgroundColor: "#fff",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#d0d7e2",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.activeTab,
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: theme.activeTab,
                  },
                }}
              >
                {options.map((val) => (
                  <MenuItem
                    key={val}
                    value={val}
                    sx={{
                      fontFamily: FONT,
                      fontSize: "12px",
                      fontWeight: selected.includes(val) ? 700 : 400,
                      backgroundColor: selected.includes(val)
                        ? `${theme.evenRow} !important`
                        : "transparent",
                    }}
                  >
                    {val}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          );
        })}
      </Box>

      {/* Ticker table */}
      {loading ? (
        <Box className="attr-detail-loading">
          <CircularProgress size={28} />
        </Box>
      ) : filteredData.length > 0 ? (
        <>
          <Box className="attr-detail-table-wrapper">
            <DataGrid
              rows={rows}
              columns={columns}
              density="compact"
              rowHeight={42}
              disableRowSelectionOnClick
              disableColumnMenu
              slots={{ toolbar: DetailToolbar }}
              getRowClassName={(params) => {
                if (params.row.ticker === "TOTAL") return "attr-detail-row--total";
                if (params.row.ticker === "TRADED / EXITED")
                  return expandedExited
                    ? "attr-detail-row--exited attr-detail-row--exited-expanded"
                    : "attr-detail-row--exited";
                return "";
              }}
              onRowClick={(params) => {
                if (
                  params.row.ticker === "TRADED / EXITED" &&
                  closedTickerDetails.length > 0
                ) {
                  setExpandedExited((prev) => !prev);
                }
              }}
              sortingMode="server"
              sortModel={sortModel}
              onSortModelChange={(model) => setSortModel(model)}
              sx={{
                fontFamily: FONT,
                border: "none",
                borderRadius: "0 0 12px 12px",
                "& .MuiDataGrid-columnHeader": {
                  backgroundColor: theme.headerBg,
                  color: "#1e293b",
                },
                "& .MuiDataGrid-columnHeaderTitle": {
                  fontFamily: FONT,
                  fontWeight: 700,
                  fontSize: "12px",
                  color: "#1e293b",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                },
                "& .MuiDataGrid-sortIcon": {
                  color: "#1e293b !important",
                },
                "& .MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "& .MuiDataGrid-cell": {
                  fontFamily: FONT,
                  fontSize: "12px",
                  borderBottom: "1px solid #e8ecf1",
                },
                "& .MuiDataGrid-row:nth-of-type(even)": {
                  backgroundColor: theme.evenRow,
                },
                "& .MuiDataGrid-row:nth-of-type(odd)": {
                  backgroundColor: "#fff",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: `${theme.hoverRow} !important`,
                },
                "& .attr-detail-cell--name": {
                  fontWeight: 500,
                  color: "#1e293b",
                  textTransform: "uppercase",
                },
                /* TRADED / EXITED row styling */
                "& .attr-detail-row--exited": {
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                },
                "& .attr-detail-row--exited:hover": {
                  backgroundColor: `${theme.hoverRow} !important`,
                },
                "& .attr-detail-row--exited-expanded": {
                  backgroundColor: `${theme.activeTab}08 !important`,
                  borderLeft: `3px solid ${theme.activeTab}`,
                },
                "& .attr-detail-row--exited-expanded .MuiDataGrid-cell": {
                  fontWeight: "700 !important",
                },
                /* TOTAL row styling */
                "& .attr-detail-row--total": {
                  backgroundColor: `${theme.evenRow} !important`,
                  borderTop: `2px solid ${theme.activeTab}`,
                },
                "& .attr-detail-row--total .MuiDataGrid-cell": {
                  fontWeight: "800 !important",
                  color: "#1e293b !important",
                  fontSize: "13px !important",
                },
                "& .MuiDataGrid-toolbarContainer": {
                  padding: "0",
                },
                "& .attr-detail-toolbar": {
                  background: theme.toolbarBg,
                },
                "& .attr-detail-toolbar .MuiButton-root": {
                  color: "#fff",
                  background: theme.exportBg,
                  fontWeight: 700,
                  fontSize: "11px",
                  padding: "4px 14px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                },
                "& .attr-detail-toolbar .MuiButton-root:hover": {
                  background: theme.exportBg,
                  filter: "brightness(0.85)",
                  color: "#fff",
                },
                "& .MuiDataGrid-footerContainer": {
                  fontFamily: FONT,
                  borderTop: "1px solid #e2e8f0",
                },
              }}
            />
          </Box>

          {/* Inline expansion for TRADED / EXITED */}
          {renderExitedExpansion()}
        </>
      ) : (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          No ticker data available
          {Object.values(activeFilters).some((v) => v.length > 0) &&
            " for selected filters"}
        </Box>
      )}
    </Box>
  );
};

export default AttributionDetail;

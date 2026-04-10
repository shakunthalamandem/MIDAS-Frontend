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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import SwapVertIcon from "@mui/icons-material/SwapVert";
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

  /* Apply filters client-side, keep TOTAL pinned at bottom */
  const filteredData = useMemo(() => {
    const nonTotal = tickerData.filter((item) => item.ticker !== "TOTAL");
    return nonTotal.filter((item) => {
      return Object.entries(activeFilters).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const itemValue = String(item[key as keyof TickerItem] ?? "");
        return selectedValues.includes(itemValue);
      });
    });
  }, [tickerData, activeFilters]);

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
    if (totalRow) {
      dataRows.push({ id: -1, ...totalRow });
    }
    return dataRows;
  }, [filteredData, totalRow, sortModel]);

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
        field: "dtd_pnl",
        headerName: "DTD P&L",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.dtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct ? formatPctVal(row.dtd_pnl_pct) : formatCurrency(row.dtd_pnl),
      },
      {
        field: "wtd_pnl",
        headerName: "WTD P&L",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.wtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct ? formatPctVal(row.wtd_pnl_pct) : formatCurrency(row.wtd_pnl),
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
        field: "market_value",
        headerName: "Net Market Value",
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
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>NMV (Net Market Value)</Box>
                <Box>Σ Price × Quantity × PT Value</Box>
                <Box sx={{ mt: 0.5, color: "#94a3b8" }}>Uses premium price for options</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Net Market Value</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#94a3b8", "&:hover": { color: "#64748b" } }}
                onClick={(e) => e.stopPropagation()}
              />
            </Box>
          </Tooltip>
        ),
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.market_value_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.market_value_pct)
            : formatCurrency(row.market_value),
      },
      {
        field: "net_exp",
        headerName: "Net Exp",
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
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>Net Exposure</Box>
                <Box>Total Long Exposure + Total Short Exposure</Box>
                <Box>Σ (Price × Quantity × PT Value)</Box>
                <Box sx={{ mt: 0.5, color: "#94a3b8" }}>Uses underlying price for options</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Net Exp</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#94a3b8", "&:hover": { color: "#64748b" } }}
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
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>Delta Adjusted Net Exposure</Box>
                <Box>Σ (Price × Quantity × PT Value × Delta)</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Delta Adj Net</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#94a3b8", "&:hover": { color: "#64748b" } }}
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
                <Box sx={{ fontWeight: 600, mb: 0.5 }}>Beta Adjusted Net Exposure</Box>
                <Box>Σ (Price × Quantity × PT Value × Delta × Beta)</Box>
              </Box>
            }
            slotProps={{ tooltip: { sx: { bgcolor: "#1e293b", maxWidth: 300, "& .MuiTooltip-arrow": { color: "#1e293b" } } } }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "default" }}>
              <span style={{ fontWeight: 600 }}>Beta Adj Net</span>
              <InfoOutlinedIcon
                sx={{ fontSize: 14, color: "#94a3b8", "&:hover": { color: "#64748b" } }}
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

  /* --- Inline Expanded Section for TRADED / EXITED --- */
  const renderExitedExpansion = () => {
    if (!expandedExited || closedTickerDetails.length === 0) return null;

    return (
      <Collapse in={expandedExited} timeout={350}>
        <Box
          sx={{
            mx: 2,
            mb: 2,
            borderRadius: "10px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            animation: "attrDetailSlideIn 0.25s ease-out",
          }}
        >
          {/* Expansion Header */}
          <Box
            sx={{
              px: 2,
              py: 1.2,
              background: `linear-gradient(135deg, ${theme.activeTab}15, ${theme.activeTab}08)`,
              borderBottom: "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SwapVertIcon
                sx={{ fontSize: 16, color: theme.activeTab }}
              />
              <Typography
                sx={{
                  fontSize: "12px",
                  fontWeight: 700,
                  fontFamily: FONT,
                  color: "#1e293b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Traded / Exited Deal Breakdown
              </Typography>
              <Chip
                label={`${closedTickerDetails.length} positions`}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "10px",
                  fontWeight: 700,
                  bgcolor: `${theme.activeTab}18`,
                  color: theme.activeTab,
                  border: `1px solid ${theme.activeTab}30`,
                }}
              />
            </Box>
            <IconButton
              size="small"
              onClick={() => setExpandedExited(false)}
              sx={{
                width: 24,
                height: 24,
                bgcolor: "#f1f5f9",
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            >
              <ExpandLessIcon sx={{ fontSize: 14, color: "#64748b" }} />
            </IconButton>
          </Box>

          {/* Expansion Table */}
          <Box sx={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: FONT,
                fontSize: "12px",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8fafc",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <th
                    style={{
                      textAlign: "left",
                      padding: "10px 16px",
                      fontWeight: 700,
                      fontSize: "11px",
                      color: "#475569",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Ticker
                  </th>
                  {closedHasNonZero.dtd && (
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 16px",
                        fontWeight: 700,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      DTD P&L
                    </th>
                  )}
                  {closedHasNonZero.wtd && (
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 16px",
                        fontWeight: 700,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      WTD P&L
                    </th>
                  )}
                  {closedHasNonZero.ytd && (
                    <th
                      style={{
                        textAlign: "right",
                        padding: "10px 16px",
                        fontWeight: 700,
                        fontSize: "11px",
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      YTD P&L
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {closedTickerDetails.map((deal, idx) => {
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={deal.ticker}
                      style={{
                        backgroundColor: isEven ? "#fff" : theme.evenRow,
                        borderBottom: "1px solid #f1f5f9",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          theme.hoverRow;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor =
                          isEven ? "#fff" : theme.evenRow;
                      }}
                    >
                      <td
                        style={{
                          padding: "8px 16px",
                          fontWeight: 600,
                          color: "#1e293b",
                          textTransform: "uppercase",
                          fontSize: "12px",
                        }}
                      >
                        {deal.ticker}
                      </td>
                      {closedHasNonZero.dtd && (
                        <td
                          style={{
                            textAlign: "right",
                            padding: "8px 16px",
                            fontWeight: 500,
                            color:
                              deal.dtd_pnl > 0
                                ? "#059669"
                                : deal.dtd_pnl < 0
                                ? "#dc2626"
                                : "#94a3b8",
                            fontSize: "12px",
                          }}
                        >
                          {showPct
                            ? formatPctVal(deal.dtd_pnl_pct)
                            : formatCurrency(deal.dtd_pnl)}
                        </td>
                      )}
                      {closedHasNonZero.wtd && (
                        <td
                          style={{
                            textAlign: "right",
                            padding: "8px 16px",
                            fontWeight: 500,
                            color:
                              deal.wtd_pnl > 0
                                ? "#059669"
                                : deal.wtd_pnl < 0
                                ? "#dc2626"
                                : "#94a3b8",
                            fontSize: "12px",
                          }}
                        >
                          {showPct
                            ? formatPctVal(deal.wtd_pnl_pct)
                            : formatCurrency(deal.wtd_pnl)}
                        </td>
                      )}
                      {closedHasNonZero.ytd && (
                        <td
                          style={{
                            textAlign: "right",
                            padding: "8px 16px",
                            fontWeight: 500,
                            color:
                              deal.ytd_pnl > 0
                                ? "#059669"
                                : deal.ytd_pnl < 0
                                ? "#dc2626"
                                : "#94a3b8",
                            fontSize: "12px",
                          }}
                        >
                          {showPct
                            ? formatPctVal(deal.ytd_pnl_pct)
                            : formatCurrency(deal.ytd_pnl)}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>
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

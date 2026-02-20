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
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import {
  DataGrid,
  GridColDef,
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
  analyst: ["sector", "industry", "holding_period"],
  sector: ["analyst", "industry", "holding_period"],
  industry: ["analyst", "sector", "holding_period"],
  holding_period: ["analyst", "sector", "industry"],
  issuer: ["analyst", "sector", "industry", "holding_period"],
};

interface TabTheme {
  headerBg: string;
  activeTab: string;
  evenRow: string;
  hoverRow: string;
  toolbarBg: string;
  exportBg: string;
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
  const [loading, setLoading] = useState(false);

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
      setTickerData(result.tickers || []);
    } catch {
      setTickerData([]);
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

  /* Apply filters client-side */
  const filteredData = useMemo(() => {
    return tickerData.filter((item) => {
      return Object.entries(activeFilters).every(([key, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        const itemValue = String(item[key as keyof TickerItem] ?? "");
        return selectedValues.includes(itemValue);
      });
    });
  }, [tickerData, activeFilters]);

  const rows = useMemo(
    () => filteredData.map((item, idx) => ({ id: idx, ...item })),
    [filteredData]
  );

  const handleFilterChange = (filterKey: string, event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setActiveFilters((prev) => ({
      ...prev,
      [filterKey]: typeof value === "string" ? value.split(",") : value,
    }));
  };

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "ticker",
        headerName: "Ticker",
        flex: 1,
        minWidth: 120,
        cellClassName: "attr-detail-cell--name",
      },
      {
        field: "issuer",
        headerName: "Issuer",
        flex: 1.4,
        minWidth: 160,
        cellClassName: "attr-detail-cell--name",
      },
      {
        field: "days_hld",
        headerName: "Days Held",
        flex: 0.7,
        minWidth: 90,
        headerAlign: "right",
        align: "right",
        renderCell: ({ value }) => (value != null ? Math.round(value) : "—"),
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
        field: "mtd_pnl",
        headerName: "MTD P&L",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.mtd_pnl_pct : value,
        renderCell: ({ row }) =>
          showPct ? formatPctVal(row.mtd_pnl_pct) : formatCurrency(row.mtd_pnl),
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
        field: "net_exp",
        headerName: "Net Exp",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.net_exp_pct : value,
        renderCell: ({ row }) =>
          showPct ? formatPctVal(row.net_exp_pct) : formatCurrency(row.net_exp),
      },
      {
        field: "beta_adj_net",
        headerName: "\u03B2 Adj Net",
        flex: 1,
        minWidth: 120,
        headerAlign: "right",
        align: "right",
        valueGetter: (value: number, row: TickerItem) =>
          showPct ? row.beta_adj_net_pct : value,
        renderCell: ({ row }) =>
          showPct
            ? formatPctVal(row.beta_adj_net_pct)
            : formatCurrency(row.beta_adj_net),
      },
    ],
    [showPct]
  );

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
        <Box className="attr-detail-table-wrapper">
          <DataGrid
            rows={rows}
            columns={columns}
            density="compact"
            rowHeight={42}
            disableRowSelectionOnClick
            disableColumnMenu
            slots={{ toolbar: DetailToolbar }}
            initialState={{
              sorting: {
                sortModel: [{ field: "ytd_pnl", sort: "desc" }],
              },
            }}
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

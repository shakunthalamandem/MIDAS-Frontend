import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  TableSortLabel,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import AttachMoneyOutlinedIcon from "@mui/icons-material/AttachMoneyOutlined";
import DealDetailsPanel from "./DealDetailsPanel";
import PredictionCell from "./PredictionCell";
import DealPricesChart from "./DealPricesChart";

const getISODate = (offsetDays: number = 0) => {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  return date.toISOString().split("T")[0];
};

export interface DealRecord {
  ticker: string;
  issuer_name: string;
  deal_type: string;
  fo_type: string;
  pricing_date: string;
  region: string;
  sector: string;
  deal_size: number | string;
  issue_price: number | string;
  discount_from_announcement_price: number | string;
  allocation_as_percentage_of_deal_size: number | string;
  allocation_as_percentage_of_ioi: number | string;
  t1d_pred: string;
  t1d_confidence: number | string;
  t1d_actual_return: number | string;
  t1d_openprice_pred: string;
  t1d_openprice_confidence: number | string;
  t1d_openprice_actual_return: number | string;
  t1w_pred: string;
  t1w_confidence: number | string;
  t1w_actual_return: number | string;
  t1m_pred: string;
  t1m_confidence: number | string;
  t1m_actual_return: number | string;
}

type Align = "left" | "center" | "right";

interface ColumnConfig {
  key: keyof DealRecord | string;
  label: string; // can contain "\n" for multi-line header
  align?: Align;
  width?: number;
  render?: (row: DealRecord) => React.ReactNode;
  sortKey?: keyof DealRecord;
}

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: keyof DealRecord | null;
  direction: SortDirection;
}

type DealTypeFilter = "IPO" | "FO";

// narrower to reduce horizontal scroll
const PREDICTION_COL_WIDTH = 160;

type ReturnSign = "positive" | "negative" | "neutral" | null;

const getPredictionSign = (pred: string): ReturnSign => {
  const normalized = pred?.toLowerCase() || "";
  if (!normalized) return null;
  if (normalized.includes("positive") || normalized.includes("pos") || normalized.includes("up")) {
    return "positive";
  }
  if (normalized.includes("negative") || normalized.includes("neg") || normalized.includes("down")) {
    return "negative";
  }
  return null;
};

const getActualSign = (value: number | string): ReturnSign => {
  if (value === null || value === undefined || value === "") return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (Number.isNaN(num)) return null;
  if (num > 0) return "positive";
  if (num < 0) return "negative";
  return "neutral";
};

const PredictionOutcomeDot: React.FC<{ pred: string; actual: number | string }> = ({
  pred,
  actual,
}) => {
  const predSign = getPredictionSign(pred);
  const actualSign = getActualSign(actual);

  const isMismatch =
    predSign && actualSign && actualSign !== "neutral" && predSign !== actualSign;

  let color = "#9e9e9e";
  let title = "Missing data";

  if (isMismatch) {
    color = "#d32f2f";
    title = "Prediction disagrees with actual";
  } else if (predSign && actualSign && actualSign !== "neutral") {
    color = "#2e7d32";
    title = "Prediction aligns with actual";
  }

  return (
    <Box
      component="span"
      title={title}
      sx={(theme) => ({
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: color,
        boxShadow: `0 0 0 1px ${alpha(theme.palette.getContrastText("#fff"), 0.04)}`,
      })}
    />
  );
};

const TABLE_COLUMNS: ColumnConfig[] = [
  {
    key: "ticker_issuer",
    label: "Ticker / Issuer",
    align: "left",
    width: 230,
    sortKey: "ticker",
    render: (row) => (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, lineHeight: 1.2 }}
        >
          {row.ticker}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ lineHeight: 1.2 }}
        >
          {row.issuer_name}
        </Typography>
      </Box>
    ),
  },
  {
    key: "pricing_date",
    label: "Pricing Date",
    align: "center",
    width: 110,
    sortKey: "pricing_date",
    render: (row) => (row.pricing_date ? row.pricing_date : "TBD"),
  },
  {
    key: "sector",
    label: "Sector",
    align: "left",
    width: 150,
    sortKey: "sector",
  },
  {
    key: "t1d_close",
    label: "1st Day Close\nfrom Issue Price",
    align: "center",
    width: PREDICTION_COL_WIDTH,
    sortKey: "t1d_confidence",
    render: (row) => (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <PredictionCell
          pred={row.t1d_pred}
          confidence={row.t1d_confidence}
          trailingAdornment={
            <PredictionOutcomeDot pred={row.t1d_pred} actual={row.t1d_actual_return} />
          }
        />
      </Box>
    ),
  },
  {
    key: "t1d_open",
    label: "1st Day Close\nfrom Open Price",
    align: "center",
    width: PREDICTION_COL_WIDTH,
    sortKey: "t1d_openprice_confidence",
    render: (row) => (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <PredictionCell
          pred={row.t1d_openprice_pred}
          confidence={row.t1d_openprice_confidence}
          trailingAdornment={
            <PredictionOutcomeDot
              pred={row.t1d_openprice_pred}
              actual={row.t1d_openprice_actual_return}
            />
          }
        />
      </Box>
    ),
  },
  {
    key: "t1w",
    label: "1 Week from\n1st Day Close",
    align: "center",
    width: PREDICTION_COL_WIDTH,
    sortKey: "t1w_confidence",
    render: (row) => (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <PredictionCell
          pred={row.t1w_pred}
          confidence={row.t1w_confidence}
          trailingAdornment={
            <PredictionOutcomeDot pred={row.t1w_pred} actual={row.t1w_actual_return} />
          }
        />
      </Box>
    ),
  },
  {
    key: "t1m",
    label: "1 Month from\n1st Day Close",
    align: "center",
    width: PREDICTION_COL_WIDTH,
    sortKey: "t1m_confidence",
    render: (row) => (
      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
        <PredictionCell
          pred={row.t1m_pred}
          confidence={row.t1m_confidence}
          trailingAdornment={
            <PredictionOutcomeDot pred={row.t1m_pred} actual={row.t1m_actual_return} />
          }
        />
      </Box>
    ),
  },
];

/* ---------- Main component ---------- */

export interface TickerSelectionPayload {
  ticker: string;
  pricing_date: string;
}

interface DealsPredictionsTableProps {
  onTickerClick?: (payload: TickerSelectionPayload) => void;
}

const DealsPredictionsTable: React.FC<DealsPredictionsTableProps> = ({
  onTickerClick,
}) => {
  const [data, setData] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(getISODate(30));
  const [endDate, setEndDate] = useState(getISODate(0));
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "pricing_date",
    direction: "desc",
  });
  const [dealTypeFilter, setDealTypeFilter] = useState<DealTypeFilter>("FO");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const payload = {
          ticker: debouncedSearch.trim() || null,
          start_date: startDate || null,
          end_date: endDate || null,
        };

        const res = await fetch(`${apiUrl}/api/ai_ml_results/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json = await res.json();
        setData(json || []);
      } catch (err: any) {
        setError(err.message || "Failed to fetch deals");
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, [apiUrl, token, debouncedSearch, startDate, endDate]);

  // Search by ticker or issuer, apply date range, then filter by IPO / FO
  const filteredData = useMemo(() => {
    let rows = data;

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((row) => {
        const tickerMatch = row.ticker?.toLowerCase().includes(q);
        const issuerMatch = row.issuer_name?.toLowerCase().includes(q);
        return tickerMatch || issuerMatch;
      });
    }

    if (startDate || endDate) {
      const startTime = startDate ? Date.parse(startDate) : null;
      const endTime = endDate ? Date.parse(endDate) : null;

      rows = rows.filter((row) => {
        const rowTime = row.pricing_date ? Date.parse(row.pricing_date) : null;
        if (rowTime === null || Number.isNaN(rowTime)) {
          return false;
        }
        if (startTime && rowTime < startTime) {
          return false;
        }
        if (endTime && rowTime > endTime) {
          return false;
        }
        return true;
      });
    }

    rows = rows.filter((row) => {
      const type = (row.deal_type || "").toUpperCase();
      return type.includes(dealTypeFilter);
    });

    return rows;
  }, [data, search, startDate, endDate, dealTypeFilter]);

  const getComparableValue = (
    row: DealRecord,
    key: keyof DealRecord
  ): string | number | null => {
    let value = row[key] as any;

    if (value === null || value === undefined || value === "") {
      return null;
    }

    if (key === "pricing_date") {
      const time = new Date(value as string).getTime();
      return Number.isNaN(time) ? null : time;
    }

    if (typeof value === "number") return value;

    if (typeof value === "string") {
      const num = parseFloat(value);
      if (!Number.isNaN(num)) {
        return num;
      }
      return value.toLowerCase();
    }

    return value;
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;

    const sorted = [...filteredData];
    const { key, direction } = sortConfig;

    sorted.sort((a, b) => {
      const aVal = getComparableValue(a, key);
      const bVal = getComparableValue(b, key);

      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return direction === "asc" ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      const cmp = aStr.localeCompare(bStr);
      return direction === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [filteredData, sortConfig]);

  const handleSortClick = (column: ColumnConfig) => {
    const sortKey =
      column.sortKey || (column.key as keyof DealRecord | undefined);

    if (!sortKey) return;

    setSortConfig((prev) => {
      if (prev.key === sortKey) {
        return {
          key: sortKey,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key: sortKey, direction: "asc" };
    });
  };

  const handleTickerClick = (row: DealRecord) => {
    if (onTickerClick) {
      onTickerClick({
        ticker: row.ticker,
        pricing_date: row.pricing_date,
      });
    }
  };

  const renderTickerCell = (row: DealRecord) => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
      <Typography
        variant="subtitle2"
        sx={{ fontWeight: 700, lineHeight: 1.2, cursor: "pointer" }}
        onClick={() => handleTickerClick(row)}
      >
        {row.ticker}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ lineHeight: 1.2 }}
      >
        {row.issuer_name}
      </Typography>
    </Box>
  );

  const renderHeaderLabel = (label: string, align: Align = "center") => {
    const lines = label.split("\n");
    return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems={
        align === "left"
          ? "flex-start"
          : align === "right"
          ? "flex-end"
          : "center"
      }
      sx={{ color: "inherit" }}
    >
        {lines.map((line, idx) => (
          <Typography
            key={idx}
            variant={lines.length === 1 ? "subtitle2" : "caption"}
            sx={{ lineHeight: 1.2 }}
          >
            {line}
          </Typography>
        ))}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header + filters + search */}
      <Box
        mb={2}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={1.5}
        sx={(theme) => ({
          position: "sticky",
          top: 0,
          zIndex: 5,
          paddingBottom: theme.spacing(1),
          background: `linear-gradient(
            180deg,
            ${theme.palette.background.default} 70%,
            ${alpha(theme.palette.background.default, 0)} 100%
          )`,
        })}
      >
        

        <Box display="flex" justifyContent="center" width="100%">
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {/* IPO / FO segmented control */}
            <Box
              sx={(theme) => ({
                display: "inline-flex",
                alignItems: "center",
                borderRadius: 999,
                padding: 0.3,
                border: `1px solid ${theme.palette.divider}`,
                backgroundColor:
                  theme.palette.mode === "light"
                    ? theme.palette.grey[100]
                    : theme.palette.background.paper,
              })}
            >
              {(["IPO", "FO"] as DealTypeFilter[]).map((type) => {
                const active = dealTypeFilter === type;
                return (
                  <Box
                    key={type}
                    onClick={() => setDealTypeFilter(type)}
                    sx={(theme) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 0.6,
                      px: 1.6,
                      py: 0.45,
                      borderRadius: 999,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      background: active
                        ? `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`
                        : "transparent",
                      color: active
                        ? theme.palette.common.white
                        : theme.palette.text.secondary,
                    })}
                  >
                    {type === "IPO" ? (
                      <RocketLaunchOutlinedIcon
                        sx={{ fontSize: 16, opacity: active ? 1 : 0.7 }}
                      />
                    ) : (
                      <AttachMoneyOutlinedIcon
                        sx={{ fontSize: 16, opacity: active ? 1 : 0.7 }}
                      />
                    )}
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        letterSpacing: 0.6,
                      }}
                    >
                      {type}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {/* Search */}
            <TextField
              size="small"
              label="Search by ticker or issuer"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ minWidth: 230 }}
            />
            <TextField
              size="small"
              type="date"
              label="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              size="small"
              type="date"
              label="End date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
          </Box>
        </Box>

      </Box>

      {loading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && sortedData.length === 0 && (
        <Alert severity="info">No deals found for the selected criteria.</Alert>
      )}

      {!loading && !error && sortedData.length > 0 && (
        <>
          {/* Table */}
          <Paper
            elevation={2}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <TableContainer
              sx={{
                maxHeight: 420,
                overflowX: "auto",
              }}
            >
              <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#002060",
                      boxShadow: "none",
                    }}
                  >
                    {TABLE_COLUMNS.map((col) => {
                      const sortKey =
                        col.sortKey ||
                        (col.key as keyof DealRecord | undefined);
                      const isSorted = sortKey && sortConfig.key === sortKey;

                      return (
                        <TableCell
                          key={col.key}
                          align={col.align || "center"}
                          sortDirection={
                            isSorted ? sortConfig.direction : false
                          }
                          sx={(theme) => ({
                            width: col.width,
                            maxWidth: col.width,
                            minWidth: col.width,
                            fontWeight: 700,
                            paddingX: 1.2,
                            paddingY: 1.1,
                            whiteSpace: "normal",

                            fontSize: "15px",
                            letterSpacing: "0.2px",
                            color: theme.palette.common.white,
                            backgroundColor: "#002060",
                            "&.MuiTableCell-stickyHeader": {
                              backgroundColor: "#002060",
                            },
                            zIndex: 2,
                            borderBottom: "2px solid #00163f",
                            borderRight: "1px solid rgba(255,255,255,0.25)",
                          })}
                        >
                          {sortKey ? (
                            <TableSortLabel
                              active={isSorted}
                              direction={
                                isSorted ? sortConfig.direction : "asc"
                              }
                              onClick={() => handleSortClick(col)}
                              sx={{
                                color: "inherit",
                                "&.Mui-active": {
                                  color: "inherit",
                                },
                                "& .MuiTableSortLabel-icon": {
                                  opacity: 0.75,
                                  color: "#fff",
                                  fontSize: "18px",
                                },
                              }}
                            >
                              {renderHeaderLabel(
                                col.label,
                                col.align || "center"
                              )}
                            </TableSortLabel>
                          ) : (
                            renderHeaderLabel(col.label, col.align || "center")
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {sortedData.map((row, idx) => {
                    const isSelected =
                      selectedDeal?.ticker === row.ticker &&
                      selectedDeal?.pricing_date === row.pricing_date;

                    return (
                      <TableRow
                        key={`${row.ticker}-${idx}`}
                        hover
                        onClick={() => setSelectedDeal(row)}
                        sx={(theme) => {
                          const isEven = idx % 2 === 0;

                          return {
                            cursor: "pointer",
                            backgroundColor: isSelected
                              ? alpha(theme.palette.success.main, 0.16)
                              : isEven
                              ? theme.palette.background.paper
                              : theme.palette.grey[50],

                            boxShadow: isSelected
                              ? `inset 3px 0 0 ${theme.palette.success.main}`
                              : "none",

                            transition:
                              "background-color 0.2s ease, box-shadow 0.2s ease",

                            "&:hover": {
                              backgroundColor: isSelected
                                ? alpha(theme.palette.success.main, 0.22)
                                : theme.palette.action.hover,
                            },
                          };
                        }}
                      >
                        {TABLE_COLUMNS.map((col) => {
                          const value =
                            col.key === "ticker_issuer"
                              ? renderTickerCell(row)
                              : col.render
                              ? col.render(row)
                              : (row as any)[col.key];

                          return (
                            <TableCell
                              key={col.key}
                              align={col.align || "center"}
                              sx={(theme) => ({
                                fontSize: 13,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                borderRight: `1px solid ${theme.palette.action.hover}`,
                                px: 1.2,
                                py: 0.7,
                              })}
                            >
                              {value}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box mt={0.75} display="flex" justifyContent="flex-end">
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Dot indicators: green = prediction aligns with actual; red = prediction disagrees with actual; grey = missing or neutral data.
            </Typography>
          </Box>

          {/* Details panel + prices chart */}
          <Box mt={2}>
            <DealDetailsPanel deal={selectedDeal} />
            <DealPricesChart deal={selectedDeal} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default DealsPredictionsTable;

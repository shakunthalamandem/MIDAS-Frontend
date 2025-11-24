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
import DealDetailsPanel from "./DealDetailsPanel";
import PredictionCell from "./PredictionCell";

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

const PREDICTION_COL_WIDTH = 190;

const TABLE_COLUMNS: ColumnConfig[] = [
  {
    key: "ticker",
    label: "Ticker",
    align: "left",
    width: 90,
    sortKey: "ticker",
  },
  {
    key: "pricing_date",
    label: "Pricing Date",
    align: "center",
    width: 120,
    sortKey: "pricing_date",
    render: (row) => (row.pricing_date ? row.pricing_date : "TBD"),
  },
  {
    key: "issuer_name",
    label: "Issuer Name",
    align: "left",
    width: 220,
    sortKey: "issuer_name",
  },
  {
    key: "sector",
    label: "Sector",
    align: "left",
    width: 180,
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
        <PredictionCell pred={row.t1d_pred} confidence={row.t1d_confidence} />
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
        <PredictionCell pred={row.t1w_pred} confidence={row.t1w_confidence} />
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
        <PredictionCell pred={row.t1m_pred} confidence={row.t1m_confidence} />
      </Box>
    ),
  },
];

type SortDirection = "asc" | "desc";

interface SortConfig {
  key: keyof DealRecord | null;
  direction: SortDirection;
}

/* ---------- Main component ---------- */

const DealsPredictionsTable: React.FC = () => {
  const [data, setData] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDeal, setSelectedDeal] = useState<DealRecord | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "pricing_date",
    direction: "desc",
  });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${apiUrl}/api/ai_ml_results/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
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
  }, [apiUrl, token]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => row.ticker.toLowerCase().includes(q));
  }, [data, search]);

  const getComparableValue = (
    row: DealRecord,
    key: keyof DealRecord
  ): string | number | null => {
    let value = row[key] as any;

    if (value === null || value === undefined || value === "") {
      return null;
    }

    // Special handling for pricing_date
    if (key === "pricing_date") {
      if (!value) return null;
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

      // Treat null/undefined/empty as "last"
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
      {/* Header + search */}
      <Box
        mb={2}
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        <Box>
          <Typography variant="h6" fontWeight={600}>
            IPO & FO Deals – Prediction Summary
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quick view of key deals with model predictions. Click a row to see
            the full breakdown below.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Showing {sortedData.length} deal
            {sortedData.length === 1 ? "" : "s"}
          </Typography>
        </Box>

        <TextField
          size="small"
          label="Search by ticker"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 220 }}
        />
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
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow
                    sx={(theme) => ({
                      backgroundColor: theme.palette.grey[100],
                      boxShadow: `inset 0 -1px 0 ${theme.palette.divider}`,
                    })}
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
                            paddingX: 1.5,
                            paddingY: 1.2,
                            whiteSpace: "normal",

                            // 🔥 Header Typography improvements
                            fontWeight: 700,
                            fontSize: "14.5px",
                            letterSpacing: "0.2px",
                            color: theme.palette.grey[900],

                            backgroundColor: theme.palette.grey[100],
                            borderBottom: `2px solid ${theme.palette.divider}`,
                            borderRight: `1px solid ${theme.palette.divider}`,
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
                                "& .MuiTableSortLabel-icon": {
                                  opacity: 1,
                                  fontSize: "18px", // bigger arrow
                                },
                                fontWeight: 700,
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
                              ? theme.palette.mode === "light"
                                ? theme.palette.primary.light + "20" // very light tint
                                : theme.palette.primary.dark + "40"
                              : isEven
                                ? theme.palette.background.paper
                                : theme.palette.grey[50],

                            // subtle left accent when selected
                            boxShadow: isSelected
                              ? `inset 3px 0 0 ${theme.palette.primary.main}`
                              : "none",

                            transition:
                              "background-color 0.2s ease, box-shadow 0.2s ease",

                            "&:hover": {
                              backgroundColor: isSelected
                                ? theme.palette.primary.light + "33" // slightly stronger tint
                                : theme.palette.action.hover,
                            },
                          };
                        }}
                      >
                        {TABLE_COLUMNS.map((col) => {
                          const isIssuerColumn = col.key === "issuer_name";
                          const value = col.render
                            ? col.render(row)
                            : (row as any)[col.key];

                          return (
                            <TableCell
                              key={col.key}
                              align={col.align || "center"}
                              sx={(theme) => ({
                                fontSize: 13,
                                whiteSpace: isIssuerColumn
                                  ? "normal"
                                  : "nowrap",
                                overflow: isIssuerColumn ? "visible" : "hidden",
                                textOverflow: isIssuerColumn
                                  ? "clip"
                                  : "ellipsis",
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                borderRight: `1px solid ${theme.palette.action.hover}`,
                                px: 1.5,
                                py: 0.75,
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

          {/* Details panel */}
          <Box mt={2}>
            <DealDetailsPanel deal={selectedDeal} />
          </Box>
        </>
      )}
    </Box>
  );
};

export default DealsPredictionsTable;

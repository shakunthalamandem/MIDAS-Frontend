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
  const [dealTypeFilter, setDealTypeFilter] = useState<DealTypeFilter>("FO");

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

  // Search by ticker OR issuer, then filter by IPO / FO
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

    rows = rows.filter((row) => {
      const type = (row.deal_type || "").toUpperCase();
      return type.includes(dealTypeFilter);
    });

    return rows;
  }, [data, search, dealTypeFilter]);

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
      {/* Header + filters + search */}
      <Box
        mb={2}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        gap={1.5}
      >
        

     <Box
  display="flex"
  justifyContent="center" // center horizontally
  width="100%"            // make the Box take full width
>
  <Box
    display="flex"
    alignItems="center"
    gap={1}
    flexWrap="wrap"
  >
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
                            fontWeight: 700,
                            paddingX: 1.2,
                            paddingY: 1.1,
                            whiteSpace: "normal",

                            // fontWeight: 800,
                            fontSize: "15px",
                            letterSpacing: "0.2px",
                            color: theme.palette.primary.main,

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
                              sx={(theme) => ({
                                color: theme.palette.primary.main,
                                "&.Mui-active": {
                                  color: theme.palette.primary.main,
                                },
                                "& .MuiTableSortLabel-icon": {
                                  opacity: 0.35,
                                  color: theme.palette.primary.light,
                                  fontSize: "18px",
                                },
                              })}
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
                          const value = col.render
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

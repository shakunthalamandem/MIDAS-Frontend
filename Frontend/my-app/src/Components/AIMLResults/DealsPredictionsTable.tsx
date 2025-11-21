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
} from "@mui/material";

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
  key: string;
  label: string;
  align?: Align;
  width?: number;
  sticky?: "left" | "right";
  render?: (row: DealRecord) => React.ReactNode;
}

const formatNumber = (
  value: number | string | null | undefined,
  options?: { suffix?: string; decimals?: number }
): string => {
  const { suffix = "", decimals = 2 } = options || {};
  if (value === null || value === undefined || value === "") return "";
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return String(value);
  const base =
    Math.abs(num) >= 1000
      ? num.toLocaleString(undefined, { maximumFractionDigits: decimals })
      : num.toFixed(decimals).replace(/\.00$/, "");
  return suffix ? `${base}${suffix}` : base;
};

const parseConfidence = (value: number | string): number | null => {
  if (value === "" || value === null || value === undefined) return null;
  const num = typeof value === "string" ? Number(value) : value;
  if (isNaN(num)) return null;
  return num;
};

const PredictionCell: React.FC<{ pred: string; confidence: number | string }> = ({
  pred,
  confidence,
}) => {
  const confNum = parseConfidence(confidence);
  const hasPred = !!pred;
  const hasConf = confNum !== null;

  if (!hasPred && !hasConf) {
    return <Typography variant="body2">-</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        rowGap: 0.25,
      }}
    >
      {hasPred && (
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {pred}
        </Typography>
      )}
      {hasConf && (
        <Typography variant="caption" color="text.secondary">
          {confNum!.toFixed(1)}%
        </Typography>
      )}
    </Box>
  );
};

const ActualCell: React.FC<{ value: number | string }> = ({ value }) => {
  const hasActual =
    value !== "" && value !== null && value !== undefined && !isNaN(Number(value));
  if (!hasActual) {
    return <Typography variant="body2">-</Typography>;
  }
  return (
    <Typography variant="body2">
      {formatNumber(value, { suffix: "%", decimals: 2 })}
    </Typography>
  );
};

/**
 * Sticky left columns – core info (very compact)
 */
const LEFT_COLUMNS: ColumnConfig[] = [
  {
    key: "ticker",
    label: "Ticker",
    align: "left",
    sticky: "left",
    width: 70,
  },
  {
    key: "pricing_date",
    label: "Date",
    align: "center",
    sticky: "left",
    width: 80,
  },
  {
    key: "issuer_name",
    label: "Issuer",
    align: "left",
    sticky: "left",
    width: 160,
  },
  {
    key: "deal_type",
    label: "Type",
    align: "center",
    sticky: "left",
    width: 70,
  },
];

const LAST_LEFT_KEY = LEFT_COLUMNS[LEFT_COLUMNS.length - 1].key;

/**
 * Middle scrollable columns only
 */
const MIDDLE_COLUMNS: ColumnConfig[] = [
  { key: "fo_type", label: "FO", align: "center", width: 90 },
  { key: "region", label: "Region", align: "center", width: 90 },
  { key: "sector", label: "Sector", align: "center", width: 130 },
  {
    key: "deal_size",
    label: "Deal Size",
    align: "right",
    width: 130,
    render: (row) => formatNumber(row.deal_size),
  },
  {
    key: "issue_price",
    label: "Issue Px",
    align: "right",
    width: 110,
    render: (row) => formatNumber(row.issue_price),
  },
  {
    key: "discount_from_announcement_price",
    label: "Disc vs Annc (%)",
    align: "right",
    width: 150,
    render: (row) =>
      formatNumber(row.discount_from_announcement_price, { suffix: "%" }),
  },
  {
    key: "allocation_as_percentage_of_deal_size",
    label: "Alloc % Deal",
    align: "right",
    width: 120,
    render: (row) =>
      formatNumber(row.allocation_as_percentage_of_deal_size, {
        suffix: "%",
      }),
  },
  {
    key: "allocation_as_percentage_of_ioi",
    label: "Alloc % IOI",
    align: "right",
    width: 120,
    render: (row) =>
      formatNumber(row.allocation_as_percentage_of_ioi, { suffix: "%" }),
  },
];

/**
 * Right sticky block – 4 horizons: 1D Close, 1D Open, 1W, 1M (Pred + Actual)
 */
const RIGHT_COLUMNS: ColumnConfig[] = [
  {
    key: "t1d_close_pred",
    label: "1st Day Close",
    align: "center",
    sticky: "right",
    width: 90,
    render: (row) => (
      <PredictionCell pred={row.t1d_pred} confidence={row.t1d_actual_return} />
    ),
  },
  {
    key: "t1d_open_pred",
    label: "1st Day Open to Close",
    align: "center",
    sticky: "right",
    width: 90,
    render: (row) => (
      <PredictionCell
        pred={row.t1d_openprice_pred}
        confidence={row.t1d_openprice_actual_return}
      />
    ),
  },
  {
    key: "t1w_pred",
    label: "1 Week",
    align: "center",
    sticky: "right",
    width: 90,
    render: (row) => (
      <PredictionCell pred={row.t1w_pred} confidence={row.t1w_actual_return} />
    ),
  },
  {
    key: "t1m_pred",
    label: "1 Month",
    align: "center",
    sticky: "right",
    width: 90,
    render: (row) => (
      <PredictionCell pred={row.t1m_pred} confidence={row.t1m_actual_return} />
    ),
  },
];

const FIRST_RIGHT_KEY = RIGHT_COLUMNS[0].key;

const ALL_COLUMNS: ColumnConfig[] = [
  ...LEFT_COLUMNS,
  ...MIDDLE_COLUMNS,
  ...RIGHT_COLUMNS,
];

/**
 * Helper: dynamic offsets for sticky columns
 */
const getLeftOffset = (key: string): number => {
  let offset = 0;
  for (const col of LEFT_COLUMNS) {
    if (col.key === key) break;
    offset += col.width ?? 100;
  }
  return offset;
};

const getRightOffset = (key: string): number => {
  let offset = 0;
  for (let i = RIGHT_COLUMNS.length - 1; i >= 0; i--) {
    const col = RIGHT_COLUMNS[i];
    if (col.key === key) break;
    offset += col.width ?? 90;
  }
  return offset;
};

const DealsPredictionsTable: React.FC = () => {
  const [data, setData] = useState<DealRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

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

  return (
    <Box>
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
            Left: core info · Center: deal details (scroll) · Right: 1D close, 1D
            open, 1W & 1M (pred + actual)
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

      {!loading && !error && filteredData.length === 0 && (
        <Alert severity="info">No deals found for the selected criteria.</Alert>
      )}

      {!loading && !error && filteredData.length > 0 && (
        <Paper elevation={1}>
          <TableContainer
            sx={{
              maxHeight: 520,
              overflowX: "auto",
              // === IMPORTANT: create new stacking context so sticky z-index works predictably
              position: "relative",
              isolation: "isolate",
            }}
          >
            <Table
              stickyHeader
              size="small"
              sx={{
                minWidth: 1300,
                // make table create its own stacking context as well
                position: "relative",
              }}
            >
              <TableHead>
                <TableRow>
                  {ALL_COLUMNS.map((col) => {
                    const align: Align = col.align || "center";
                    const left =
                      col.sticky === "left" ? getLeftOffset(col.key) : undefined;
                    const right =
                      col.sticky === "right"
                        ? getRightOffset(col.key)
                        : undefined;

                    const isLeftSticky = col.sticky === "left";
                    const isRightSticky = col.sticky === "right";
                    const isSeparatorLeft = col.key === LAST_LEFT_KEY;
                    const isSeparatorRight = col.key === FIRST_RIGHT_KEY;

                    return (
                      <TableCell
                        key={col.key}
                        align={align}
                        sx={{
                          top: 0,
                          // ensure sticky headers sit above everything when scrolled
                          zIndex: isLeftSticky || isRightSticky ? 6 : 4,
                          position: "sticky",
                          left,
                          right,
                          // opaque background so scrolled middle cells don't show through
                          backgroundColor: (theme) =>
                            isLeftSticky || isRightSticky
                              ? theme.palette.background.paper
                              : theme.palette.grey[100],
                          width: col.width,
                          maxWidth: col.width,
                          minWidth: col.width,
                          px: 1,
                          fontWeight: 600,
                          borderRight:
                            isSeparatorLeft
                              ? (theme) => `2px solid ${theme.palette.primary.main}`
                              : 0,
                          borderLeft:
                            isSeparatorRight
                              ? (theme) =>
                                  `2px solid ${theme.palette.primary.main}`
                              : undefined,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          boxShadow:
                            isLeftSticky
                              ? "2px 0 4px rgba(15,23,42,0.1)"
                              : isRightSticky
                              ? "-2px 0 4px rgba(15,23,42,0.1)"
                              : "none",
                        }}
                      >
                        {col.label}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredData.map((row, idx) => (
                  <TableRow
                    key={`${row.ticker}-${idx}`}
                    hover
                    sx={{
                      "& td": {
                        py: 1.5,
                      },
                    }}
                  >
                    {ALL_COLUMNS.map((col) => {
                      const align: Align = col.align || "center";
                      const left =
                        col.sticky === "left"
                          ? getLeftOffset(col.key)
                          : undefined;
                      const right =
                        col.sticky === "right"
                          ? getRightOffset(col.key)
                          : undefined;

                      const isLeftSticky = col.sticky === "left";
                      const isRightSticky = col.sticky === "right";
                      const isSeparatorLeft = col.key === LAST_LEFT_KEY;
                      const isSeparatorRight = col.key === FIRST_RIGHT_KEY;

                      const rawValue =
                        col.key in row ? (row as any)[col.key] : undefined;
                      const value = col.render ? col.render(row) : rawValue;

                      return (
                        <TableCell
                          key={col.key}
                          align={align}
                          sx={{
                            // IMPORTANT: body sticky cells must be sticky and above middle cells
                            position:
                              isLeftSticky || isRightSticky ? "sticky" : "static",
                            left,
                            right,
                            // sticky cells get a solid background so center columns are hidden under them
                            backgroundColor: (theme) =>
                              isLeftSticky || isRightSticky
                                ? theme.palette.background.paper + "" // opaque
                                : "inherit",
                            // body sticky z-index lower than header but above normal cells
                            zIndex: isLeftSticky || isRightSticky ? 5 : 1,
                            width: col.width,
                            maxWidth: col.width,
                            minWidth: col.width,
                            px: 1,
                            borderRight:
                              isSeparatorLeft
                                ? (theme) =>
                                    `2px solid ${theme.palette.primary.main}`
                                : 0,
                            borderLeft:
                              isSeparatorRight
                                ? (theme) =>
                                    `2px solid ${theme.palette.primary.main}`
                                : undefined,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            boxShadow:
                              isLeftSticky
                                ? "2px 0 4px rgba(15,23,42,0.08)"
                                : isRightSticky
                                ? "-2px 0 4px rgba(15,23,42,0.08)"
                                : "none",
                          }}
                        >
                          {value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default DealsPredictionsTable;
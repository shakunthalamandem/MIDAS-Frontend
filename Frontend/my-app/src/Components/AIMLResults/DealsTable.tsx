// DealsTable.tsx
import React, { useMemo } from "react";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import PredictionCell from "./PredictionCell";
import type { DealRecord, SortConfig } from "./types";

type Align = "left" | "center" | "right";

interface ColumnConfig {
  key: keyof DealRecord | string;
  label: string; // can contain "\n"
  align?: Align;
  width?: number;
  render?: (row: DealRecord) => React.ReactNode;
  sortKey?: keyof DealRecord;
}

type ReturnSign = "positive" | "negative" | "neutral" | null;

const PREDICTION_COL_WIDTH = 160;
const AI_COL_WIDTH = 150;

// IMPORTANT for sticky offsets
const GROUP_HEADER_HEIGHT = 40; // px (merged header row)
const COLUMN_HEADER_HEIGHT = 58; // px (column header row; adjust if needed)

const getPredictionSign = (pred: string): ReturnSign => {
  const normalized = pred?.toLowerCase() || "";
  if (!normalized) return null;
  if (
    normalized.includes("positive") ||
    normalized.includes("pos") ||
    normalized.includes("up")
  ) {
    return "positive";
  }
  if (
    normalized.includes("negative") ||
    normalized.includes("neg") ||
    normalized.includes("down")
  ) {
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

const PredictionOutcomeIndicator: React.FC<{
  pred: string;
  actual: number | string;
}> = ({ pred, actual }) => {
  const predSign = getPredictionSign(pred);
  const actualSign = getActualSign(actual);

  if (!predSign || !actualSign || actualSign === "neutral") return null;

  const isMismatch = predSign !== actualSign;

  return (
    <Box
      component="span"
      title={
        isMismatch
          ? "Prediction disagrees with actual"
          : "Prediction aligns with actual"
      }
      sx={{
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1,
        color: isMismatch ? "error.main" : "success.main",
      }}
    >
      {isMismatch ? "✕" : "✓"}
    </Box>
  );
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

const GroupHeaderCell: React.FC<{
  label: string;
  colSpan: number;
  tone?: "default" | "primary" | "secondary";
  isLast?: boolean;
}> = ({ label, colSpan, tone = "default", isLast }) => {
  return (
    <TableCell
      align="center"
      colSpan={colSpan}
      sx={(theme) => ({
        position: "sticky",
        top: 0,
        zIndex: 5, // must be >= column header zIndex
        height: GROUP_HEADER_HEIGHT,
        py: 0,
        background: `linear-gradient(180deg, #00163f 0%, #001032 100%)`,
        borderBottom: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
        borderRight: isLast
          ? "none"
          : `1px solid ${alpha(theme.palette.common.white, 0.16)}`,
      })}
    >
      <Chip
        size="small"
        label={label}
        color={tone === "primary" ? "primary" : tone === "secondary" ? "secondary" : "default"}
        sx={(theme) => ({
          fontWeight: 800,
          letterSpacing: 0.8,
          textTransform: "uppercase",
          fontSize: 11,
          backgroundColor:
            tone === "default"
              ? alpha(theme.palette.common.white, 0.14)
              : undefined,
          color:
            tone === "default"
              ? theme.palette.common.white
              : theme.palette.common.white,
          "& .MuiChip-label": { px: 1.2 },
        })}
      />
    </TableCell>
  );
};

interface DealsTableProps {
  rows: DealRecord[];
  sortConfig: SortConfig;
  onSortChange: (sortKey: keyof DealRecord) => void;

  selectedDeal: DealRecord | null;
  onSelectDeal: (row: DealRecord) => void;

  onTickerClick?: (payload: { ticker: string; trade_date: string }) => void;

  // ✅ add this
  dealTypeFilter: "IPO" | "FO";
}

const DealsTable: React.FC<DealsTableProps> = ({
  rows,
  sortConfig,
  onSortChange,
  selectedDeal,
  onSelectDeal,
  onTickerClick,
  dealTypeFilter,
}) => {
  const showAI = dealTypeFilter === "IPO";

  const columns: ColumnConfig[] = useMemo(() => {
    const base: ColumnConfig[] = [
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
              sx={{ fontWeight: 700, lineHeight: 1.2, cursor: "pointer" }}
              onClick={(e) => {
                e.stopPropagation();
                onTickerClick?.({ ticker: row.ticker, trade_date: row.trade_date });
              }}
            >
              {row.ticker}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
              {row.issuer_name}
            </Typography>
          </Box>
        ),
      },
      {
        key: "trade_date",
        label: "Trade Date",
        align: "center",
        width: 110,
        sortKey: "trade_date",
        render: (row) => (row.trade_date ? row.trade_date : "TBD"),
      },
      {
        key: "sector",
        label: "Sector",
        align: "left",
        width: 150,
        sortKey: "sector",
      },
    ];

    const aiCols: ColumnConfig[] = [
      {
        key: "fs_1w_sentiment",
        label: "1 Week\nSentiment",
        align: "center",
        width: AI_COL_WIDTH,
        sortKey: "fs_1w_sentiment",
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.fs_1w_sentiment || "—"}
          </Typography>
        ),
      },
      {
        key: "fs_1m_sentiment",
        label: "1 Month\nSentiment",
        align: "center",
        width: AI_COL_WIDTH,
        sortKey: "fs_1m_sentiment",
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {row.fs_1m_sentiment || "—"}
          </Typography>
        ),
      },
    ];

    const mlCols: ColumnConfig[] = [
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
                <PredictionOutcomeIndicator pred={row.t1d_pred} actual={row.t1d_actual_return} />
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
                <PredictionOutcomeIndicator
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
                <PredictionOutcomeIndicator pred={row.t1w_pred} actual={row.t1w_actual_return} />
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
                <PredictionOutcomeIndicator pred={row.t1m_pred} actual={row.t1m_actual_return} />
              }
            />
          </Box>
        ),
      },
    ];

    return showAI ? [...base, ...aiCols, ...mlCols] : [...base, ...mlCols];
  }, [onTickerClick, showAI]);

  const groupSpans = useMemo(() => {
    const dealDetails = 3;
    const ai = showAI ? 2 : 0;
    const ml = 4;
    return { dealDetails, ai, ml };
  }, [showAI]);

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 420, overflowX: "auto" }}>
        <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            {/* Group header row (sticky) */}
            <TableRow>
              <GroupHeaderCell
                label="Deal Details"
                colSpan={groupSpans.dealDetails}
                tone="default"
                isLast={!showAI && groupSpans.ml === 4 ? false : false}
              />
              {showAI && (
                <GroupHeaderCell
                  label="AI Models"
                  colSpan={groupSpans.ai}
                  tone="secondary"
                />
              )}
              <GroupHeaderCell
                label="ML Models"
                colSpan={groupSpans.ml}
                tone="primary"
                isLast
              />
            </TableRow>

            {/* Column header row (sticky, pushed below group row) */}
            <TableRow>
              {columns.map((col) => {
                const sortKey =
                  col.sortKey || (col.key as keyof DealRecord | undefined);
                const isSorted = sortKey && sortConfig.key === sortKey;

                return (
                  <TableCell
                    key={String(col.key)}
                    align={col.align || "center"}
                    sortDirection={isSorted ? sortConfig.direction : false}
                    sx={(theme) => ({
                      position: "sticky",
                      top: GROUP_HEADER_HEIGHT, // ✅ stick below merged header
                      zIndex: 4,
                      height: COLUMN_HEADER_HEIGHT,

                      width: col.width,
                      maxWidth: col.width,
                      minWidth: col.width,

                      fontWeight: 800,
                      px: 1.2,
                      py: 1.1,
                      whiteSpace: "normal",
                      fontSize: "14px",
                      letterSpacing: "0.2px",

                      color: theme.palette.common.white,
                      backgroundColor: "#002060",

                      borderBottom: "2px solid #00163f",
                      borderRight: `1px solid ${alpha(theme.palette.common.white, 0.22)}`,
                    })}
                  >
                    {sortKey ? (
                      <TableSortLabel
                        active={Boolean(isSorted)}
                        direction={isSorted ? sortConfig.direction : "asc"}
                        onClick={() => onSortChange(sortKey)}
                        sx={{
                          color: "inherit",
                          "&.Mui-active": { color: "inherit" },
                          "& .MuiTableSortLabel-icon": {
                            opacity: 0.85,
                            color: "#fff",
                            fontSize: "18px",
                          },
                        }}
                      >
                        {renderHeaderLabel(col.label, col.align || "center")}
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
            {rows.map((row, idx) => {
              const isSelected =
                selectedDeal?.ticker === row.ticker &&
                selectedDeal?.trade_date === row.trade_date;

              return (
                <TableRow
                  key={`${row.ticker}-${row.trade_date}-${idx}`}
                  hover
                  onClick={() => onSelectDeal(row)}
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
                  {columns.map((col) => {
                    const value = col.render ? col.render(row) : (row as any)[col.key];

                    return (
                      <TableCell
                        key={String(col.key)}
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

      <Box mt={0.75} px={1.25} pb={1} display="flex" justifyContent="flex-end">
        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
          Indicators: ✓ = prediction aligns with actual, ✕ = prediction disagrees, blank = missing/neutral.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DealsTable;

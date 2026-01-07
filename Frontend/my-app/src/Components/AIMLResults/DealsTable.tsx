// DealsTable.tsx
import React, { useMemo } from "react";
import {
  Box,
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
import type { DealRecord, SortConfig } from "./types"; // Adjust path as needed

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
const AI_COL_WIDTH = 140;

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
      title={isMismatch ? "Prediction disagrees with actual" : "Prediction aligns with actual"}
      sx={{
        fontSize: 14,
        fontWeight: 700,
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
        align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center"
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

const GroupHeaderCell: React.FC<{ label: string; colSpan: number }> = ({ label, colSpan }) => {
  return (
    <TableCell
      align="center"
      colSpan={colSpan}
      sx={(theme) => ({
        fontWeight: 800,
        letterSpacing: 0.6,
        textTransform: "uppercase",
        fontSize: 12,
        color: theme.palette.common.white,
        backgroundColor: "#00163f",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
        borderRight: "1px solid rgba(255,255,255,0.25)",
        py: 0.7,
      })}
    >
      {label}
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
}

const DealsTable: React.FC<DealsTableProps> = ({
  rows,
  sortConfig,
  onSortChange,
  selectedDeal,
  onSelectDeal,
  onTickerClick,
}) => {
  const columns: ColumnConfig[] = useMemo(
    () => [
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

      // --- AI models (new) ---
      {
        key: "fs_1w_sentiment",
        label: "1st Week Sentiment",
        align: "center",
        width: AI_COL_WIDTH,
        sortKey: "fs_1w_sentiment",
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.fs_1w_sentiment || "—"}
          </Typography>
        ),
      },
      {
        key: "fs_1m_sentiment",
        label: "1st Month Sentiment",
        align: "center",
        width: AI_COL_WIDTH,
        sortKey: "fs_1m_sentiment",
        render: (row) => (
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.fs_1m_sentiment || "—"}
          </Typography>
        ),
      },

      // --- ML models (existing) ---
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
              trailingAdornment={<PredictionOutcomeIndicator pred={row.t1d_pred} actual={row.t1d_actual_return} />}
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
              trailingAdornment={<PredictionOutcomeIndicator pred={row.t1w_pred} actual={row.t1w_actual_return} />}
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
              trailingAdornment={<PredictionOutcomeIndicator pred={row.t1m_pred} actual={row.t1m_actual_return} />}
            />
          </Box>
        ),
      },
    ],
    [onTickerClick]
  );

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
      <TableContainer sx={{ maxHeight: 420, overflowX: "auto" }}>
        <Table stickyHeader size="small" sx={{ tableLayout: "fixed" }}>
          <TableHead>
            {/* Group header row */}
            <TableRow>
              <GroupHeaderCell label="Deal Details" colSpan={3} />
              <GroupHeaderCell label="AI Models" colSpan={2} />
              <GroupHeaderCell label="ML Models" colSpan={4} />
            </TableRow>

            {/* Column header row */}
            <TableRow sx={{ backgroundColor: "#002060", boxShadow: "none" }}>
              {columns.map((col) => {
                const sortKey = col.sortKey || (col.key as keyof DealRecord | undefined);
                const isSorted = sortKey && sortConfig.key === sortKey;

                return (
                  <TableCell
                    key={String(col.key)}
                    align={col.align || "center"}
                    sortDirection={isSorted ? sortConfig.direction : false}
                    sx={(theme) => ({
                      width: col.width,
                      maxWidth: col.width,
                      minWidth: col.width,
                      fontWeight: 700,
                      px: 1.2,
                      py: 1.1,
                      whiteSpace: "normal",
                      fontSize: "15px",
                      letterSpacing: "0.2px",
                      color: theme.palette.common.white,
                      backgroundColor: "#002060",
                      "&.MuiTableCell-stickyHeader": { backgroundColor: "#002060" },
                      zIndex: 2,
                      borderBottom: "2px solid #00163f",
                      borderRight: "1px solid rgba(255,255,255,0.25)",
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
                            opacity: 0.75,
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
                selectedDeal?.ticker === row.ticker && selectedDeal?.trade_date === row.trade_date;

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
                      transition: "background-color 0.2s ease, box-shadow 0.2s ease",
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
          Dot indicators: green = prediction aligns with actual; red = prediction disagrees with actual; grey = missing or neutral data.
        </Typography>
      </Box>
    </Paper>
  );
};

export default DealsTable;

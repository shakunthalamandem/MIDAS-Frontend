import React from "react";
import {
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TableSortLabel,
} from "@mui/material";
import { ChevronDown } from "lucide-react";
import { ActionBadge } from "./ActionBadge";
import { ConvictionStars } from "./ConvictionStars";

export interface RankingRow {
  rank: number;
  ticker: string;
  action: string;
  sector: string;
  current_vs_ipo: string;
  conviction_rating: number;
  forward_sentiment_score: number;
}

interface Props {
  rows: RankingRow[];
  onSelectTicker: (ticker: string) => void;
  selectedTicker: string | null;
}

type Order = "asc" | "desc";
type SortKey = keyof RankingRow;

const ipoTextColor: Record<string, "success" | "info" | "warning"> = {
  "Above IPO": "success",
  "At IPO": "info",
  "Below IPO": "warning",
};

const headerSx = {
  color: "#fff",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: 0.5,
  textTransform: "uppercase" as const,
  backgroundColor: "#071852",
  borderBottom: "none",
  py: 1.5,
};

const ipoSortOrder: Record<string, number> = {
  "Below IPO": 1,
  "At IPO": 2,
  "Above IPO": 3,
};

const actionSortOrder: Record<string, number> = {
  Sell: 1,
  Hold: 2,
  Buy: 3,
};

export const RankingTable = ({ rows, onSelectTicker, selectedTicker }: Props) => {
  const [orderBy, setOrderBy] = React.useState<SortKey>("forward_sentiment_score");
  const [order, setOrder] = React.useState<Order>("desc");

  const handleSort = (property: SortKey) => {
    const isSame = orderBy === property;
    setOrder(isSame && order === "asc" ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedRows = React.useMemo(() => {
    const data = [...rows];

    data.sort((a, b) => {
      let aValue: string | number = a[orderBy];
      let bValue: string | number = b[orderBy];

      if (orderBy === "current_vs_ipo") {
        aValue = ipoSortOrder[a.current_vs_ipo] ?? 0;
        bValue = ipoSortOrder[b.current_vs_ipo] ?? 0;
      }

      if (orderBy === "action") {
        aValue = actionSortOrder[a.action] ?? 0;
        bValue = actionSortOrder[b.action] ?? 0;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        const result = aValue.localeCompare(bValue);
        return order === "asc" ? result : -result;
      }

      const result = Number(aValue) - Number(bValue);
      return order === "asc" ? result : -result;
    });

    return data;
  }, [rows, order, orderBy]);

  const sortableHeader = (label: string, key: SortKey) => (
    <TableSortLabel
      active={orderBy === key}
      direction={orderBy === key ? order : "asc"}
      hideSortIcon={false}
      onClick={() => handleSort(key)}
      sx={{
        color: "#fff !important",
        "& .MuiTableSortLabel-icon": {
          color: "#fff !important",
          opacity: 1,
        },
      }}
    >
      {label}
    </TableSortLabel>
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
      }}
    >
      <TableContainer sx={{ maxHeight: 405 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={headerSx}>{sortableHeader("Ticker", "ticker")}</TableCell>
              <TableCell sx={headerSx}>{sortableHeader("Action", "action")}</TableCell>
              <TableCell sx={headerSx}>{sortableHeader("Current vs IPO", "current_vs_ipo")}</TableCell>
              <TableCell sx={headerSx}>{sortableHeader("Conviction", "conviction_rating")}</TableCell>
              <TableCell sx={headerSx}>{sortableHeader("Sentiment", "forward_sentiment_score")}</TableCell>
              <TableCell align="center" sx={{ ...headerSx, width: 40 }} />
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.map((row, idx) => {
              const isActive = selectedTicker === row.ticker;

              return (
                <TableRow
                  key={row.ticker}
                  hover
                  selected={isActive}
                  onClick={() => onSelectTicker(row.ticker)}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: isActive
                      ? "#eff6ff"
                      : idx % 2 === 0
                      ? "#fff"
                      : "#f8fafc",
                    "&:hover": {
                      backgroundColor: isActive ? "#dbeafe" : "#eef2ff",
                    },
                    borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                    transition: "background-color 0.15s",
                  }}
                >
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      color: "#002060",
                      fontSize: 13,
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      {row.ticker}
                      <ChevronDown size={16} color={isActive ? "#2563eb" : "#94a3b8"} />
                    </span>
                  </TableCell>

                  <TableCell>
                    <ActionBadge action={row.action} />
                  </TableCell>

                  <TableCell>
                    <Chip
                      label={row.current_vs_ipo}
                      color={ipoTextColor[row.current_vs_ipo] ?? "default"}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>

                  <TableCell>
                    <ConvictionStars rating={row.conviction_rating} />
                  </TableCell>

                  <TableCell sx={{ width: 100, fontWeight: 700, color: "#002060", fontSize: 14 }}>
                    {row.forward_sentiment_score}
                  </TableCell>

                  <TableCell align="center" />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
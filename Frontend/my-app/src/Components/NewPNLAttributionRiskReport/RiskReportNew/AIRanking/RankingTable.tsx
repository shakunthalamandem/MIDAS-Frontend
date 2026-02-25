import React from "react";
import {
  Box,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
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

const ipoTextColor: Record<string, "success" | "info" | "warning"> = {
  "Above IPO": "success",
  "At IPO": "info",
  "Below IPO": "warning",
};

const headerSx = {
  color: "#475569",
  fontWeight: 700,
  fontSize: 11,
  letterSpacing: 0.5,
  textTransform: "uppercase" as const,
  backgroundColor: "#f8fafc",
  borderBottom: "2px solid #e2e8f0",
  py: 1.5,
};

export const RankingTable = ({ rows, onSelectTicker, selectedTicker }: Props) => (
  <Paper
    elevation={0}
    sx={{
      borderRadius: 3,
      overflow: "hidden",
      border: "1px solid #e2e8f0",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
    }}
  >
    <TableContainer sx={{ maxHeight: 420 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerSx}>Ticker</TableCell>
            <TableCell sx={headerSx}>Action</TableCell>
            <TableCell sx={headerSx}>Sector</TableCell>
            <TableCell sx={headerSx}>Current vs IPO</TableCell>
            <TableCell sx={headerSx}>Conviction</TableCell>
            <TableCell sx={headerSx}>Sentiment</TableCell>
            <TableCell align="center" sx={{ ...headerSx, width: 40 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => {
            const isActive = selectedTicker === row.ticker;
            return (
              <TableRow
                key={row.ticker}
                hover
                selected={isActive}
                onClick={() => onSelectTicker(row.ticker)}
                sx={{
                  cursor: "pointer",
                  backgroundColor: isActive ? "#eff6ff" : "transparent",
                  "&:hover": { backgroundColor: isActive ? "#eff6ff" : "#f8fafc" },
                  borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                }}
              >
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>{row.ticker}</TableCell>
                <TableCell>
                  <ActionBadge action={row.action} />
                </TableCell>
                <TableCell sx={{ color: "#475569", fontSize: 13 }}>{row.sector}</TableCell>
                <TableCell>
                  <Chip label={row.current_vs_ipo} color={ipoTextColor[row.current_vs_ipo] ?? "default"} size="small" variant="outlined" />
                </TableCell>
                <TableCell>
                  <ConvictionStars rating={row.conviction_rating} />
                </TableCell>
                <TableCell sx={{ width: 100, fontWeight: 600, color: "#475569" }}>
                  {row.forward_sentiment_score}
                </TableCell>
                <TableCell align="center">
                  <ChevronRight size={16} color={isActive ? "#2563eb" : "#94a3b8"} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

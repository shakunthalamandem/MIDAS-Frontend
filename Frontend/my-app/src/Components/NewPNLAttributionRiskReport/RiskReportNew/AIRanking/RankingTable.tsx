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
  Typography,
} from "@mui/material";
import { ChevronRight } from "lucide-react";
import { ActionBadge } from "./ActionBadge";
import { ConvictionStars } from "./ConvictionStars";
import { SentimentBar } from "./SentimentBar";

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

export const RankingTable = ({ rows, onSelectTicker, selectedTicker }: Props) => (
  <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
    <Box px={3} py={2} display="flex" justifyContent="space-between" alignItems="center">
      <Typography variant="subtitle2" color="text.secondary" letterSpacing={2}>
        Rankings · {rows.length} Positions
      </Typography>
      <Typography variant="caption" color="text.secondary">
        Click to expand →
      </Typography>
    </Box>
    <TableContainer sx={{ maxHeight: 520 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Ticker</TableCell>
            <TableCell>Action</TableCell>
            <TableCell>Sector</TableCell>
            <TableCell>vs IPO</TableCell>
            <TableCell>Conviction</TableCell>
            <TableCell>Sentiment</TableCell>
            <TableCell align="center"></TableCell>
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
                sx={{ cursor: "pointer" }}
              >
                <TableCell>{row.rank}</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>{row.ticker}</TableCell>
                <TableCell>
                  <ActionBadge action={row.action} />
                </TableCell>
                <TableCell>{row.sector}</TableCell>
                <TableCell>
                  <Chip label={row.current_vs_ipo} color={ipoTextColor[row.current_vs_ipo] ?? "default"} size="small" />
                </TableCell>
                <TableCell>
                  <ConvictionStars rating={row.conviction_rating} />
                </TableCell>
                <TableCell sx={{ width: 160 }}>
                  <SentimentBar score={(row.forward_sentiment_score - 3) / 2} label="Sentiment" />
                </TableCell>
                <TableCell align="center">
                  <ChevronRight size={16} color={isActive ? "#1d4ed8" : "#64748b"} />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

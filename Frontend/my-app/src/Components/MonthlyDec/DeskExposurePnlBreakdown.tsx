import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  TableSortLabel,
} from "@mui/material";
import {
  fetchDeskExposureBreakdown,
  DeskExposureRow,
} from "./monthlyDecApi";
import { formatDollarsCompact, pnlColor } from "./monthlyDecFormat";

const HEADER_BG = "#5a7ab8";

const COLUMNS: Array<{
  key: keyof DeskExposureRow;
  label: string;
  isCurrency: boolean;
  colorize: boolean;
}> = [
  { key: "desk", label: "ANALYST", isCurrency: false, colorize: false },
  { key: "ytd_pnl", label: "YTD P&L", isCurrency: true, colorize: true },
  { key: "gross_market_value", label: "Gross Market Value", isCurrency: true, colorize: false },
  { key: "net_notional_exp", label: "Net Notional Exposure", isCurrency: true, colorize: true },
  { key: "delta_adj_net_exp", label: "Delta Adjusted Net Exp", isCurrency: true, colorize: true },
  { key: "beta_adj_net_exp", label: "Beta Adjusted Net Exp", isCurrency: true, colorize: true },
];

type SortKey = keyof DeskExposureRow;

interface Props {
  fund?: string;
}

const DeskExposurePnlBreakdown: React.FC<Props> = ({ fund }) => {
  const [rows, setRows] = useState<DeskExposureRow[]>([]);
  const [total, setTotal] = useState<DeskExposureRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("gross_market_value");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchDeskExposureBreakdown(fund);
        if (!cancelled) {
          setRows(resp.rows || []);
          setTotal(resp.total || null);
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [fund]);

  const sortedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "string" && typeof bv === "string") {
        return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
      }
      return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "desk" ? "asc" : "desc");
    }
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Box mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1f3a8a" }}>
          Exposure & P&L Breakdown by Analyst / Strategy Desk
        </Typography>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress size={28} />
        </Box>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : sortedRows.length === 0 ? (
        <Typography align="center" color="text.secondary">No data available</Typography>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: HEADER_BG }}>
                {COLUMNS.map((c, i) => (
                  <TableCell
                    key={c.key as string}
                    align={i === 0 ? "left" : "right"}
                    sx={{ color: "#fff", fontWeight: 700, fontSize: 12 }}
                  >
                    <TableSortLabel
                      active={sortKey === c.key}
                      direction={sortKey === c.key ? sortDir : "asc"}
                      onClick={() => handleSort(c.key)}
                      sx={{
                        color: "#fff !important",
                        "& .MuiTableSortLabel-icon": { color: "#fff !important" },
                      }}
                    >
                      {c.label}
                    </TableSortLabel>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRows.map((row, idx) => (
                <TableRow
                  key={row.desk}
                  sx={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#e5e7eb" }}
                >
                  {COLUMNS.map((c, i) => {
                    const v = row[c.key];
                    if (i === 0) {
                      return <TableCell key={c.key as string}>{v}</TableCell>;
                    }
                    const num = Number(v);
                    return (
                      <TableCell
                        key={c.key as string}
                        align="right"
                        sx={c.colorize ? { color: pnlColor(num) } : undefined}
                      >
                        {c.isCurrency ? formatDollarsCompact(num) : v}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
              {total && (
                <TableRow sx={{ backgroundColor: "#d1d5db" }}>
                  {COLUMNS.map((c, i) => {
                    const v = total[c.key];
                    if (i === 0) {
                      return (
                        <TableCell key={c.key as string} sx={{ fontWeight: 700 }}>
                          {v}
                        </TableCell>
                      );
                    }
                    const num = Number(v);
                    return (
                      <TableCell
                        key={c.key as string}
                        align="right"
                        sx={{
                          fontWeight: 700,
                          color: c.colorize ? pnlColor(num) : undefined,
                        }}
                      >
                        {c.isCurrency ? formatDollarsCompact(num) : v}
                      </TableCell>
                    );
                  })}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};

export default DeskExposurePnlBreakdown;

import React, { useEffect, useState } from "react";
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
  Grid,
} from "@mui/material";
import {
  fetchTopContributorsDetractors,
  IssuerPnlRow,
} from "./monthlyDecApi";
import { pnlColor } from "./monthlyDecFormat";

const HEADER_BG = "#5a7ab8";
const HEADER_FG = "#ffffff";

interface Props {
  fund?: string;
}

const formatDollarsExact = (val: number): string => {
  const sign = val < 0 ? "-" : "";
  const abs = Math.abs(Math.round(val));
  return `${sign}$${abs.toLocaleString()}`;
};

const renderTable = (title: string, rows: IssuerPnlRow[], headerBg: string) => (
  <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
    <Typography
      variant="subtitle1"
      align="center"
      sx={{ fontWeight: 700, color: "#1f3a8a", mb: 1.5 }}
    >
      {title}
    </Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ backgroundColor: headerBg }}>
            <TableCell colSpan={2} align="center" sx={{ color: HEADER_FG, fontWeight: 700 }}>
              {title.replace(" (YTD P&L)", " PnL")}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, backgroundColor: "#f3f4f6" }}>
              Issuer
            </TableCell>
            <TableCell
              align="right"
              sx={{ fontWeight: 700, backgroundColor: "#f3f4f6" }}
            >
              YTD P&L
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} align="center" sx={{ color: "text.secondary" }}>
                No data available
              </TableCell>
            </TableRow>
          ) : (
            rows.map((r, idx) => (
              <TableRow
                key={r.issuer}
                sx={{ backgroundColor: idx % 2 === 0 ? "#ffffff" : "#e5e7eb" }}
              >
                <TableCell>{r.issuer}</TableCell>
                <TableCell
                  align="right"
                  sx={{ color: pnlColor(r.ytd_pnl), fontWeight: 600 }}
                >
                  {formatDollarsExact(r.ytd_pnl)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

const TopContributorsDetractorsTable: React.FC<Props> = ({ fund }) => {
  const [contribs, setContribs] = useState<IssuerPnlRow[]>([]);
  const [detracts, setDetracts] = useState<IssuerPnlRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetchTopContributorsDetractors(fund, 5);
        if (!cancelled) {
          setContribs(resp.contributors || []);
          setDetracts(resp.detractors || []);
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress size={28} />
      </Box>
    );
  }
  if (error) {
    return <Typography color="error" align="center">{error}</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        {renderTable("Top 5 Contributors (YTD P&L)", contribs, HEADER_BG)}
      </Grid>
      <Grid item xs={12} md={6}>
        {renderTable("Top 5 Detractors (YTD P&L)", detracts, HEADER_BG)}
      </Grid>
    </Grid>
  );
};

export default TopContributorsDetractorsTable;

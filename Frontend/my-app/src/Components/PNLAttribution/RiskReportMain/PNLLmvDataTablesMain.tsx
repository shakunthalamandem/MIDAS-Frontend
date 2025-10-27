// src/components/PNLLmvDataTablesMain.tsx
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  CircularProgress,
  Chip,
} from "@mui/material";
import { RISK_REPORT_LABELS } from "./RiskReportLabels";

interface SectionData {
  [key: string]: number | string;
}

interface FundData {
  section1: SectionData;
  section2: SectionData;
  section3: SectionData;
  section4: SectionData;
}

interface PNLLmvDataTablesMainProps {
  fund: string;
}

const SECTION_META: Array<{ key: keyof FundData; title: string; subtitle: string }> = [
  { key: "section1", title: "Exposure & Headline Returns", subtitle: "LMV, Net P&L, Benchmarks & VaR" },
  { key: "section2", title: "MTD / YTD / ITD P&L", subtitle: "Period P&L and Return-on-LMV" },
  { key: "section3", title: "Betas & Index Vol", subtitle: "β vs SPXT/MSCI & Volatility" },
  { key: "section4", title: "Volatility & Averages", subtitle: "LMV averages and annualized stats" },
];

const brand = {
  bgHeader: "#D9E1F2",
  textPrimary: "#002060",
  border: "#E5EAF3",
};

const isPercentKey = (key: string) =>
  /Percent|Return|Volatility/i.test(key);

const formatValue = (key: string, value: number | string): string => {
  if (typeof value !== "number") return String(value ?? "");
  if (key === "LMV") {
    // LMV in Millions
    return `$ ${Math.round(value / 1_000_000).toLocaleString()} M`;
  }
  if (key === "Net_of_Hedge_PnL" || key === "MTD_Net_of_Hedge_PnL" || key === "YTD_Net_of_Hedge_PnL" || key === "ITD_Net_of_Hedge_PnL") {
    return `$ ${value.toLocaleString()}`;
  }
  const num = value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return isPercentKey(key) ? `${num}%` : num;
};

const PNLLmvDataTablesMain: React.FC<PNLLmvDataTablesMainProps> = ({ fund }) => {
  const [data, setData] = useState<FundData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track equal heights per row (row 0: sections 0–1, row 1: sections 2–3)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [rowHeights, setRowHeights] = useState<{ row0: number; row1: number }>({ row0: 0, row1: 0 });

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const fetchFundData = async () => {
      if (!fund) return;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${apiUrl}/api/risk_report_lmv_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) throw new Error("Failed to fetch LMV Fund Data");

        const result = (await res.json()) as FundData;
        setData(result);
      } catch (err: any) {
        console.error("Error fetching LMV fund data:", err);
        setError(err.message || "Failed to fetch LMV Fund Data");
      } finally {
        setLoading(false);
      }
    };

    fetchFundData();
  }, [fund, apiUrl, token]);

  // Equalize heights per row
  const measureHeights = () => {
    const h0 = Math.max(
      cardRefs.current[0]?.offsetHeight || 0,
      cardRefs.current[1]?.offsetHeight || 0
    );
    const h1 = Math.max(
      cardRefs.current[2]?.offsetHeight || 0,
      cardRefs.current[3]?.offsetHeight || 0
    );
    setRowHeights({ row0: h0, row1: h1 });
  };

  useLayoutEffect(() => {
    if (!data) return;
    measureHeights();
    const onResize = () => measureHeights();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  if (!data) {
    return (
      <Typography align="center" color="text.secondary">
        No data available
      </Typography>
    );
  }

  const sections = SECTION_META.map((meta) => ({
    ...meta,
    section: data[meta.key],
  }));

  const renderSection = (
    section: SectionData,
    index: number,
    rowIndex: 0 | 1
  ) => (
    <Paper
      key={index}
      ref={(el) => (cardRefs.current[index] = el)}
      elevation={4}
      sx={{
        p: 2,
        borderRadius: 2.5,
        height: { xs: "auto", md: rowIndex === 0 ? `${rowHeights.row0 || "auto"}px` : `${rowHeights.row1 || "auto"}px` },
        display: "flex",
        flexDirection: "column",
        border: `1px solid ${brand.border}`,
        background:
          "linear-gradient(180deg, rgba(217,225,242,0.20) 0%, rgba(255,255,255,0.65) 100%)",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          mb: 1.5,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: brand.textPrimary }}
        >
          {SECTION_META[index].title}
        </Typography>
        <Chip
          label={SECTION_META[index].subtitle}
          size="small"
          sx={{
            bgcolor: brand.bgHeader,
            color: brand.textPrimary,
            fontWeight: 600,
          }}
        />
      </Box>

      {/* Table */}
      <TableContainer
        component={Box}
        sx={{
          flex: 1,
          border: `1px solid ${brand.border}`,
          borderRadius: 1.5,
          overflow: "hidden",
          backgroundColor: "#fff",
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: brand.bgHeader }}>
              <TableCell sx={{ color: brand.textPrimary, fontWeight: 700 }}>
                Label
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: brand.textPrimary, fontWeight: 700 }}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(section).map(([key, value]) => (
              <TableRow
                key={key}
                hover
                sx={{
                  "&:nth-of-type(odd)": { bgcolor: "rgba(0,0,0,0.015)" },
                }}
              >
                <TableCell sx={{ color: brand.textPrimary }}>
                  {RISK_REPORT_LABELS[key] || key}
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 600 }}>
                  {formatValue(key, value)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Box>
      {/* Top banner / context */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: 1.5,
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, color: brand.textPrimary }}>
          Risk Report — {fund}
        </Typography>
        <Chip
          label="Auto-updated"
          size="small"
          variant="outlined"
          sx={{ borderColor: brand.textPrimary, color: brand.textPrimary }}
        />
      </Box>

      {/* 2 × 2 Grid (two sections per row) */}
      <Grid container spacing={3}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          {renderSection(sections[0].section, 0, 0)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(sections[1].section, 1, 0)}
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          {renderSection(sections[2].section, 2, 1)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(sections[3].section, 3, 1)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PNLLmvDataTablesMain;

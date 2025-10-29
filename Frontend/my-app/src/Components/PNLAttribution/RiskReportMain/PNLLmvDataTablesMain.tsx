// src/components/PNLLmvDataTablesMain.tsx
import React, { useEffect, useState } from "react";
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

const SECTION_META: Array<{ key: keyof FundData; title: string }> = [
  { key: "section1", title: "Exposure & Headline Returns" },
  { key: "section2", title: "MTD / YTD / ITD P&L" },
  { key: "section3", title: "Betas & Index Vol" },
  { key: "section4", title: "Volatility & Averages" },
];

const brand = {
  bgHeader: "#D9E1F2",
  textPrimary: "#002060",
  border: "#E5EAF3",
};

const isPercentKey = (key: string) => /Percent|Return|Volatility/i.test(key);
const LMV_KEYS = new Set([
  "LMV",
  "MTD_Daily_LMV_Avg",
  "YTD_LMV_Daily_Avg",
  "ITD_LMV_Daily_Avg",
]);

const formatValue = (key: string, value: number | string): string => {
  if (typeof value !== "number") return String(value ?? "");
  if (LMV_KEYS.has(key)) {
    const sign = value < 0 ? "-" : "";
    const magnitude = Math.abs(value);
    return `${sign}$${Math.round(magnitude / 1_000_000).toLocaleString()}M`;
  }
  if (
    key === "Net_of_Hedge_PnL" ||
    key === "MTD_Net_of_Hedge_PnL" ||
    key === "YTD_Net_of_Hedge_PnL" ||
    key === "ITD_Net_of_Hedge_PnL"
  ) {
    return `$ ${value.toLocaleString()}`;
  }
  const num = value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return isPercentKey(key) ? `${num}%` : num;
};

// Remove empty-ish values to keep cards short
const filteredEntries = (section: SectionData) =>
  Object.entries(section).filter(([_, v]) => {
    if (v === null || v === undefined) return false;
    if (typeof v === "string" && v.trim() === "") return false;
    if (typeof v === "number" && Number.isNaN(v)) return false;
    return true;
  });

const PNLLmvDataTablesMain: React.FC<PNLLmvDataTablesMainProps> = ({ fund }) => {
  const [data, setData] = useState<FundData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress size={28} />
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

  const renderSection = (section: SectionData, index: number) => {
    const rows = filteredEntries(section);
    return (
      <Paper
        key={index}
        elevation={3}
        sx={{
          p: 1.5, // tighter padding
          borderRadius: 2,
          border: `1px solid ${brand.border}`,
          background:
            "linear-gradient(180deg, rgba(217,225,242,0.18) 0%, rgba(255,255,255,0.8) 100%)",
        }}
      >
        {/* Header (compact) */}
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: brand.textPrimary, mb: 0.5 }}
        >
          {SECTION_META[index].title}
        </Typography>

        {/* Table (dense) */}
        <TableContainer
          component={Box}
          sx={{
            border: `1px solid ${brand.border}`,
            borderRadius: 1.5,
            overflow: "hidden",
            backgroundColor: "#fff",
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor: brand.bgHeader }}>
                <TableCell
                  sx={{
                    color: brand.textPrimary,
                    fontWeight: 700,
                    py: 0.5,
                  }}
                >
                  Label
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ color: brand.textPrimary, fontWeight: 700, py: 0.5 }}
                >
                  Value
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map(([key, value]) => (
                <TableRow
                  key={key}
                  hover
                  sx={{
                    "&:nth-of-type(odd)": { bgcolor: "rgba(0,0,0,0.02)" },
                  }}
                >
                  <TableCell sx={{ color: brand.textPrimary, py: 0.4 }}>
                    {RISK_REPORT_LABELS[key] || key}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, py: 0.4 }}>
                    {formatValue(key, value)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Box>
      <Grid container spacing={2.25}>
        {/* Row 1 */}
        <Grid item xs={12} md={6}>
          {renderSection(sections[0].section, 0)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(sections[1].section, 1)}
        </Grid>

        {/* Row 2 */}
        <Grid item xs={12} md={6}>
          {renderSection(sections[2].section, 2)}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderSection(sections[3].section, 3)}
        </Grid>
      </Grid>
    </Box>
  );
};

export default PNLLmvDataTablesMain;

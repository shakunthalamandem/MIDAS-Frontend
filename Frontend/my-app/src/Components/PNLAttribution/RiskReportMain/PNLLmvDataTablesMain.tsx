import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
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

const PNLLmvDataTablesMain: React.FC<PNLLmvDataTablesMainProps> = ({ fund }) => {
  const [data, setData] = useState<FundData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [maxHeight, setMaxHeight] = useState<number>(0);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

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

        const result = await res.json();
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

  // Update max height after data is rendered
  useEffect(() => {
    if (cardRefs.current.length === 0) return;
    const heights = cardRefs.current.map((ref) => ref?.offsetHeight || 0);
    const max = Math.max(...heights);
    setMaxHeight(max);
  }, [data]);

  if (loading) {
    return (
      <Grid container justifyContent="center" alignItems="center" style={{ minHeight: "200px" }}>
        <CircularProgress />
      </Grid>
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
      <Typography align="center" color="textSecondary">
        No data available
      </Typography>
    );
  }

  const renderSection = (section: SectionData, index: number) => (
    <Paper
      elevation={3}
      ref={(el) => (cardRefs.current[index] = el)}
      style={{
        padding: "1rem",
        borderRadius: "12px",
        marginBottom: "1rem",
        height: maxHeight ? `${maxHeight}px` : "auto", // set equal height
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow style={{ backgroundColor: "#D9E1F2" }}>
              <TableCell style={{ color: "#002060", fontWeight: "bold" }}>Label</TableCell>
              <TableCell align="right" style={{ color: "#002060", fontWeight: "bold" }}>
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(section).map(([key, value]) => (
              <TableRow key={key}>
                <TableCell style={{ color: "#002060" }}>{RISK_REPORT_LABELS[key] || key}</TableCell>
                <TableCell align="right">{value}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={3}>{renderSection(data.section1, 0)}</Grid>
      <Grid item xs={12} md={3}>{renderSection(data.section2, 1)}</Grid>
      <Grid item xs={12} md={3}>{renderSection(data.section4, 2)}</Grid>
      <Grid item xs={12} md={3}>{renderSection(data.section3, 3)}</Grid>
    </Grid>
  );
};

export default PNLLmvDataTablesMain;

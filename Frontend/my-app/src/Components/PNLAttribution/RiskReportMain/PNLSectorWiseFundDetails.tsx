import React, { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Box,
} from "@mui/material";

interface PNLSectorWiseFundDetailsProps {
  fund: string;
}

interface SectorExposure {
  sector: string;
  net_of_hedge_pnl: number;
  net_of_hedge_pnl_percent: number;
  long_exposure: number;
  beta_adj_long_Exp_lmv: number;
}

const getOrdinalSuffix = (day: number) => {
  if (day >= 11 && day <= 13) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
};

const formatDateWithOrdinal = (date: Date) => {
  const day = date.getDate();
  const suffix = getOrdinalSuffix(day);
  const month = date.toLocaleString(undefined, { month: "short" });
  const year = date.getFullYear();
  return `${day}${suffix} ${month} ${year}`;
};

const PNLSectorWiseFundDetails: React.FC<PNLSectorWiseFundDetailsProps> = ({
  fund,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SectorExposure[]>([]);
  const [reportDate, setReportDate] = useState<string>("");

  useEffect(() => {
    const fetchSectorExposure = async () => {
      setLoading(true);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        const res = await fetch(`${apiUrl}/api/risk_report_sector_exposure/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch sector exposure data");
        }

        const json = await res.json();
        setData(json.sector_exposure || []);
        setReportDate(json.report_date || "");
      } catch (error) {
        console.error("Error fetching sector exposure:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSectorExposure();
  }, [fund]);

  const formattedReportDate = useMemo(() => {
    if (!reportDate) return "N/A";
    const parsedDate = new Date(reportDate);
    if (Number.isNaN(parsedDate.getTime())) return reportDate;
    return formatDateWithOrdinal(parsedDate);
  }, [reportDate]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ✅ Format Net Of Hedge P&L — round to 0, handle negatives like -$25
  const formatDollar = (value: number): string => {
    const rounded = Math.round(value);
    const cleaned = rounded === 0 ? 0 : rounded;
    if (cleaned < 0) {
      return `-$${Math.abs(cleaned).toLocaleString()}`;
    }
    return `$${cleaned.toLocaleString()}`;
  };

  // ✅ Format percentage values — keep 2 decimals
  const formatPercent = (value: number): string => {
    const rounded = value.toFixed(2);
    const cleaned = rounded === "-0.00" ? "0.00" : rounded;
    return `${cleaned}%`;
  };

  return (
    <Paper
      elevation={3}
      sx={{ p: 2, borderRadius: 2, backgroundColor: "#f9f9f9", mt: 2 }}
    >
      <Typography
        variant="body1"
        gutterBottom
        color="#002060"
        sx={{ fontWeight: "bold" }}
        align="center"
      >
        {fund}: Data As of: {formattedReportDate}
      </Typography>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#e1eaff" }}>
              <TableCell>
                <strong>Sector</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Net Of Hedge P&L</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Net Of Hedge P&L (%)</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Long Exposure / LMV (%)</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Beta Adj. Long Exp. / LMV (%)</strong>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length > 0 ? (
              data.map((row, idx) => {
                const isLastRow = idx === data.length - 1;
                return (
                  <TableRow
                    key={idx}
                    sx={{
                      backgroundColor: isLastRow
                        ? "#d1e3ff" // Highlight color for Grand Total row
                        : idx % 2 === 0
                        ? "#edf7f8ff" // light gray-blue for alternate rows
                        : "#ffffff",
                      fontWeight: isLastRow ? "bold" : "normal",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: isLastRow ? "bold" : "normal",
                        color: isLastRow ? "#002060" : "inherit",
                      }}
                    >
                      {row.sector}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: isLastRow ? "bold" : "normal" }}
                    >
                      {formatDollar(row.net_of_hedge_pnl)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: isLastRow ? "bold" : "normal" }}
                    >
                      {formatPercent(row.net_of_hedge_pnl_percent)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: isLastRow ? "bold" : "normal" }}
                    >
                      {formatPercent(row.long_exposure)}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ fontWeight: isLastRow ? "bold" : "normal" }}
                    >
                      {formatPercent(row.beta_adj_long_Exp_lmv)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No data available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PNLSectorWiseFundDetails;

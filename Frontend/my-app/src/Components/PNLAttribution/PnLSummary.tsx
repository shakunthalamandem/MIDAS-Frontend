import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Container,
  Grid,
} from "@mui/material";
import { green, red } from "@mui/material/colors";

interface PnLData {
  [assetType: string]: {
    [range: string]: number | null;
  };
}

interface PnLApiResponse {
  max_trade_date?: string;
  pnl: PnLData;
}

const timeRanges = ["DTD", "MTD", "QTD", "YTD"];
const assetOrder = [
  "Equities",
  "Convertible Bond",
  "Corporate Bond",
  "Cash",
  "Warrants",
  "Futures",
];

const formatValue = (value?: number | null): string => {
  if (value === null || value === undefined) return "-";
  const absValue = Math.abs(value);
  const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
  const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;

  const formatted = (absValue / divisor).toFixed(2);
  return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
};

const getCellStyle = (value: number | null | undefined) => {
  if (value === undefined || value === null) return {};
  if (value > 0) return { color: green[600], fontWeight: "bold" };
  if (value < 0) return { color: red[500], fontWeight: "bold" };
  if (value === 0) return { color: "#000", fontWeight: "bold" };
  return { color: "#666" };
};

const PnLSummary: React.FC = () => {
  const [data, setData] = useState<PnLApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchPnLData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${apiUrl}/api/pnls_summary_values/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result: PnLApiResponse = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPnLData();
    } else {
      setError("No access token found.");
      setLoading(false);
    }
  }, [token, apiUrl]);

  const calculateTotals = (): { [range: string]: number } => {
    const totals: { [range: string]: number } = {
      DTD: 0,
      MTD: 0,
      QTD: 0,
      YTD: 0,
    };

    assetOrder.forEach((assetType) => {
      const assetData = data?.pnl?.[assetType];
      timeRanges.forEach((range) => {
        const value = assetData?.[range];
        if (typeof value === "number") {
          totals[range] += value;
        }
      });
    });

    return totals;
  };

  const formatAsOfDate = (isoDate?: string) => {
    if (!isoDate) return null;
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return null;

    const day = date.getUTCDate();
    const monthIndex = date.getUTCMonth();
    const year = date.getUTCFullYear();

    const suffix =
      day >= 11 && day <= 13
        ? "th"
        : day % 10 === 1
          ? "st"
          : day % 10 === 2
            ? "nd"
            : day % 10 === 3
              ? "rd"
              : "th";

    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return `${day}${suffix} ${months[monthIndex]} ${year}`;
  };

  const totalsFromApi = data?.pnl?.["Total"];
  const totals = totalsFromApi ?? calculateTotals();
  const formattedAsOfDate = formatAsOfDate(data?.max_trade_date);

  return (
    <Container>
      <Box sx={{ position: "relative", mt: 1, mb: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: "bold", color: "#002060", textAlign: "center" }}
        >
          P&L Summary by Asset Class
        </Typography>

        {formattedAsOfDate && (
          <Typography
            variant="body1"
            sx={{
              fontWeight: "bold",
              color: "#740091ff",
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            Data As of: {formattedAsOfDate}
          </Typography>
        )}
      </Box>

      <Typography variant="body1" align="left" sx={{ color: "#666", mb: 2 }}>
        Gain a quick snapshot of Monashee’s profit and loss across major asset
        types including Cash, Equities, Bonds, and Derivatives, measured over
        multiple timeframes: 1 Day (DTD), Month-to-Date (MTD), Quarter-to-Date
        (QTD), and Year-to-Date (YTD). This summary highlights where gains or
        losses are concentrated at a portfolio-wide level.
      </Typography>

      {loading && (
        <Box display="flex" justifyContent="center" my={3}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {data && (
        <TableContainer
          component={Paper}
          sx={{
            mt: 1,
            mb: 4,
            borderRadius: 2,
            boxShadow: 3,
            maxHeight: 500,
            overflow: "auto",
            border: "1px solid #000",
          }}
        >
          <Table
            stickyHeader
            size="small"
            sx={{
              borderCollapse: "collapse",
              "& th, & td": {
                border: "1px solid #000",
                padding: "6px 10px",
                maxWidth: 80,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                textAlign: "center",
              },
              "& thead th": {
                backgroundColor: "#002060",
                color: "#fff",
                fontWeight: "bold",
                textAlign: "center",
              },
              "& tbody tr.total-row": {
                backgroundColor: "rgb(145, 206, 137)",
                fontWeight: "bold",
                color: "#000",
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell>Asset Type</TableCell>
                {timeRanges.map((range) => (
                  <TableCell key={range}>{range}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assetOrder.map((assetType) => {
                const values = data.pnl?.[assetType];
                return (
                  <TableRow key={assetType}>
                    <TableCell sx={{ fontWeight: 500 }}>{assetType}</TableCell>
                    {timeRanges.map((range) => {
                      const val = values?.[range];
                      return (
                        <TableCell key={range} sx={getCellStyle(val)}>
                          {val !== null && val !== undefined
                            ? formatValue(val)
                            : "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}

              {/* Total Row */}
              <TableRow className="total-row">
                <TableCell sx={{ fontWeight: "bold" }}>Total</TableCell>
                {timeRanges.map((range) => {
                  const totalValue = totals?.[range] ?? 0;
                  return (
                    <TableCell key={range} sx={{ fontWeight: "bold" }}>
                      {formatValue(totalValue)}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default PnLSummary;

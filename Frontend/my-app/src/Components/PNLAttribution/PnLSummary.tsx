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
} from "@mui/material";
import { green, red } from "@mui/material/colors";

interface PnLData {
  [assetType: string]: {
    [range: string]: number | null;
  };
}

const timeRanges = ["DTD", "MTD", "QTD", "YTD"];
const assetOrder = [
  "Equities",
  "Convertible Bond",
  "Corporate Bond",
  "Cash",
  "Warrants",
  "Futures",
  // "Total", // Uncomment if your data contains total row
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
  if (value > 0) return { color: green[600], fontWeight: 500 };
  if (value < 0) return { color: red[500], fontWeight: 500 };
  return { color: "#666" };
};

const PnLSummary: React.FC = () => {
  const [data, setData] = useState<PnLData | null>(null);
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

        const result = await response.json();
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

  return (
    <Container>
      <Typography
        variant="h6"
        sx={{ mt: 4, mb: 1, fontWeight: "bold", color: "#002060", textAlign: "center" }}
      >
        P&L Summary by Asset Class
      </Typography>

      <Typography variant="body1" align="left" sx={{ color: "#666", mb: 2 }}>
        Gain a quick snapshot of Monashee’s profit and loss across major asset
        types including Cash, Equities, Bonds, and Derivatives, measured over
        multiple timeframes: 1 Day (1D), Month-to-Date (MTD), Quarter-to-Date
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
            mt: 4,
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
                textAlign: "center", // <-- changed to center for all cells including first column
              },
              // Removed textAlign left on first column so all are centered
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
                const values = data[assetType];
                return (
                  <TableRow
                    key={assetType}
                    className={assetType === "Total" ? "total-row" : undefined}
                  >
                    <TableCell
                      sx={{ fontWeight: assetType === "Total" ? "bold" : 500 }}
                    >
                      {assetType}
                    </TableCell>
                    {timeRanges.map((range) => {
                      const val = values?.[range];
                      return (
                        <TableCell
                          key={range}
                          sx={{
                            ...getCellStyle(val),
                            fontWeight: assetType === "Total" ? "bold" : undefined,
                          }}
                        >
                          {val !== null && val !== undefined ? formatValue(val) : "-"}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default PnLSummary;

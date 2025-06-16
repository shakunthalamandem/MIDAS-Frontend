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
    [range: string]: number;
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
];

const formatValue = (value?: number): string => {
  if (value === undefined || value === null || isNaN(value)) return "-$";
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (absValue >= 1_000_000_000)
    return `${sign}${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}${(absValue / 1_000).toFixed(1)}K`;
  return `${sign}${absValue.toFixed(2)}`;
};

const getCellStyle = (value: number | undefined) => {
  if (value === undefined) return {};
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

    fetchPnLData();
  }, [token]);

  return (
    <Container>
      <Box p={2}>
        <Typography
          variant="h3"
          align="left"
          sx={{ color: "#005166", fontSize: "1.75rem", mb: 3 }}
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

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {data && (
          <TableContainer
            component={Paper}
            sx={{
              mt: 2,
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
                  textAlign: "center", // Added textAlign center for all cells
                },
                "& th:nth-of-type(1), & td:nth-of-type(1)": {
                  maxWidth: 150,
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
                "& tbody tr.total-row td": {
                  fontWeight: "bold",
                  color: "#000",
                },
                "& tbody td": {
                  textAlign: "center", // Ensured text is centered for all rows
                },
                "& tbody td:first-of-type": {
                  textAlign: "center", // Centered the first column (Asset Type)
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
                            {val !== undefined ? `$ ${formatValue(val)}` : "-$"}
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
      </Box>
    </Container>
  );
};

export default PnLSummary;

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

const timeRanges = ["1D", "MTD", "QTD", "YTD"];

const formatValue = (value: number) => {
  const inThousands = value / 1000;
  return `${inThousands.toLocaleString(undefined, {
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  })}K`;
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
      <Typography variant="h6" gutterBottom>
        📊 PnL Summary by Asset Type
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
                textAlign: "right",
              },
              "& tbody td:first-of-type": {
                textAlign: "left",
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
              {[
                ...Object.entries(data).filter(([k]) => k !== "Total"),
                ...(data["Total"]
                  ? [
                      ["Total", data["Total"]] as [
                        string,
                        { [key: string]: number },
                      ],
                    ]
                  : []),
              ].map(([assetType, values]) => (
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
                    const val = values[range];
                    return (
                      <TableCell
                        key={range}
                        sx={{
                          ...getCellStyle(val),
                          fontWeight: assetType === "Total" ? "bold" : undefined,
                        }}
                      >
                        $ {val !== undefined ? formatValue(val) : "-"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
    </Container>
  );
};

export default PnLSummary;

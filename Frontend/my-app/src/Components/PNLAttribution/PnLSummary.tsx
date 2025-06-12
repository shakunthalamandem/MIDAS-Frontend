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
} from "@mui/material";
import { green, red } from "@mui/material/colors";

interface PnLData {
  [assetType: string]: {
    [range: string]: number;
  };
}

const timeRanges = ["1D", "1W", "1M", "3M", "MTD", "QTD", "YTD"];

const formatValue = (value: number) => {
  return value?.toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

const getCellStyle = (value: number | undefined) => {
  if (value === undefined) return {};
  if (value > 0)
    return { color: green[600], fontWeight: 500 };
  if (value < 0)
    return { color: red[500], fontWeight: 500 };
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
            border: "1px solid #eee",
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                >
                  Asset Type
                </TableCell>
                {timeRanges.map((range) => (
                  <TableCell
                    key={range}
                    align="right"
                    sx={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                  >
                    {range}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data).map(([assetType, values]) => (
                <TableRow key={assetType}>
                  <TableCell sx={{ fontWeight: 500 }}>{assetType}</TableCell>
                  {timeRanges.map((range) => {
                    const val = values[range];
                    return (
                      <TableCell
                        key={range}
                        align="right"
                        sx={getCellStyle(val)}
                      >
                        {val !== undefined ? formatValue(val) : "-"}
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
  );
};

export default PnLSummary;

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
  Grid,
} from "@mui/material";

interface PnLData {
  [assetType: string]: {
    [range: string]: number;
  };
}

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

  const timeRanges = ["1D", "1W", "1M", "3M", "MTD", "QTD", "YTD"];

  return (
    <Box p={2}>
      <Typography variant="h6" gutterBottom>
        📊 PnL Summary by Asset Type
      </Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}

      {data && (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table size="small">
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell><strong>Asset Type</strong></TableCell>
                {timeRanges.map((range) => (
                  <TableCell key={range} align="right"><strong>{range}</strong></TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(data).map(([assetType, values]) => (
                <TableRow key={assetType}>
                  <TableCell>{assetType}</TableCell>
                  {timeRanges.map((range) => (
                    <TableCell key={range} align="right">
                      {values[range] !== undefined ? values[range].toLocaleString(undefined, { maximumFractionDigits: 2 }) : "-"}
                    </TableCell>
                  ))}
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

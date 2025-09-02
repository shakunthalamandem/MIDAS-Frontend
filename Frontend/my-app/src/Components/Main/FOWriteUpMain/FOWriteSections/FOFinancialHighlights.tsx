import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Container,
  Grid,
} from "@mui/material";

interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface FinancialHighlights {
  total_revenue_current_year: number | null;
  total_revenue_previous_year: number | null;
  total_revenue_yoy_change: number | null;
  gross_profit_current_year: number | null;
  gross_profit_previous_year: number | null;
  gross_profit_yoy_change: number | null;
  operating_income_current_year: number | null;
  operating_income_previous_year: number | null;
  operating_income_yoy_change: number | null;
  net_income_current_year: number | null;
  net_income_previous_year: number | null;
  net_income_yoy_change: number | null;
}

interface ApiResponse {
  financial_highlights: FinancialHighlights;
}

const FOFinancialHighlights: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [selectedData, setSelectedData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) {
          throw new Error("API URL is not defined in environment variables");
        }

        const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, deal_id }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const result: ApiResponse = await response.json();
        setSelectedData(result);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);

  const renderTable = () => {
    if (!selectedData?.financial_highlights) return null;

    const highlights = selectedData.financial_highlights;

    const rows = [
      {
        label: "Total Revenue",
        current: highlights.total_revenue_current_year,
        previous: highlights.total_revenue_previous_year,
        yoy: highlights.total_revenue_yoy_change,
      },
      {
        label: "Gross Profit",
        current: highlights.gross_profit_current_year,
        previous: highlights.gross_profit_previous_year,
        yoy: highlights.gross_profit_yoy_change,
      },
      {
        label: "Operating Income",
        current: highlights.operating_income_current_year,
        previous: highlights.operating_income_previous_year,
        yoy: highlights.operating_income_yoy_change,
      },
      {
        label: "Net Income",
        current: highlights.net_income_current_year,
        previous: highlights.net_income_previous_year,
        yoy: highlights.net_income_yoy_change,
      },
    ];

    const formatValue = (value: number | null): string =>
      value !== null
        ? value.toLocaleString(undefined, { maximumFractionDigits: 2 })
        : "N/A";

    return (
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Metric</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Current Year</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Previous Year</strong>
              </TableCell>
              <TableCell align="right">
                <strong>YoY Change (%)</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.label}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="right">
                  {formatValue(row.current)}
                </TableCell>
                <TableCell align="right">
                  {formatValue(row.previous)}
                </TableCell>
                <TableCell align="right">
                  {row.yoy !== null ? `${row.yoy.toFixed(2)}%` : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // ✅ Proper return is now placed inside the component
  return (
    <Container maxWidth="xl" >
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Financial Highlights
          </Typography>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <CircularProgress />
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && renderTable()}
        </Grid>
      </Grid>
    </Container>
  );
};

export default FOFinancialHighlights;

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';

interface ChildProps {
  ticker: string;
  deal_id: string;
}

interface ApiResponse {
  ticker: string;
  deal_id: string;
  competitor: string;
  price_usd: string;
  market_cap: number | null;
  ev_usd_million: number | null;
  present_year_ev_sales: number | null;
  one_year_later_ev_sales: number | null;
  present_year_price_earning: number | null;
  one_year_later_price_earning: number | null;
  present_year_ev_ebitda: number | null;
  one_year_later_ev_ebitda: number | null;
  sales_growth: number | null;
  eps_growth: number | null;
  created_at?: string;   // Optional, if used
  updated_at?: string;   // Optional, if used
  ai_generated: boolean;
}


interface Column {
  key: keyof ApiResponse;
  label: string;
}

const FOComparisionTableMain: React.FC<ChildProps> = ({ ticker, deal_id }) => {
  const [selectedData, setSelectedData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [noData, setNoData] = useState<boolean>(false); // new state

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      setNoData(false);

      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined");

        const response = await fetch(`${apiUrl}/api/fo_companymetric_data/`, {
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

        const result = await response.json();

        if (result.error || Object.keys(result).length === 0) {
          setNoData(true);  // handle "no data" response
          setSelectedData(null);
        } else {
          setSelectedData(result);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong");
        setSelectedData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ticker, deal_id]);

  const columns: Column[] = [
    { key: "competitor", label: "Ticker" },
    { key: "price_usd", label: "Price (USD)"},
    { key: 'market_cap', label: "Market Cap (USDm)" },
    { key: 'ev_usd_million', label: 'EV (USDm)' },
    { key: 'present_year_ev_sales', label: '2025 EV/Sales' },
    { key: 'one_year_later_ev_sales', label: '2026 EV/Sales' },
    { key: 'present_year_price_earning', label: '2025 P/E' },
    { key: 'one_year_later_price_earning', label: '2026 P/E' },
    { key: 'present_year_ev_ebitda', label: '2025 EV/EBITDA' },
    { key: 'one_year_later_ev_ebitda', label: '2026 EV/EBITDA' },
    { key: 'sales_growth', label: 'Sales Growth (25–26)' },
    { key: 'eps_growth', label: 'EPS Growth (25–26)' },
  ];

  return (
    <Box p={3}>
      <Typography variant="h6" align='center' gutterBottom sx={{ fontWeight: 'bold',color: '#026269', mb: 3 }}>
        Comparative Trading Multiples & Performance Metrics
      </Typography>

      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {noData && !loading && !error && (
        <p style={{ textAlign: "center", color: "#555" }}>No data found.</p>
      )}

      {!loading && !error && selectedData && (
        <TableContainer
          component={Paper}
          elevation={4}
          sx={{
            mb: 4,
            width: "100%",
            borderRadius: 2,
            overflowX: "auto",
          }}
        >
          <Table size="small" sx={{ width: "100%" }}>
            <TableHead sx={{ backgroundColor: "#002060" }}>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      fontWeight: "bold",
                      color: "#FFFFFF",
                      textAlign: "center",
                      borderBottom: "none",
                      whiteSpace: "nowrap",
                      fontSize: "0.75rem",
                    }}
                  >
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      textAlign: "center",
                      fontSize: "0.75rem",
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                    }}
                  >
                    {col.key === "ai_generated"
                      ? selectedData[col.key]
                        ? "Yes"
                        : "No"
                      : selectedData[col.key] ?? "N/A"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};


export default FOComparisionTableMain;

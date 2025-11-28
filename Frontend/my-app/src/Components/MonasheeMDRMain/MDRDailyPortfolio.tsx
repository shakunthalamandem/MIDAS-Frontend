// MDRDailyPortfolio.tsx
import React, { useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import MDRDailyPortfolioFilters, {
  FilterState,
} from "./MDRDailyPortfolioFilters";
import MDRDailyPortfolioTable, {
  MDRDailyPortfolioRow,
} from "./MDRDailyPortfolioTable";

const PRIMARY_COLOR = "#002060";

const initialFilters: FilterState = {
  tradeDate: "",
  fund: "",
  asset: "",
  region: "",
};

const MDRDailyPortfolio: React.FC = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [rows, setRows] = useState<MDRDailyPortfolioRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleFiltersChange = (updated: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleApply = async () => {
    setHasApplied(true);
    setError(null);

    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      trade_date: filters.tradeDate,
      fund: filters.fund || null,
      asset: filters.asset || null,
      region: filters.region || null,
    };

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/mdr_daily_portfolio/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch portfolio data");
      }

      const data = await response.json();
      const portfolioRows: MDRDailyPortfolioRow[] =
        Array.isArray(data) ? data : data.results || [];

      setRows(portfolioRows);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setRows([]);
    setError(null);
    setHasApplied(false);
  };

  return (
    <>
    <Container maxWidth='xl'>

    <Box sx={{ p: 3, backgroundColor: "#f5f6fa" }}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 600, color: PRIMARY_COLOR }}
        >
          Daily Portfolio Report
        </Typography>

        <MDRDailyPortfolioFilters
          filters={filters}
          onChange={handleFiltersChange}
          onApply={handleApply}
          onReset={handleReset}
          loading={loading}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <MDRDailyPortfolioTable
          rows={rows}
          hasApplied={hasApplied}
          loading={loading}
        />
      </Paper>
    </Box>
    </Container>
        </>
  );
};

export default MDRDailyPortfolio;

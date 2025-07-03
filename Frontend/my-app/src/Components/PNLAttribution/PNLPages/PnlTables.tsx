import React, { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Container,
  Grid,
} from "@mui/material";
import DataTable from "../PNLPages/DataTable";

interface StrategyData {
  custom_group1?: string;
  custom_group2?: string;
  broad_region?: string;
  total: number;
}

interface TableBlock {
  top_5_strategies: StrategyData[];
  bottom_5_strategies: StrategyData[];
  high: number;
  low: number;
  total_sum: number;
}

interface PnlTablesData {
  [key: string]: TableBlock;
}

const PnlTables: React.FC<{ selectedFilters: any }> = ({ selectedFilters }) => {
  const [data, setData] = useState<PnlTablesData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem("access_token");

        if (!apiUrl) throw new Error("API URL is not defined in environment variables");

        const response = await fetch(`${apiUrl}/api/pnl_tables/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ filters: selectedFilters }),

        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const json = await response.json();
        setData(json);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">Error: {error}</Typography>;
  if (!data) return null;

  return (
    <Container maxWidth="xl">
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} >
          <DataTable
            title="P&L by Strategy"
            {...data["p&L_by_strategy"]}
            groupKey="custom_group1"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DataTable
            title="Exposure by Strategy"
            {...data.exposure_by_strategy}
            groupKey="custom_group1"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DataTable
            title="P&L by Sector"
            {...data["P&L_by_sector"]}
            groupKey="custom_group2"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DataTable
            title="Exposure by Sector"
            {...data.exposure_by_sector}
            groupKey="custom_group2"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DataTable
            title="P&L by International"
            {...data["P&L_by_international"]}
            groupKey="broad_region"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <DataTable
            title="Exposure by International"
            {...data.exposure_by_international}
            groupKey="broad_region"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default PnlTables;

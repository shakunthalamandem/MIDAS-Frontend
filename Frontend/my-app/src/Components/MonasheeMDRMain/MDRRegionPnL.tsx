import React, { useEffect, useState } from "react";
import { Box, Container, Paper, Typography } from "@mui/material";
import MDRRegionPnLFilters, {
  RegionFilterOptions,
  RegionFilterState,
} from "./MDRRegionPnLFilters";
import MDRRegionPnLChart, { RegionPnLPoint } from "./MDRRegionPnLChart";

const PRIMARY_COLOR = "#002060";

const initialFilters: RegionFilterState = {
  fund: [],
  asset: [],
};

const MDRRegionPnL: React.FC = () => {
  const [filters, setFilters] = useState<RegionFilterState>(initialFilters);
  const [options, setOptions] = useState<RegionFilterOptions>({
    fund: [],
    assetTypes: [],
  });
  const [data, setData] = useState<RegionPnLPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleFiltersChange = (updated: Partial<RegionFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const toNumber = (value: any, fallback = 0) => {
    if (value === null || value === undefined || value === "") return fallback;
    const cleaned =
      typeof value === "string" ? value.replace(/[% ,]/g, "") : value;
    const num = Number(cleaned);
    return Number.isNaN(num) ? fallback : num;
  };

  const normalizePoint = (item: any): RegionPnLPoint => ({
    date: item.date ?? "",
    us: toNumber(item.us),
    nonUsAmerica: toNumber(
      item.nonUsAmerica ?? item.non_us_america ?? item.amerExUs
    ),
    apac: toNumber(item.apac),
    emea: toNumber(item.emea),
    all: toNumber(item.all),
  });

  useEffect(() => {
    const fetchOptions = async () => {
      if (!apiUrl) {
        setError("API URL is not defined in environment variables");
        return;
      }

      try {
        const response = await fetch(`${apiUrl}/api/daily_trades_filters/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || "Failed to fetch filter options");
        }

        const json = await response.json();
        setOptions({
          fund: json.fund || [],
          assetTypes: json.asset_type || [],
        });
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load filter options");
      }
    };

    fetchOptions();
  }, [apiUrl, token]);

  const handleApply = async () => {
    setHasApplied(true);
    setError(null);

    if (!apiUrl) {
      setError("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      fund: filters.fund,
      asset: filters.asset,
    };

    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/mdr_region_cumulative_pnl/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Failed to fetch regional P&L data");
      }

      const json = await response.json();
      const rawPoints: any[] = Array.isArray(json)
        ? json
        : json.results || json.data || [];

      setData(rawPoints.map(normalizePoint));
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setData([]);
    setError(null);
    setHasApplied(false);
  };

  return (
    <Container maxWidth="xl">
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
            align="center"
            sx={{ mb: 2, fontWeight: 600, color: PRIMARY_COLOR }}
          >
            Regional Cumulative P&L
          </Typography>

          <MDRRegionPnLFilters
            filters={filters}
            options={options}
            loading={loading}
            onChange={handleFiltersChange}
            onApply={handleApply}
            onReset={handleReset}
          />

          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {!loading && hasApplied && data.length === 0 && !error ? (
            <Typography
              variant="body2"
              sx={{ textAlign: "center", color: "#6b7280", mt: 2 }}
            >
              No data available for the selected filters.
            </Typography>
          ) : (
            <MDRRegionPnLChart data={data} />
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default MDRRegionPnL;

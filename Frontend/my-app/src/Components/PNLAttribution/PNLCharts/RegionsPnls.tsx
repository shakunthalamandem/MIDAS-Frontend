import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Container,
} from "@mui/material";

type PnlKey = "DTD" | "1W" | "1M" | "3M" | "MTD" | "QTD" | "YTD";
type RegionPnls = Partial<Record<PnlKey, number>>;

const displayKeys: { key: PnlKey; label: string }[] = [
  { key: "1W", label: "WTD" },
  { key: "MTD", label: "MTD" },
  { key: "QTD", label: "QTD" },
  { key: "YTD", label: "YTD" },
];

// Fixed order of regions
const regionOrder = [
  "US Equities",
  "EMEA Equities",
  "APAC Equities",
  "Non-US America Equities",
  "Convertible Bond",
  "Corporate Bond",
  "Cash",
  "Warrants",
  "Futures",
];

const RegionsPnls = () => {
  const [data, setData] = useState<Record<string, RegionPnls>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");
  const apiUrl = process.env.REACT_APP_API_URL;

  const formatValue = (value?: number | null): string => {
    if (value === null || value === undefined) return "-";
    const absValue = Math.abs(value);
    const suffix = absValue >= 1_000_000 ? "M" : absValue >= 1_000 ? "K" : "";
    const divisor = suffix === "M" ? 1_000_000 : suffix === "K" ? 1_000 : 1;

    const formatted = (absValue / divisor).toFixed(2);
    return `${value < 0 ? "-" : ""}$${formatted}${suffix}`;
  };

  useEffect(() => {
    const fetchPnLData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${apiUrl}/api/pnl_regions/`, {
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

  // Filter and order data based on regionOrder, exclude "Total"
  const filteredOrderedRegions = regionOrder.filter((region) =>
    data.hasOwnProperty(region)
  );

  return (
<Container
  maxWidth="xl"
  sx={{ mt: 4, mb: 4, backgroundColor: "#d4e4f3", borderRadius: 2 ,pb:2}}
>
  <Box sx={{ width: "100%" }}>
    <Typography
      variant="h5"
      align="center"
      gutterBottom
      sx={{ color: "#016676", fontWeight: "bold", padding: 2,mb: 2 }}
    >
      Regions P&L Summary
    </Typography>

    {loading ? (
      <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
        <CircularProgress />
      </Box>
    ) : error ? (
      <Typography color="error">{error}</Typography>
    ) : (
      <Box sx={{ px: 1 }}>  {/* Adjust px (padding-x) based on spacing */}

      <Grid container spacing={3}>
        {filteredOrderedRegions.map((region, index) => {
          const pnlValues = data[region];
          return (
            <Grid
              item
              xs={12}
              sm={6}
              key={region}
              sx={{
                animation: `fadeIn 0.5s ease ${index * 0.1}s both`,
                '@keyframes fadeIn': {
                  from: { opacity: 0, transform: 'translateY(10px)' },
                  to: { opacity: 1, transform: 'translateY(0)' },
                },
              }}
            >
              <Box
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: 3,
                  boxShadow: 3,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.3s, box-shadow 0.3s",
                  '&:hover': {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                    backgroundColor: "#f0faff",
                  },
                }}
              >
                <Typography
                  variant="h6"
                  textAlign="center"
                  color="#002060"
                  sx={{ mb: 2, mt:2, fontWeight: "bold" }}
                >
                  {region} P&L
                </Typography>

                <Box sx={{ width: "100%", overflow: "hidden" }}> {/* fixes spacing overflow */}
  <Grid container spacing={1}>
    {displayKeys.map(({ key, label }) => (
      <Grid
        item
        xs={6}
        key={key}
        sx={{
          border: "1px solid #ddd",
          borderRadius: 1,
          textAlign: "center",
          backgroundColor: "#f9f9f9",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: 1,
          minHeight: "80px",
          transition: "background-color 0.2s",
          '&:hover': {
            backgroundColor: "#e0f7fa",
          },
        }}
      >
        <Typography
          variant="subtitle2"
          color="#070030"
          gutterBottom
          sx={{ fontSize: "0.75rem", textAlign: "center" }}
        >
          {label}
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: "bold",
            fontSize: "0.9rem",
            color: "#016676",
          }}
        >
          {formatValue(pnlValues[key as PnlKey])}
        </Typography>
      </Grid>
    ))}
  </Grid>
</Box>

              </Box>
            </Grid>
          );
        })}
      </Grid>
      </Box>
    )}
  </Box>
</Container>
  );
};

export default RegionsPnls;

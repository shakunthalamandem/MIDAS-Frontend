import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  Container,
} from "@mui/material";

type PnlKey = "DTD" | "WTD" | "1M" | "3M" | "MTD" | "QTD" | "YTD";
type RegionPnls = Partial<Record<PnlKey, number>>;

const displayKeys: { key: PnlKey; label: string }[] = [
  { key: "WTD", label: "WTD" },
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

// Mapping of region name to index key(s)
const regionToIndexMap: Record<string, string | string[]> = {
  "Corporate Bond": "hyg_equity_index",
  "Convertible Bond": "cwb_equity_index",
  "US Equities": "spy_equity_index",
  "EMEA Equities": ["iefa_equity_index", "ewh_equity_index"],
  "APAC Equities": ["iefa_equity_index", "ewh_equity_index"],
  "Non-US America Equities": ["iefa_equity_index", "ewh_equity_index"],
};
const RegionsPnls = () => {
  const [data, setData] = useState<Record<string, RegionPnls>>({});
  const [indexReturns, setIndexReturns] = useState<Record<string, RegionPnls>>({});
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
        setData(result || {});
        setIndexReturns(result?.IndexReturns || {});
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

  const filteredOrderedRegions = regionOrder.filter((region) =>
    data.hasOwnProperty(region)
  );

  return (
    <Container
      maxWidth="xl"
      sx={{ mt: 4, mb: 4, backgroundColor: "#d4e4f3", borderRadius: 2, pb: 2 }}
    >
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h5"
          align="center"
          gutterBottom
          sx={{ color: "#016676", fontWeight: "bold", padding: 2, mb: 2 }}
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
          <Box sx={{ px: 1 }}>
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
                        sx={{ mb: 2, mt: 2, fontWeight: "bold" }}
                      >
                        {region} P&L
                      </Typography>

                      <Box sx={{ width: "100%", overflow: "hidden" }}>
                        <Grid container spacing={1}>
                          {displayKeys.map(({ key, label }) => {
                            const pnlVal = pnlValues[key as PnlKey];
                            const indexMapping = regionToIndexMap[region];
                            let indexVal: number | null = null;

                            if (Array.isArray(indexMapping)) {
                              const validReturns = indexMapping
                                .map((idx) => indexReturns[idx]?.[key])
                                .filter((val) => typeof val === "number") as number[];

                              indexVal =
                                validReturns.length > 0
                                  ? validReturns.reduce((sum, val) => sum + val, 0) /
                                  validReturns.length
                                  : null;
                            } else if (typeof indexMapping === "string") {
                              indexVal = indexReturns[indexMapping]?.[key] ?? null;
                            }

                            return (
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
                                  minHeight: "100px",
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
                                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                  <Typography
                                    variant="subtitle1"
                                    sx={{
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
                                      color: "#016676",
                                    }}
                                  >
                                    {formatValue(pnlVal)}
                                  </Typography>

                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: "0.7rem",
                                      color: "black",
                                      fontStyle: "italic", // italic style
                                      mt: 0.3,
                                    }}
                                  >
                                    {Array.isArray(indexMapping)
                                      ? indexMapping
                                        .map((idxKey) => {
                                          const val = indexReturns[idxKey]?.[key];
                                          return typeof val === "number"
                                            ? `${idxKey.replace("_equity_index", "").toUpperCase()}: ${val.toFixed(2)}%`
                                            : null;
                                        })
                                        .filter(Boolean)
                                        .join(" | ")
                                      : typeof indexVal === "number"
                                        ? `${indexMapping.replace("_equity_index", "").toUpperCase()}: ${indexVal.toFixed(2)}%`
                                        : "-"}
                                  </Typography>
                                </Box>


                              </Grid>
                            );
                          })}
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

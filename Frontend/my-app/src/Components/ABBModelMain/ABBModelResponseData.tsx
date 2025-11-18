import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { green, red, blue } from "@mui/material/colors";
import ABBDataInsertion from "./ABBDataInsertion";

interface Payload {
  ticker: string;
  trade_date: string;
  launch_date: string;
  clean_up: boolean;
  seasoned: boolean;
  timing: boolean;
  primary: boolean;
  emerging_mkt: boolean;
  block_deal_shares: number;
  block_deal_percentage_of_market_cap: number;
  block_deal_value_in_local_currency: number;
  block_deal_value_in_dollar: number;
}

interface FlattenedRow {
  keyPath: string;
  label: string;
  displayValue: string | null;
  depth: number;
  isGroupHeader: boolean;
  rawValue: any;
}

const formatLabel = (key: string) =>
  key
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const formatValue = (value: any, key: string) => {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (typeof value === "number") {
    const lowerKey = key.toLowerCase();
    const percentKeys = ["percent", "rsi", "volatility"];
    const currencyKeys = [
      "price",
      "value",
      "cap",
      "market",
      "vwap",
      "adtv",
      "dividend",
      "yield",
      "enterprise",
    ];

    if (percentKeys.some((term) => lowerKey.includes(term))) {
      return `${value.toFixed(2)}%`;
    }

    if (currencyKeys.some((term) => lowerKey.includes(term))) {
      return `$${value.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return value.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }

  return String(value);
};

const flattenData = (
  payload: any,
  depth = 0,
  parentPath = ""
): FlattenedRow[] => {
  if (!payload || typeof payload !== "object") {
    return [];
  }

  return Object.entries(payload).flatMap(([key, value]) => {
    const keyPath = parentPath ? `${parentPath}.${key}` : key;
    const label = formatLabel(key);

    if (value && typeof value === "object" && !Array.isArray(value)) {
      return [
        {
          keyPath,
          label,
          displayValue: null,
          depth,
          isGroupHeader: true,
          rawValue: value,
        },
        ...flattenData(value, depth + 1, keyPath),
      ];
    }

    return [
      {
        keyPath,
        label,
        displayValue: formatValue(value, key),
        depth,
        isGroupHeader: false,
        rawValue: value,
      },
    ];
  });
};

const getValueColor = (value: any) => {
  if (typeof value === "number") {
    if (value > 0) return green[600];
    if (value < 0) return red[600];
    return blue[700];
  }
  return blue[900];
};

const ABBModelResponseData = ({ payload }: { payload: Payload }) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      setLoading(true);
      setError(null);
      setData(null);

      try {
        const res = await fetch(`${apiUrl}/api/abb_factset_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          return;
        }
        setError(err?.message ?? "Failed to fetch data");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => controller.abort();
  }, [payload]);

  const AbbDataCreation = useMemo(() => {
    if (loading || !data) {
      return null;
    }

    return {
      payload,
      apiResponse: data,
    };
  }, [payload, data, loading]);

  if (loading) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Loading ABB response...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 3 }}>
        <Typography variant="body2" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  if (!data) {
    return null;
  }

  const rows = flattenData(data);
  const discountRows = rows.filter(
    (row) => !row.isGroupHeader && row.keyPath.toLowerCase().includes("discount")
  );
  const overviewRows = rows.filter(
    (row) => !row.keyPath.toLowerCase().includes("discount")
  );
  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          mt: 4,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 25px 50px rgba(0,0,0,0.08)",
          border: "1px solid rgba(15, 52, 163, 0.16)",
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2.5,
            background: "linear-gradient(135deg, #081c3c 0%, #0c3980 100%)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff" }}>
            Discount Overview
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "rgba(255,255,255,0.75)" }}>
            Breakdown of every discount component returned by the model
          </Typography>
        </Box>

        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: blue[900],
                  borderBottom: "1px solid rgba(15, 52, 163, 0.2)",
                }}
              >
                Discount Metric
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  color: blue[900],
                  borderBottom: "1px solid rgba(15, 52, 163, 0.2)",
                }}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {discountRows.length ? (
              discountRows.map((row) => (
                <TableRow
                  key={row.keyPath}
                  sx={{
                    backgroundColor: row.depth % 2 === 0 ? "#ffffff" : "#f4f7ff",
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      py: 1.25,
                      fontWeight: 600,
                      color: "#0b1b3a",
                      pl: 2,
                      borderBottom: "none",
                    }}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.25, borderBottom: "none" }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: getValueColor(row.rawValue) }}>
                      {row.displayValue}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    No discount metrics returned for this request.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TableContainer
        component={Paper}
        sx={{
          mt: 4,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 25px 60px rgba(15, 52, 163, 0.15)",
          border: "1px solid rgba(15, 52, 163, 0.16)",
        }}
      >
        <Box
          sx={{
            px: { xs: 2.5, md: 3 },
            py: 2.5,
            background: "linear-gradient(135deg, #d9e8ff 0%, #eef3ff 100%)",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, color: blue[900] }}>
            Additional Fundamentals
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complete payload delivered by the ABB scoring service
          </Typography>
        </Box>

        <Table size="small" sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  fontWeight: 700,
                  color: blue[900],
                  borderBottom: "1px solid rgba(15, 52, 163, 0.2)",
                }}
              >
                Metric
              </TableCell>
              <TableCell
                align="right"
                sx={{
                  fontWeight: 700,
                  color: blue[900],
                  borderBottom: "1px solid rgba(15, 52, 163, 0.2)",
                }}
              >
                Value
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {overviewRows.map((row) => {
              const groupFieldCount =
                row.isGroupHeader && row.rawValue && typeof row.rawValue === "object"
                  ? Object.keys(row.rawValue).length
                  : 0;

              return (
                <TableRow
                  key={row.keyPath}
                  sx={{
                    backgroundColor: row.isGroupHeader
                      ? "rgba(195, 217, 255, 0.6)"
                      : row.depth % 2 === 0
                      ? "#ffffff"
                      : "#f7f9ff",
                    "&:last-child td": { borderBottom: "none" },
                  }}
                >
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      py: 1.25,
                      fontWeight: row.isGroupHeader ? 700 : 600,
                      color: row.isGroupHeader ? blue[900] : "#0b1b3a",
                      pl: row.depth * 3 + 1,
                      borderBottom: "none",
                    }}
                  >
                    {row.label}
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1.25, borderBottom: "none" }}>
                    {row.isGroupHeader ? (
                      <Typography variant="body2" color="text.secondary">
                        {groupFieldCount ? `Contains ${groupFieldCount} fields` : "Details"}
                      </Typography>
                    ) : (
                      <Typography variant="body2" sx={{ color: getValueColor(row.rawValue) }}>
                        {row.displayValue}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Box>
        {/* Pass the combined data (payload + apiResponse) to ABBDataInsertion */}
        <ABBDataInsertion AbbDataCreation={AbbDataCreation} />
      </Box>
    </>
  );
};

export default ABBModelResponseData;

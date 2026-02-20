// src/components/FinancialMetricsChartsContent.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  Paper,
  Stack,
} from "@mui/material";
import {
  Bar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
  Line,
} from "recharts";
import type { MetricsRow } from "./FinancialMetricsBarCharts";

type MetricPrefix =
  | "sales_growth"
  | "gross_margin"
  | "ebitda_adj_margin"
  | "net_income_margin"
  | "roe"
  | "sales_estimate"
  | "gross_income"
  | "ebit"
  | "adj_ebitda"
  | "net_income"
  | "net_interest_income"
  | "pbt"
  | "net_revenue_net_sales";

type MetricFormat = "percentage" | "currency" | "number";

interface MetricConfig {
  key: MetricPrefix;
  title: string;
  yAxisLabel: string;
  format?: MetricFormat;
}

const METRICS: MetricConfig[] = [
  {
    key: "sales_growth",
    title: "Sales Growth",
    yAxisLabel: "Sales Growth (%)",
    format: "percentage",
  },
  {
    key: "gross_margin",
    title: "Gross Margin",
    yAxisLabel: "Gross Margin (%)",
    format: "percentage",
  },
  {
    key: "ebitda_adj_margin",
    title: "EBITDA Adj Margin",
    yAxisLabel: "EBITDA Adj Margin (%)",
    format: "percentage",
  },
  {
    key: "net_income_margin",
    title: "Net Income Margin",
    yAxisLabel: "Net Income Margin (%)",
    format: "percentage",
  },
  {
    key: "roe",
    title: "Return on Equity (ROE)",
    yAxisLabel: "ROE (%)",
    format: "percentage",
  },
  {
    key: "sales_estimate",
    title: "Sales Estimate",
    yAxisLabel: "Sales Estimate (USD)",
    format: "currency",
  },
  {
    key: "gross_income",
    title: "Gross Income",
    yAxisLabel: "Gross Income (USD)",
    format: "currency",
  },
  {
    key: "ebit",
    title: "EBIT",
    yAxisLabel: "EBIT (USD)",
    format: "currency",
  },
  {
    key: "adj_ebitda",
    title: "Adjusted EBITDA",
    yAxisLabel: "Adj. EBITDA (USD)",
    format: "currency",
  },
  {
    key: "net_income",
    title: "Net Income",
    yAxisLabel: "Net Income (USD)",
    format: "currency",
  },
  {
    key: "net_interest_income",
    title: "Net Interest Income",
    yAxisLabel: "Net Interest Income (USD)",
    format: "currency",
  },
  {
    key: "pbt",
    title: "Profit Before Tax (PBT)",
    yAxisLabel: "PBT (USD)",
    format: "currency",
  },
  {
    key: "net_revenue_net_sales",
    title: "Revenue / Net Sales",
    yAxisLabel: "Revenue / Net Sales (USD)",
    format: "currency",
  },
];

const YEARS = [2024, 2025, 2026];

// Distinct darker colors for peers
const BAR_COLORS = [
  "#264653", // deep teal blue
  "#2A9D8F", // dark turquoise green
  "#6D597A", // dark mauve purple
  "#457B9D", // slate blue
  "#1D3557", // navy blue
  "#7B904B", // olive green
  "#B56576", // warm plum
  "#3D5A80", // steel blue
  "#F4A261", // sandy orange
  "#E9C46A", // mustard yellow
  "#90BE6D", // soft green
  "#F9C74F", // bright yellow
  "#43AA8B", // teal
  "#577590", // cool blue
];

// Accent for the selected ticker line
const SELECTED_LINE_COLOR = "#e42d36ff";

// Max number of peers to show at once
const MAX_SELECTED_PEERS = 5;

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const currencyAxisFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const formatCurrencyValue = (value?: number | null): string =>
  value === null || value === undefined ? "-" : currencyFormatter.format(value);

const roundToTwoDecimals = (
  value: number | null | undefined
): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return Math.round(value * 100) / 100;
};

const formatValueLabel = (
  value: number | string | null | undefined,
  format?: MetricFormat
): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  if (format === "currency") {
    return currencyAxisFormatter.format(Math.round(numericValue));
  }

  if (format === "percentage") {
    return `${Math.round(numericValue)}%`;
  }

  return Math.round(numericValue).toLocaleString("en-US");
};

const formatAxisTick = (
  value: number | string | null | undefined,
  format?: MetricFormat
): string => {
  if (value === null || value === undefined) return "";

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) return "";

  const rounded = Math.round(numericValue);

  if (format === "currency") {
    return currencyAxisFormatter.format(rounded);
  }

  if (format === "percentage") {
    return `${rounded}%`;
  }

  return rounded.toLocaleString("en-US");
};

interface Props {
  ticker: string;
  data: MetricsRow[];
  includeInPdf?: boolean;
  onIncludeInPdfChange?: (checked: boolean) => void;
}

const FinancialMetricsChartsContent: React.FC<Props> = ({
  ticker,
  data,
  includeInPdf: controlledIncludeInPdf,
  onIncludeInPdfChange,
}) => {
  const [localIncludeInPdf, setLocalIncludeInPdf] = useState<boolean>(false);
  const isControlled = controlledIncludeInPdf !== undefined;
  const includeInPdf = isControlled ? controlledIncludeInPdf : localIncludeInPdf;
  const handleIncludeInPdfChange = (checked: boolean) => {
    if (!isControlled) {
      setLocalIncludeInPdf(checked);
    }
    onIncludeInPdfChange?.(checked);
  };
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);

  const dataByTicker = useMemo(() => {
    const map = new Map<string, MetricsRow>();
    data.forEach((row) => map.set(row.fs_ticker, row));
    return map;
  }, [data]);

  // All fs_ticker strings
  const companies = useMemo(
    () => Array.from(new Set(data.map((row) => row.fs_ticker))),
    [data]
  );

  const selectedBaseTicker = ticker.toUpperCase();

  // Find which fs_ticker corresponds to the selected ticker (e.g. LIFE -> LIFE-US)
  const selectedCompanyKey = useMemo(() => {
    const match = data.find(
      (row) => row.fs_ticker.split("-")[0].toUpperCase() === selectedBaseTicker
    );
    return match ? match.fs_ticker : null;
  }, [data, selectedBaseTicker]);

  const selectedSnapshot = useMemo(() => {
    if (!selectedCompanyKey) {
      return null;
    }
    const snapshot = dataByTicker.get(selectedCompanyKey);
    if (!snapshot) {
      return null;
    }
    return {
      date: snapshot.date,
      price: snapshot.price,
    };
  }, [dataByTicker, selectedCompanyKey]);

  // Peer companies = all except the selected one
  const peerCompanies = useMemo(
    () =>
      companies.filter(
        (c) => !selectedCompanyKey || c !== selectedCompanyKey
      ),
    [companies, selectedCompanyKey]
  );

  // Initialise / adjust selected peers when peer list changes
  useEffect(() => {
    if (!peerCompanies.length) {
      setSelectedPeers([]);
      return;
    }

    setSelectedPeers((prev) => {
      const stillValid = prev.filter((p) => peerCompanies.includes(p));
      if (stillValid.length > 0) {
        return stillValid.slice(0, MAX_SELECTED_PEERS);
      }
      return peerCompanies.slice(0, MAX_SELECTED_PEERS);
    });
  }, [peerCompanies]);

  // Helper: build chart data per metric
  const buildMetricChartData = (metric: MetricPrefix) => {
    return YEARS.map((year) => {
      const entry: Record<string, any> = {
        year: year.toString(),
      };

      data.forEach((row) => {
        const key = `${metric}_${year}` as keyof MetricsRow;
        const value = row[key];
        entry[row.fs_ticker] = roundToTwoDecimals(
          value as number | null | undefined
        );
      });

      return entry;
    });
  };

  // Helper: check if this metric has at least one non-null value
  const metricHasData = (metric: MetricPrefix): boolean => {
    for (const row of data) {
      for (const year of YEARS) {
        const key = `${metric}_${year}` as keyof MetricsRow;
        const value = row[key];
        if (value !== null && value !== undefined) {
          return true;
        }
      }
    }
    return false;
  };



    // Helper: check if the selected ticker (line) has at least one non-null value
  const metricHasLineDataForSelected = (metric: MetricPrefix): boolean => {
    if (!selectedCompanyKey) return false;

    const row = dataByTicker.get(selectedCompanyKey);
    if (!row) return false;

    for (const year of YEARS) {
      const key = `${metric}_${year}` as keyof MetricsRow;
      const value = row[key];
      if (value !== null && value !== undefined) {
        return true;
      }
    }

    return false;
  };

  const handlePeerToggle = useCallback(
    (company: string) => {
      setSelectedPeers((prev) => {
        const isSelected = prev.includes(company);
        if (isSelected) {
          // Unselect
          return prev.filter((c) => c !== company);
        }

        // If limit reached, user needs to deselect first
        if (prev.length >= MAX_SELECTED_PEERS) {
          return prev; // Ignore extra selection
        }

        return [...prev, company];
      });
    },
    []
  );

  return (
    <Card className={includeInPdf ? "" : "pdf-hidden"}>
      <Box mt={3}>
        {/* Heading + PDF toggle */}
        <Box
          mb={3}
          position="relative"
          display="flex"
          alignItems="center"
          minHeight={48}
        >
          <Typography
            variant="h6"
            color="#002060"
            sx={{ fontWeight: 600, textAlign: "center", width: "100%" }}
          >
            Key Financial Metrics - Peer Comparison ({ticker.toUpperCase()})
          </Typography>
          <Box
            sx={{
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={includeInPdf}
                  onChange={(event) =>
                    handleIncludeInPdfChange(event.target.checked)
                  }
                  size="small"
                />
              }
              label="Include in the PDF"
              className="pdf-hidden"
            />
          </Box>
        </Box>

        {selectedSnapshot && (
          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{ color: "#000000", mb: 2, textAlign: "center" }}
          >
            Snapshot: {selectedSnapshot.date} · Price:{" "}
            {selectedSnapshot.price !== null &&
            selectedSnapshot.price !== undefined
              ? formatCurrencyValue(selectedSnapshot.price)
              : "N/A"}
          </Typography>
        )}

        {/* Peer ticker selector - enhanced UI */}
        <Paper
          elevation={0}
          sx={{
            mb: 3,
            px: 2.5,
            py: 2,
            borderRadius: 2,
            bgcolor: "#f3f6fb",
            border: "1px solid #dde3f0",
          }}
        >
          <Typography
            variant="subtitle2"
            align="center"
            sx={{ fontWeight: 700, color: "#002060", textTransform: "uppercase", letterSpacing: 0.5 }}
          >
            Peer Tickers
          </Typography>
          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{ mt: 0.5, color: "#000000" }}
          >
            Select up to {MAX_SELECTED_PEERS} peers to compare
          </Typography>

          <Stack
            direction="row"
            flexWrap="wrap"
            justifyContent="center"
            gap={1}
            mt={1.5}
          >
            {peerCompanies.map((company) => {
              const peerRow = dataByTicker.get(company);
              const priceSuffix =
                peerRow && peerRow.price !== null && peerRow.price !== undefined
                  ? ` (${formatCurrencyValue(peerRow.price)})`
                  : "";
              const chipLabel = `${company}${priceSuffix}`;

              const isSelected = selectedPeers.includes(company);
              const disable =
                !isSelected && selectedPeers.length >= MAX_SELECTED_PEERS;

              const colorIndex = peerCompanies.indexOf(company);
              const baseColor =
                BAR_COLORS[colorIndex % BAR_COLORS.length];

              return (
                <Chip
                  key={company}
                  label={chipLabel}
                  onClick={() => {
                    if (!disable) {
                      handlePeerToggle(company);
                    }
                  }}
                  clickable={!disable}
                  sx={{
                    fontWeight: 600,
                    borderRadius: "999px",
                    px: 1.5,
                    py: 0.25,
                    borderWidth: 1,
                    borderStyle: "solid",
                    borderColor: isSelected ? baseColor : "#c5ccd9",
                    bgcolor: isSelected ? baseColor : "#ffffff",
                    color: isSelected ? "#ffffff" : "#1b2433",
                    opacity: disable ? 0.4 : 1,
                    transition: "all 0.15s ease-in-out",
                    "& .MuiChip-label": {
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                    },
                    "&:hover": {
                      boxShadow: disable
                        ? "none"
                        : "0 0 0 2px rgba(0, 0, 0, 0.06)",
                      transform: disable ? "none" : "translateY(-1px)",
                    },
                  }}
                  icon={
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        bgcolor: baseColor,
                        boxShadow: isSelected
                          ? "0 0 0 2px rgba(255,255,255,0.7)"
                          : "none",
                      }}
                    />
                  }
                />
              );
            })}
          </Stack>

          <Typography
            variant="caption"
            align="center"
            display="block"
            sx={{ mt: 1, color: "text.disabled" }}
          >
            To compare another peer, unselect one of the chosen tickers if you&apos;ve already selected {MAX_SELECTED_PEERS}.
          </Typography>
        </Paper>

        {/* Charts */}
        <Grid container spacing={3}>
          {METRICS
            // Only show charts where the selected ticker's line has data
            .filter((m) => metricHasLineDataForSelected(m.key))
            .map((metric) => {
              const chartData = buildMetricChartData(metric.key);

              return (
                <Grid item xs={12} md={6} key={metric.key}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      boxShadow: 2,
                      backgroundColor: "#fafafa",
                      borderColor: "#e0e0e0",
                      p: 2,
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography
                        variant="subtitle1"
                        gutterBottom
                        align="center"
                        sx={{ fontWeight: 600, color: "#002060" }}
                      >
                        {metric.title}
                      </Typography>
                      <Box height={320}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={chartData}
                            margin={{
                              top: 20,
                              right: 20,
                              left: 50,
                              bottom: 20,
                            }}
                          >
                            <XAxis
                              dataKey="year"
                              label={{
                                value: "Year",
                                position: "insideBottom",
                                offset: -5,
                                style: {
                                  fontSize: 11,
                                  fontWeight: 700,
                                  fill: "#002060",
                                },
                              }}
                            />
                            <YAxis
                              tickFormatter={(v) =>
                                formatAxisTick(v, metric.format)
                              }
                              allowDecimals={false}
                              width={90}
                              tickMargin={8}
                              label={{
                                value: metric.yAxisLabel,
                                angle: -90,
                                position: "left",
                                offset: 20,
                                style: {
                                  fontSize: 11,
                                  fontWeight: 700,
                                  textAnchor: "middle",
                                  fill: "#002060",
                                },
                              }}
                            />
                            <Tooltip
                              formatter={(value: any, name: string) => [
                                formatValueLabel(value, metric.format),
                                name,
                              ]}
                            />
                            <Legend />

                            {/* Bars for selected peers only */}
                            {peerCompanies
                              .filter((company) =>
                                selectedPeers.includes(company)
                              )
                              .map((company) => {
                                const colorIndex =
                                  peerCompanies.indexOf(company);
                                const fillColor =
                                  BAR_COLORS[colorIndex % BAR_COLORS.length];

                                return (
                                  <Bar
                                    key={`${metric.key}-${company}`}
                                    dataKey={company}
                                    name={company}
                                    fill={fillColor}
                                    barSize={18}
                                  />
                                );
                              })}

                            {/* Line for the selected ticker */}
                            {selectedCompanyKey && (
                              <Line
                                type="linear"
                                dataKey={selectedCompanyKey}
                                name={`${selectedCompanyKey}`}
                                stroke={SELECTED_LINE_COLOR}
                                strokeWidth={3}
                                dot={{ r: 4 }}
                                activeDot={{ r: 5 }}
                              />
                            )}
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
        </Grid>

      </Box>
    </Card>
  );
};

export default FinancialMetricsChartsContent;

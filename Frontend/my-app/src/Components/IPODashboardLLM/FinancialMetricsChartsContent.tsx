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
  | "roe";

interface MetricConfig {
  key: MetricPrefix;
  title: string;
  yAxisLabel: string;
}

const METRICS: MetricConfig[] = [
  {
    key: "sales_growth",
    title: "Sales Growth",
    yAxisLabel: "Sales Growth (%)",
  },
  {
    key: "gross_margin",
    title: "Gross Margin",
    yAxisLabel: "Gross Margin (%)",
  },
  {
    key: "ebitda_adj_margin",
    title: "EBITDA Adj Margin",
    yAxisLabel: "EBITDA Adj Margin (%)",
  },
  {
    key: "net_income_margin",
    title: "Net Income Margin",
    yAxisLabel: "Net Income Margin (%)",
  },
  {
    key: "roe",
    title: "Return on Equity (ROE)",
    yAxisLabel: "ROE (%)",
  },
];

const YEARS = [2024, 2025, 2026];

// 10+ distinct darker colors for peers
const BAR_COLORS = [
  "#264653", // deep teal blue
  "#2A9D8F", // dark turquoise green
  "#8E3B46", // dark rose red
  "#E76F51", // muted coral
  "#6D597A", // dark mauve purple
  "#457B9D", // slate blue
  "#1D3557", // navy blue
  "#7B904B", // olive green
  "#B56576", // warm plum
  "#3D5A80", // steel blue
  "#F4A261", // sandy orange
  "#E9C46A", // mustard yellow
  "#90BE6D", // soft green
  "#F3722C", // vibrant orange
  "#F9C74F", // bright yellow
  "#43AA8B", // teal
  "#577590", // cool blue
];

// Accent for the selected ticker line
const SELECTED_LINE_COLOR = "#e42d36ff";

// Max number of peers to show at once
const MAX_SELECTED_PEERS = 4;

const roundToTwoDecimals = (
  value: number | null | undefined
): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }
  return Math.round(value * 100) / 100;
};

const formatValueLabel = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined) {
    return "-";
  }

  const numericValue = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numericValue)) {
    return "-";
  }

  return numericValue.toFixed(2);
};

interface Props {
  ticker: string;
  data: MetricsRow[];
}

const FinancialMetricsChartsContent: React.FC<Props> = ({ ticker, data }) => {
  const [includeInPdf, setIncludeInPdf] = useState<boolean>(false);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]);

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
                  onChange={(event) => setIncludeInPdf(event.target.checked)}
                  size="small"
                />
              }
              label="Include in the PDF"
            />
          </Box>
        </Box>

        {/* Peer ticker selector */}
        <Box mb={2}>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 600, mb: 1, color: "#002060" }}
          >
            Peer Tickers (select up to {MAX_SELECTED_PEERS})
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {peerCompanies.map((company) => {
              const checked = selectedPeers.includes(company);
              const disableCheckbox =
                !checked && selectedPeers.length >= MAX_SELECTED_PEERS;

              return (
                <FormControlLabel
                  key={company}
                  control={
                    <Checkbox
                      size="small"
                      checked={checked}
                      onChange={() => handlePeerToggle(company)}
                      disabled={disableCheckbox}
                    />
                  }
                  label={company}
                />
              );
            })}
          </Box>
          <Typography variant="caption" color="text.secondary">
            To compare another peer, uncheck one of the selected tickers if you
            have already selected {MAX_SELECTED_PEERS}.
          </Typography>
        </Box>

        {/* Charts */}
        <Grid container spacing={3}>
          {METRICS.filter((m) => metricHasData(m.key)).map((metric) => {
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
                          margin={{ top: 20, right: 20, left: 50, bottom: 20 }}
                        >
                          <XAxis dataKey="year" />
                          <YAxis
                            tickFormatter={(v) => formatValueLabel(v)}
                            label={{
                              value: metric.yAxisLabel,
                              angle: -90,
                              position: "insideLeft",
                              offset: 10,
                              style: { fontSize: 11 },
                            }}
                          />
                          <Tooltip
                            formatter={(value: any, name: string) => [
                              formatValueLabel(value),
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
                                BAR_COLORS[
                                  colorIndex % BAR_COLORS.length
                                ];

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
                              type="monotone"
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

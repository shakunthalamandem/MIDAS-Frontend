// src/components/IPODashboardMain/IPOCompsChart.tsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Chip,
  Divider,
  Tooltip as MuiTooltip,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";

type ComparableMetric = {
  ticker: string;
  competitor: string;
  price_usd: string;
  market_cap: number | null;
  ev_usd_million: number | null;
  present_year_ev_sales: number | null; // 2025 EV/Sales
  one_year_later_ev_sales: number | null; // 2026 EV/Sales
  present_year_price_earning: number | null; // 2025 P/E
  one_year_later_price_earning: number | null; // 2026 P/E
  present_year_ev_ebitda: number | null; // 2025 EV/EBITDA
  one_year_later_ev_ebitda: number | null; // 2026 EV/EBITDA
  sales_growth: number | null; // 25-26
  eps_growth: number | null; // 25-26
  ai_generated: boolean;
};

type AveragesType = {
  [key: string]: { average?: number; median?: number };
};

type ApiResponse = {
  [ticker: string]: { data: ComparableMetric[]; Averages?: AveragesType };
};

interface Props {
  ticker: string;
  data: ApiResponse;
}

type MetricKey =
  | "market_cap"
  | "ev_usd_million"
  | "present_year_ev_sales"
  | "one_year_later_ev_sales"
  | "present_year_price_earning"
  | "one_year_later_price_earning"
  | "present_year_ev_ebitda"
  | "one_year_later_ev_ebitda"
  | "sales_growth"
  | "eps_growth";

const METRIC_OPTIONS: Array<{
  key: MetricKey;
  label: string;
  isPercent?: boolean; // only for formatting, not calculations
}> = [
  { key: "market_cap", label: "Market Cap (USDm)" },
  { key: "ev_usd_million", label: "Enterprise Value (USDm)" },
  { key: "present_year_ev_sales", label: "2025 EV/Sales" },
  { key: "one_year_later_ev_sales", label: "2026 EV/Sales" },
  { key: "present_year_price_earning", label: "2025 P/E" },
  { key: "one_year_later_price_earning", label: "2026 P/E" },
  { key: "present_year_ev_ebitda", label: "2025 EV/EBITDA" },
  { key: "one_year_later_ev_ebitda", label: "2026 EV/EBITDA" },
  { key: "sales_growth", label: "Sales Growth (25→26)", isPercent: true },
  { key: "eps_growth", label: "EPS Growth (25→26)", isPercent: true },
];

// Clean NA-like values -> 0 for visualization
function toNumberOrZero(v: unknown): number {
  if (v == null) return 0;

  if (typeof v === "string") {
    const trimmed = v.trim().toLowerCase();
    if (
      trimmed === "" ||
      trimmed === "na" ||
      trimmed === "n/a" ||
      trimmed === "nm" ||
      trimmed === "n.m." ||
      trimmed === "n.m" ||
      trimmed === "n.a" ||
      trimmed === "--" ||
      trimmed === "-"
    ) {
      return 0;
    }
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (typeof v === "number") {
    return Number.isFinite(v) ? v : 0;
  }

  return 0;
}

const numberFormatter = (v: number) =>
  new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(v);

const percentFormatter = (v: number) => `${numberFormatter(v)}%`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    const value = (item?.value ?? 0) as number;
    const isPercent = item?.payload?.__isPercent as boolean | undefined;
    const display = isPercent
      ? percentFormatter(value)
      : numberFormatter(value);

    return (
      <Box
        sx={{
          p: 1.2,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          borderRadius: 1.5,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="body2">
          {item?.name ?? "Value"}: {display}
        </Typography>
      </Box>
    );
  }
  return null;
};

const IPOCompsChart: React.FC<Props> = ({ ticker, data }) => {
  const [metric, setMetric] = useState<MetricKey>("present_year_ev_sales");

  const rows: ComparableMetric[] = useMemo(() => {
    // Prefer the requested ticker block; fallback to the first key
    const key = data[ticker] ? ticker : Object.keys(data)[0];
    return key ? data[key].data : [];
  }, [data, ticker]);

  const selectedMeta = METRIC_OPTIONS.find((m) => m.key === metric)!;
  const upperTicker = ticker?.toUpperCase?.() ?? "";

  // Keep order stable across metric changes.
  // Ensure main ticker is always first, others follow in original order.
  const orderedRows = useMemo(() => {
    if (!rows.length) return [];
    const main: ComparableMetric[] = [];
    const others: ComparableMetric[] = [];

    rows.forEach((r) => {
      if (r.ticker?.toUpperCase?.() === upperTicker) {
        main.push(r);
      } else {
        others.push(r);
      }
    });

    return [...main, ...others];
  }, [rows, upperTicker]);

  const chartData = useMemo(() => {
    return orderedRows.map((row) => {
      const raw = (row as any)[metric];
      const cleaned = toNumberOrZero(raw); // 0 if missing / NA-like

      const displayName = (
        row.competitor?.trim() ||
        row.ticker ||
        ""
      ).toUpperCase();

      return {
        name: displayName,
        value: cleaned,
        __isFocus: row.ticker?.toUpperCase?.() === upperTicker,
        __isPercent: !!selectedMeta.isPercent,
      };
    });
  }, [orderedRows, metric, upperTicker, selectedMeta.isPercent]);

  const hasData = chartData.length > 0;

  const yTickFormatter = (v: number) =>
    selectedMeta.isPercent ? percentFormatter(v) : numberFormatter(v);

  const handleMetricSelect = (key: MetricKey) => {
    // Only one "checkbox" active at a time
    if (metric !== key) {
      setMetric(key);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        width: "100%",
        borderRadius: 3,
        borderColor: "divider",
      }}
    >
      <CardHeader
        sx={{ pb: 0, textAlign: "center" }}
        title={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Peer Comparison — {selectedMeta.label}
            </Typography>
          </Box>
        }
      />

      <CardContent>
        <Box sx={{ height: 380, width: "100%", mb: 1 }}>
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 16, left: 8, bottom: 0.1 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 11 }}
                />
                <YAxis tickFormatter={yTickFormatter} tick={{ fontSize: 11 }} />
                {/* Bold dark 0-line for negative / positive comparison */}
                <ReferenceLine y={0} stroke="#424242" strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  name={selectedMeta.label}
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  barSize={26}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      // Main ticker highlighted, peers muted
                      fill={entry.__isFocus ? "#1565c0" : "#90a4ae"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="body2" color="text.secondary">
                No comparable metrics available to visualize.
              </Typography>
            </Box>
          )}
        </Box>

        {/* Metric selector — 2 rows x 5 columns, checkbox style but exclusive */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
            columnGap: 1,
            rowGap: 0.5,
          }}
        >
          {METRIC_OPTIONS.map((opt) => (
            <Box
              key={opt.key}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={metric === opt.key}
                    onChange={() => handleMetricSelect(opt.key)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ fontSize: 13 }}>
                    {opt.label}
                  </Typography>
                }
              />
            </Box>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default IPOCompsChart;

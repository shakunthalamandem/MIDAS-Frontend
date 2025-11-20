import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Chip,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Stack,
} from "@mui/material";

type TimePoint = { date: string; value: number };
type TickerSeries = { ticker: string; data: TimePoint[] };

type ApiResponse = {
  data: TickerSeries[];
};

interface Props {
  apiUrl: string; // base URL, e.g. https://example.com
  token?: string | null;
  fsTickers?: string[]; // default sample ["AAPL-US","FANG-US"]
  pricingDate?: string; // "YYYY-MM-DD", default "2025-11-11" (sample)
  height?: number;
  width?: number | "100%";
}

const PALETTE = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
];

export default function FinancialMetricsPEchart({
  apiUrl,
  token,
  fsTickers = ["AAPL-US", "FANG-US"],
  pricingDate = "2025-11-11",
  height = 320,
  width = "100%",
}: Props) {
  const [tickers, setTickers] = useState<string[]>(fsTickers);
  const [dateInput, setDateInput] = useState<string>(pricingDate);
  const [data, setData] = useState<TickerSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    x: number;
    y: number;
    label: string;
    value: number;
  } | null>(null);

  // Fetch data effect - follows the pattern you gave (POST + JSON)
  useEffect(() => {
    const fetchData = async () => {
      if (!apiUrl) {
        setError("API URL is not configured.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiUrl}/api/fs_pe_time_series_data/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            fs_tickers: tickers,
            pricing_date: dateInput,
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(
            `Failed to fetch metrics. Status: ${response.status}. ${text}`
          );
        }

        const json: ApiResponse = await response.json();
        // Normalize: ensure series sorted by date ascending
        const normalized = (json.data || []).map((s) => ({
          ticker: s.ticker,
          data: [...s.data].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }));
        setData(normalized);
      } catch (err: any) {
        setError(err.message || "Failed to load data.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [apiUrl, token, tickers, dateInput]);

  // Derived values for chart scale
  const { allDates, yMin, yMax } = useMemo(() => {
    const datesSet = new Set<string>();
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    data.forEach((series) => {
      series.data.forEach((pt) => {
        datesSet.add(pt.date);
        if (typeof pt.value === "number") {
          if (pt.value < min) min = pt.value;
          if (pt.value > max) max = pt.value;
        }
      });
    });

    const allDatesArr = Array.from(datesSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (!isFinite(min)) {
      min = 0;
      max = 1;
    } else if (min === max) {
      // pad a bit if flat
      min = min - Math.abs(min * 0.05 || 1);
      max = max + Math.abs(max * 0.05 || 1);
    } else {
      const pad = (max - min) * 0.08;
      min = min - pad;
      max = max + pad;
    }

    return { allDates: allDatesArr, yMin: min, yMax: max };
  }, [data]);

  // Chart geometry
  const viewWidth = 800;
  const viewHeight = 320;
  const margin = { top: 20, right: 16, bottom: 36, left: 56 };
  const innerWidth = viewWidth - margin.left - margin.right;
  const innerHeight = viewHeight - margin.top - margin.bottom;

  // helpers to convert data->svg coords
  const xForIndex = (i: number) => {
    if (allDates.length <= 1) return margin.left + innerWidth / 2;
    const step = innerWidth / (allDates.length - 1);
    return margin.left + i * step;
  };

  const yForValue = (val: number) => {
    // linear scale: y decreases as value increases
    const t = (val - yMin) / (yMax - yMin);
    return margin.top + (1 - t) * innerHeight;
  };

  // Build polylines for each ticker
  const polylines = useMemo(() => {
    return data.map((series, idx) => {
      // map each series point to nearest x based on date index in allDates
      const points: { x: number; y: number; date: string; value: number }[] =
        series.data
          .map((pt) => {
            const xIndex = allDates.indexOf(pt.date);
            if (xIndex === -1) return null;
            return { x: xForIndex(xIndex), y: yForValue(pt.value), date: pt.date, value: pt.value };
          })
          .filter(Boolean) as {
          x: number;
          y: number;
          date: string;
          value: number;
        }[];

      const d = points.map((p) => `${p.x},${p.y}`).join(" ");
      const color = PALETTE[idx % PALETTE.length];
      return { ticker: series.ticker, points, d, color };
    });
  }, [data, allDates]); // xForIndex and yForValue deterministic from same deps

  // Axis ticks (x: dates, y: numeric)
  const xTicks = allDates.map((d, i) => ({ label: d, x: xForIndex(i) }));
  const yTicks = (() => {
    const ticks: number[] = [];
    const approx = 5;
    const range = yMax - yMin;
    if (range <= 0) return [{ value: yMin, y: yForValue(yMin) }];
    for (let i = 0; i <= approx; i++) {
      const v = yMin + (i / approx) * range;
      ticks.push(Number(v.toFixed(2)));
    }
    return ticks.map((v) => ({ value: v, y: yForValue(v) }));
  })();

  // handle hover: find nearest point across all polylines when mouse moves
  const handleSvgMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    let nearest: { dist: number; x: number; y: number; label: string; value: number } | null = null;
    polylines.forEach((pl) =>
      pl.points.forEach((p) => {
        const dx = clientX - p.x;
        const dy = clientY - p.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (!nearest || d < nearest.dist) {
          nearest = {
            dist: d,
            x: p.x,
            y: p.y,
            label: `${pl.ticker} • ${p.date}`,
            value: p.value,
          };
        }
      })
    );

    if (nearest && nearest.dist < 18) {
      setHover({
        x: nearest.x,
        y: nearest.y,
        label: nearest.label,
        value: Number(nearest.value.toFixed(4)),
      });
    } else {
      setHover(null);
    }
  };

  const handleSvgMouseLeave = () => setHover(null);

  return (
    <>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Typography variant="h6">PE Time Series</Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <FormControl size="small">
              <InputLabel id="ticker-select-label">Tickers</InputLabel>
              <Select
                labelId="ticker-select-label"
                multiple
                value={tickers}
                label="Tickers"
                onChange={(e) => {
                  const v = e.target.value as string[];
                  setTickers(v);
                }}
                sx={{ minWidth: 160 }}
              >
                {/* allow user to pick from initial sample + current selection */}
                {Array.from(new Set([...fsTickers, ...tickers])).map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              size="small"
              label="Pricing date"
              type="date"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>

        <Box sx={{ mt: 2 }}>
          {loading && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={20} />
              <Typography variant="body2">Loading series...</Typography>
            </Stack>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && data.length === 0 && (
            <Alert severity="info" sx={{ mt: 1 }}>
              No data to display for selected tickers / date.
            </Alert>
          )}

          {/* Chart container: using Box as SVG (no <div>) */}
          <Box
            component="svg"
            viewBox={`0 0 ${viewWidth} ${viewHeight}`}
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="PE Time Series chart"
            sx={{ width: width, height: height, display: "block", mt: 2 }}
            onMouseMove={handleSvgMouseMove}
            onMouseLeave={handleSvgMouseLeave}
          >
            {/* background */}
            <rect x={0} y={0} width={viewWidth} height={viewHeight} fill="transparent" />

            {/* horizontal grid lines and y axis labels */}
            {yTicks.map((t, i) => (
              <g key={`y-${i}`}>
                <line
                  x1={margin.left}
                  x2={viewWidth - margin.right}
                  y1={t.y}
                  y2={t.y}
                  stroke="#e0e0e0"
                  strokeWidth={1}
                />
                <text
                  x={margin.left - 8}
                  y={t.y + 4}
                  fontSize={11}
                  textAnchor="end"
                  fill="#333"
                >
                  {t.value.toFixed(2)}
                </text>
              </g>
            ))}

            {/* x axis ticks + labels */}
            <line
              x1={margin.left}
              x2={viewWidth - margin.right}
              y1={margin.top + innerHeight}
              y2={margin.top + innerHeight}
              stroke="#333"
              strokeWidth={1}
            />
            {xTicks.map((xt, i) => (
              <g key={`x-${i}`}>
                <line
                  x1={xt.x}
                  x2={xt.x}
                  y1={margin.top + innerHeight}
                  y2={margin.top + innerHeight + 6}
                  stroke="#333"
                  strokeWidth={1}
                />
                <text
                  x={xt.x}
                  y={margin.top + innerHeight + 18}
                  fontSize={10}
                  textAnchor="middle"
                  fill="#333"
                >
                  {xt.label}
                </text>
              </g>
            ))}

            {/* polylines */}
            {polylines.map((pl, idx) => (
              <g key={pl.ticker}>
                <polyline
                  points={pl.d}
                  fill="none"
                  stroke={pl.color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {/* markers */}
                {pl.points.map((p, i) => (
                  <circle
                    key={`${pl.ticker}-pt-${i}`}
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill={pl.color}
                    stroke="#fff"
                    strokeWidth={0.5}
                  />
                ))}
              </g>
            ))}

            {/* hover crosshair & tooltip */}
            {hover && (
              <g>
                <line
                  x1={hover.x}
                  x2={hover.x}
                  y1={margin.top}
                  y2={viewHeight - margin.bottom}
                  stroke="#666"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <rect
                  x={Math.min(hover.x + 8, viewWidth - 140)}
                  y={Math.max(12, hover.y - 36)}
                  width={128}
                  height={36}
                  rx={6}
                  ry={6}
                  fill="#fff"
                  stroke="#ccc"
                  opacity={0.98}
                />
                <text
                  x={Math.min(hover.x + 16, viewWidth - 132)}
                  y={Math.max(28, hover.y - 20)}
                  fontSize={12}
                  fill="#111"
                >
                  {hover.label}
                </text>
                <text
                  x={Math.min(hover.x + 16, viewWidth - 132)}
                  y={Math.max(44, hover.y - 6)}
                  fontSize={12}
                  fill="#111"
                >
                  {hover.value}
                </text>
              </g>
            )}
          </Box>

          {/* Legend */}
          <Stack direction="row" spacing={1} sx={{ mt: 2 }} alignItems="center">
            {polylines.map((pl, i) => (
              <Chip
                key={pl.ticker}
                label={pl.ticker}
                sx={{
                  borderColor: pl.color,
                  color: "text.primary",
                }}
                size="small"
              />
            ))}
          </Stack>
        </Box>
      </Paper>
    </>
  );
}

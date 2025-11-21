import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Card,
} from "@mui/material";

type TimePoint = { date: string; value: number | null };
type TickerSeries = { ticker: string; data: TimePoint[] };
type ApiResponse = { data: TickerSeries[] };

type HoverItem = {
  label: string;
  value: number;
  color: string;
};

type HoverState = {
  x: number;        // inner chart x
  y: number;        // rep y for tooltip anchor
  date: string;
  items: HoverItem[];
};

interface Props {
  apiUrl: string;
  token?: string | null;
  fsTickers?: string[];
  pricingDate?: string;
  height?: number;
  width?: number | "100%";

  ticker?: string;
  data?: any;
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

const getTodayIsoDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().split("T")[0];
};

const formatValue = (v: number) =>
  v.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const FinancialMetricsChartsContent: React.FC<Props> = ({
  apiUrl,
  token,
  fsTickers,
  pricingDate,
  height = 320,
  width = "100%",
}) => {
  const [includeInPdf, setIncludeInPdf] = useState<boolean>(false);
  const [selectedPeers, setSelectedPeers] = useState<string[]>([]); // for compatibility

  const [tickers, setTickers] = useState<string[]>(
    fsTickers && fsTickers.length ? fsTickers : ["AAPL-US", "FANG-US"]
  );
  const [dateInput, setDateInput] = useState<string>(
    pricingDate || getTodayIsoDate()
  );
  const [data, setData] = useState<TickerSeries[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hover, setHover] = useState<HoverState | null>(null);

  const lastFsTickerKey = useRef<string>("");
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!fsTickers || !fsTickers.length) {
      lastFsTickerKey.current = "";
      return;
    }
    const nextKey = fsTickers.join("|");
    if (nextKey !== lastFsTickerKey.current) {
      lastFsTickerKey.current = nextKey;
      setTickers(fsTickers);
    }
  }, [fsTickers]);

  useEffect(() => {
    if (pricingDate) {
      setDateInput(pricingDate);
    }
  }, [pricingDate]);

  // Fetch data
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

  // Build scales – now anchored to 0 so the graph "starts" from the X-axis
  const { allDates, yMin, yMax } = useMemo(() => {
    const datesSet = new Set<string>();
    let dataMin = Number.POSITIVE_INFINITY;
    let dataMax = Number.NEGATIVE_INFINITY;

    data.forEach((series) => {
      series.data.forEach((pt) => {
        datesSet.add(pt.date);
        if (typeof pt.value === "number" && !Number.isNaN(pt.value)) {
          if (pt.value < dataMin) dataMin = pt.value;
          if (pt.value > dataMax) dataMax = pt.value;
        }
      });
    });

    const allDatesArr = Array.from(datesSet).sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    );

    if (!isFinite(dataMin)) {
      // fallback if no numeric data
      return { allDates: allDatesArr, yMin: 0, yMax: 1 };
    }

    let min: number;
    let max: number;

    if (dataMin >= 0 && dataMax >= 0) {
      // all positive -> bottom at 0, some headroom on top
      min = 0;
      max = dataMax * 1.1 || 1;
    } else if (dataMin <= 0 && dataMax <= 0) {
      // all negative -> top at 0, some room below
      max = 0;
      min = dataMin * 1.1;
    } else {
      // crosses zero: symmetric-ish padding
      min = dataMin;
      max = dataMax;
      const pad = (max - min) * 0.08;
      min -= pad;
      max += pad;
    }

    if (min === max) {
      min = min - Math.abs(min * 0.05 || 1);
      max = max + Math.abs(max * 0.05 || 1);
    }

    return { allDates: allDatesArr, yMin: min, yMax: max };
  }, [data]);

  // Geometry
  const viewWidth = 900;
  const viewHeight = 340;
  const margin = { top: 24, right: 24, bottom: 44, left: 70 };
  const innerWidth = viewWidth - margin.left - margin.right;
  const innerHeight = viewHeight - margin.top - margin.bottom;

  const xForIndex = (i: number) => {
    if (allDates.length <= 1) return innerWidth / 2;
    const step = innerWidth / (allDates.length - 1);
    return i * step; // 0 is exactly on the Y-axis (left border)
  };

  const yForValue = (val: number) => {
    const t = (val - yMin) / (yMax - yMin);
    return (1 - t) * innerHeight;
  };

  // Build polylines
  const polylines = useMemo(() => {
    return data.map((series, idx) => {
      const points: { x: number; y: number; date: string; value: number }[] =
        series.data
          .map((pt) => {
            if (typeof pt.value !== "number" || Number.isNaN(pt.value))
              return null;
            const xIndex = allDates.indexOf(pt.date);
            if (xIndex === -1) return null;
            return {
              x: xForIndex(xIndex),
              y: yForValue(pt.value),
              date: pt.date,
              value: pt.value,
            };
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
  }, [data, allDates, yMin, yMax]);

  // Shared-tooltip hover logic (snap to nearest date)
  const handleSvgMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current || allDates.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const svgX = event.clientX - rect.left;
    const svgY = event.clientY - rect.top;
    const innerX = svgX - margin.left;
    const innerY = svgY - margin.top;

    if (innerX < 0 || innerX > innerWidth || innerY < 0 || innerY > innerHeight) {
      setHover(null);
      return;
    }

    const ratio = innerWidth === 0 ? 0 : innerX / innerWidth;
    let idx = Math.round(ratio * (allDates.length - 1));
    if (idx < 0) idx = 0;
    if (idx > allDates.length - 1) idx = allDates.length - 1;

    const date = allDates[idx];
    const x = xForIndex(idx);

    const items: HoverItem[] = [];
    let representativeY = innerHeight / 2;

    polylines.forEach((poly) => {
      const point = poly.points.find((p) => p.date === date);
      if (point) {
        items.push({
          label: poly.ticker,
          value: point.value,
          color: poly.color,
        });
        if (items.length === 1) {
          representativeY = point.y;
        }
      }
    });

    if (items.length === 0) {
      setHover(null);
      return;
    }

    setHover({
      x,
      y: representativeY,
      date,
      items,
    });
  };

  const handleSvgMouseLeave = () => {
    setHover(null);
  };

  // Tooltip screen position
  let tooltipPosition: { top: number; left: number } | null = null;
  if (hover && svgRef.current) {
    const rect = svgRef.current.getBoundingClientRect();
    tooltipPosition = {
      top: rect.top + margin.top + hover.y - 40,
      left: rect.left + margin.left + hover.x + 20,
    };
  }

  const showTooltip = hover && hover.items.length > 0;

  // Y position of 0 (for the main X-axis line), only if 0 in range
  const zeroInRange = 0 >= yMin && 0 <= yMax;
  const zeroY = zeroInRange ? yForValue(0) : null;

  return (
    <Card className={includeInPdf ? "" : "pdf-hidden"}>
      <Box mt={3}>
        <Paper
          elevation={4}
          sx={{
            p: 2.5,
            position: "relative",
          }}
        >
          <Typography variant="h6" align="center" gutterBottom>
            PE Trend Chart
          </Typography>

          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && data.length === 0 && (
            <Typography variant="body2" align="center" sx={{ py: 4 }}>
              No data available.
            </Typography>
          )}

          {!loading && !error && data.length > 0 && (
            <>
              <Box sx={{ width: "100%", overflowX: "auto" }}>
                <svg
                  ref={svgRef}
                  viewBox={`0 0 ${viewWidth} ${viewHeight}`}
                  style={{
                    width: typeof width === "number" ? `${width}px` : width,
                    height,
                  }}
                  onMouseMove={handleSvgMouseMove}
                  onMouseLeave={handleSvgMouseLeave}
                >
                  <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Background + black border */}
                    <rect
                      x={0}
                      y={0}
                      width={innerWidth}
                      height={innerHeight}
                      fill="#ffffff"
                      stroke="black"
                      strokeWidth={1}
                    />

                    {/* Horizontal gridlines + Y labels */}
                    {Array.from({ length: 5 }).map((_, i) => {
                      const t = i / 4;
                      const yVal = yMin + (yMax - yMin) * (1 - t);
                      const y = innerHeight * t;
                      return (
                        <g key={i}>
                          <line
                            x1={0}
                            y1={y}
                            x2={innerWidth}
                            y2={y}
                            stroke="#e3e3e3"
                            strokeWidth={1}
                          />
                          <text
                            x={-10}
                            y={y + 4}
                            fontSize={11}
                            textAnchor="end"
                            fill="#555"
                          >
                            {yVal.toFixed(1)}
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertical gridlines + X labels */}
                    {allDates.map((date, idx) => {
                      const x = xForIndex(idx);
                      const showLabel =
                        allDates.length <= 10 ||
                        idx === 0 ||
                        idx === allDates.length - 1 ||
                        idx % Math.ceil(allDates.length / 8) === 0;
                      return (
                        <g key={date}>
                          <line
                            x1={x}
                            y1={0}
                            x2={x}
                            y2={innerHeight}
                            stroke="#f0f0f0"
                            strokeWidth={1}
                          />
                          {showLabel && (
                            <text
                              x={x}
                              y={innerHeight + 20}
                              fontSize={11}
                              textAnchor="middle"
                              fill="#555"
                            >
                              {date}
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Main X-axis at value 0 */}
                    {zeroInRange && zeroY !== null && (
                      <line
                        x1={0}
                        y1={zeroY}
                        x2={innerWidth}
                        y2={zeroY}
                        stroke="#999"
                        strokeWidth={1.5}
                      />
                    )}

                    {/* Data polylines */}
                    {polylines.map((line) => (
                      <polyline
                        key={line.ticker}
                        points={line.d}
                        fill="none"
                        stroke={line.color}
                        strokeWidth={2}
                      />
                    ))}

                    {/* Crosshair + markers for each series at hover x */}
                    {showTooltip && hover && (
                      <g>
                        <line
                          x1={hover.x}
                          y1={0}
                          x2={hover.x}
                          y2={innerHeight}
                          stroke="#c0c0c0"
                          strokeDasharray="4 4"
                          strokeWidth={1}
                        />
                        {hover.items.map((item) => (
                          <circle
                            key={item.label}
                            cx={hover.x}
                            cy={yForValue(item.value)}
                            r={3.5}
                            fill="#fff"
                            stroke={item.color}
                            strokeWidth={1.5}
                          />
                        ))}
                      </g>
                    )}
                  </g>
                </svg>
              </Box>

              {/* Legend at bottom */}
              <Box
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.2,
                  mt: 2,
                  justifyContent: "center",
                }}
              >
                {polylines.map((line) => (
                  <Box
                    key={line.ticker}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.6,
                      px: 1.4,
                      py: 0.6,
                      borderRadius: 999,
                      border: "1px solid #e0e0e0",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        backgroundColor: line.color,
                      }}
                    />
                    <Typography variant="caption">{line.ticker}</Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {/* Shared tooltip overlay */}
          {showTooltip && hover && tooltipPosition && (
            <Box
              sx={{
                position: "fixed",
                top: tooltipPosition.top,
                left: tooltipPosition.left,
                backgroundColor: "#ffffff",
                padding: "8px 10px",
                borderRadius: "6px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                fontSize: "0.75rem",
                pointerEvents: "none",
                zIndex: 1300,
                minWidth: 180,
              }}
            >
              <Typography
                variant="caption"
                sx={{ display: "block", mb: 0.5, fontWeight: 600 }}
              >
                {hover.date}
              </Typography>
              {hover.items.map((item) => (
                <Box
                  key={item.label}
                  sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}
                >
                  <span style={{ color: item.color, fontWeight: 600 }}>
                    {item.label}
                  </span>
                  <span>{formatValue(item.value)}</span>
                </Box>
              ))}
            </Box>
          )}
        </Paper>
      </Box>
    </Card>
  );
};

export default FinancialMetricsChartsContent;

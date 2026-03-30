import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import {
  ResponsiveContainer,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  Bar,
  Customized,
} from "recharts";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import ScheduleIcon from "@mui/icons-material/Schedule";
import TradingViewWidget from "../Main/InvestmentStrategy/Tradingview/TradingViewWidget";

/* ---------- types ---------- */

interface PriceApiRow {
  fs_ticker: string;
  date: string;
  close_price: number;
  high_price: number;
  low_price: number;
  open_price: number;
}

interface ApiResponse {
  data: PriceApiRow[];
  issue_price: number;
  stop_loss: number;
  one_month_completed?: boolean;
  trading_days_elapsed?: number;
}

interface DealPoint {
  date: string;
  label: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

/* ---------- helpers ---------- */

const formatFullDate = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(d);
};

const formatPrice = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return "-";
  return `$${value.toFixed(2)}`;
};

const formatDateLabelSmart = (
  isoDate: string,
  prevIsoDate?: string
): string => {
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return isoDate;

  const day = String(d.getDate()).padStart(2, "0");
  const mon = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);

  if (!prevIsoDate) return `${day} ${mon}`;

  const p = new Date(prevIsoDate);
  if (Number.isNaN(p.getTime())) return `${day} ${mon}`;

  const monthChanged =
    d.getMonth() !== p.getMonth() || d.getFullYear() !== p.getFullYear();

  return monthChanged ? `${day} ${mon}` : day;
};

/** Custom XAxis tick: shows "D1", "D2", etc. with month marker below on month changes */
const DayTick: React.FC<any> = ({ x, y, payload, allDates }) => {
  const dateStr = payload?.value;
  if (!dateStr) return null;

  const idx = allDates.indexOf(dateStr);
  const dayNum = idx >= 0 ? idx + 1 : 1;

  // Determine if month changed from previous date
  let monthLabel = "";
  if (idx >= 0) {
    const d = new Date(dateStr);
    if (!Number.isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, "0");
      const mon = new Intl.DateTimeFormat("en-US", { month: "short" }).format(d);

      if (idx === 0) {
        // Always show month on first date
        monthLabel = `${day} ${mon}`;
      } else {
        const prevDate = allDates[idx - 1];
        if (prevDate) {
          const p = new Date(prevDate);
          if (
            !Number.isNaN(p.getTime()) &&
            (d.getMonth() !== p.getMonth() || d.getFullYear() !== p.getFullYear())
          ) {
            monthLabel = `${day} ${mon}`;
          }
        }
      }
    }
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        textAnchor="middle"
        dy={12}
        fontSize={10.5}
        fontWeight={600}
        fill="#334155"
      >
        D{dayNum}
      </text>
      {monthLabel && (
        <text
          textAnchor="middle"
          dy={26}
          fontSize={9.5}
          fontWeight={700}
          fill="#6366F1"
        >
          {monthLabel}
        </text>
      )}
    </g>
  );
};

/* ---------- chart sub-components ---------- */

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as DealPoint;

  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.25,
        minWidth: 200,
        borderRadius: 1.5,
        border: "1px solid #E2E8F0",
      }}
    >
      <Typography
        sx={{ mb: 0.5, fontWeight: 700, fontSize: 12.5, color: "#0F172A" }}
      >
        {formatFullDate(point.date)}
      </Typography>
      <Table
        size="small"
        sx={{ "& td": { borderBottom: "none", py: 0.25 } }}
      >
        <TableBody>
          {(["open", "high", "low", "close"] as const).map((key) => (
            <TableRow key={key}>
              <TableCell
                sx={{
                  color: "#64748B",
                  pr: 1,
                  width: 50,
                  textTransform: "capitalize",
                  fontSize: 11.5,
                  fontWeight: 600,
                }}
              >
                {key}
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  textAlign: "right",
                  fontSize: 12,
                  color: "#0F172A",
                }}
              >
                {formatPrice(point[key])}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
};

const Candles: React.FC<any> = (props) => {
  const { xAxisMap, yAxisMap, data } = props;
  if (!xAxisMap || !yAxisMap || !data || !data.length) return null;

  const xKey = Object.keys(xAxisMap)[0];
  const xAxis = xAxisMap[xKey];
  const xScale = xAxis.scale;
  const bandWidth =
    xAxis.bandSize ??
    (typeof xScale.bandwidth === "function" ? xScale.bandwidth() : 10);

  const yAxis = yAxisMap.price || yAxisMap[Object.keys(yAxisMap)[0]];
  const yScale = yAxis.scale;

  return (
    <g>
      {(data as DealPoint[]).map((entry, index) => {
        const { date, open, close, high, low } = entry;
        const xCenter = (xScale(date) ?? 0) + bandWidth / 2;
        const color = close >= open ? "#10B981" : "#EF4444";
        const highY = yScale(high);
        const lowY = yScale(low);
        const openY = yScale(open);
        const closeY = yScale(close);
        const bodyTop = Math.min(openY, closeY);
        const bodyBottom = Math.max(openY, closeY);
        const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
        const bodyWidth = bandWidth * 0.5;

        return (
          <g key={index}>
            <line
              x1={xCenter}
              x2={xCenter}
              y1={highY}
              y2={lowY}
              stroke={color}
              strokeWidth={1.5}
            />
            <rect
              x={xCenter - bodyWidth / 2}
              y={bodyTop}
              width={bodyWidth}
              height={bodyHeight}
              fill={color}
              stroke={color}
              rx={1}
            />
          </g>
        );
      })}
    </g>
  );
};

const OutsideLeftLabel: React.FC<any> = (props) => {
  const { yValue, text, color, yAxisMap, offset, labelYOffset = 0 } = props;
  if (yValue == null || !yAxisMap || !offset) return null;

  const yAxis = yAxisMap.price || yAxisMap[Object.keys(yAxisMap)[0]];
  const y = yAxis.scale(yValue);
  if (y == null) return null;

  return (
    <text
      x={Math.max(6, offset.left - 10)}
      y={y - 4 + labelYOffset}
      textAnchor="end"
      fill={color}
      fontSize={10.5}
      fontWeight={700}
      pointerEvents="none"
    >
      {text}
    </text>
  );
};

const YAxisTopLabel: React.FC<any> = (props) => {
  const { offset } = props;
  if (!offset) return null;

  return (
    <text
      x={Math.max(6, offset.left - 10)}
      y={Math.max(12, offset.top - 6)}
      textAnchor="end"
      fill="#64748B"
      fontSize={11}
      fontWeight={700}
      pointerEvents="none"
    >
      Price
    </text>
  );
};

/* ---------- Upcoming Placeholder ---------- */

const ChartPlaceholder: React.FC<{
  title: string;
  subtitle: string;
  dealStatus?: string;
  expectedDate?: string;
}> = ({ title, subtitle, dealStatus, expectedDate }) => (
  <Box
    sx={{
      borderRadius: 3,
      border: "2px dashed #CBD5E1",
      bgcolor: "#F8FAFC",
      p: 5,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 320,
      textAlign: "center",
    }}
  >
    <ScheduleIcon sx={{ fontSize: 52, color: "#94A3B8", mb: 2.5 }} />
    <Typography
      sx={{ fontWeight: 800, fontSize: 20, color: "#334155", mb: 1 }}
    >
      {title}
    </Typography>
    <Typography
      sx={{
        color: "#64748B",
        fontSize: 14,
        fontWeight: 500,
        maxWidth: 440,
        mb: 2.5,
        lineHeight: 1.6,
      }}
    >
      {subtitle}
    </Typography>
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {dealStatus && (
        <Chip
          label={`Status: ${dealStatus}`}
          size="small"
          sx={{
            bgcolor: "#DBEAFE",
            color: "#1E40AF",
            fontWeight: 700,
            fontSize: 12,
            height: 28,
            borderRadius: 1.5,
          }}
        />
      )}
      {expectedDate && (
        <Chip
          label={`Expected: ${formatFullDate(expectedDate)}`}
          size="small"
          sx={{
            bgcolor: "#F1F5F9",
            color: "#475569",
            fontWeight: 600,
            fontSize: 12,
            height: 28,
            borderRadius: 1.5,
          }}
        />
      )}
    </Box>
  </Box>
);

/* ---------- main component ---------- */

interface Props {
  ticker: string;
  trade_date: string;
  isUpcoming?: boolean;
  dealStatus?: string;
  issuerName?: string;
  expectedDate?: string;
  region?: string | null;
}

const PriceChartsSection: React.FC<Props> = ({
  ticker,
  trade_date,
  isUpcoming,
  dealStatus,
  issuerName,
  expectedDate,
  region,
}) => {
  const [chartData, setChartData] = useState<DealPoint[]>([]);
  const [issuePrice, setIssuePrice] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [oneMonthCompleted, setOneMonthCompleted] = useState(false);
  const [tradingDaysElapsed, setTradingDaysElapsed] = useState(0);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    setChartData([]);
    setIssuePrice(null);
    setStopLoss(null);
    setError(null);
    setOneMonthCompleted(false);
    setTradingDaysElapsed(0);

    if (!ticker || !trade_date || !apiUrl || isUpcoming) return;

    const fetchPrices = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${apiUrl}/api/fs_price_timeseries/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ ticker, trade_date }),
        });

        if (!res.ok) {
          if (res.status === 404) {
            let msg = "No price data available for this ticker.";
            try {
              const errJson = await res.json();
              if (typeof errJson?.error === "string") msg = errJson.error;
            } catch {}
            throw new Error(msg);
          }
          throw new Error(`Request failed with status ${res.status}`);
        }

        const json: ApiResponse = await res.json();

        const raw = (json.data || [])
          .map((row) => ({
            date: row.date,
            open: Number(row.open_price),
            close: Number(row.close_price),
            high: Number(row.high_price),
            low: Number(row.low_price),
          }))
          .filter(
            (row) =>
              row.open !== 0 || row.close !== 0 || row.high !== 0 || row.low !== 0
          );

        raw.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const processed: DealPoint[] = raw.map((row, idx) => ({
          ...row,
          label: formatDateLabelSmart(
            row.date,
            idx > 0 ? raw[idx - 1].date : undefined
          ),
        }));

        setChartData(processed);
        setIssuePrice(
          json.issue_price != null ? Number(json.issue_price) : null
        );
        setStopLoss(json.stop_loss != null ? Number(json.stop_loss) : null);
        setOneMonthCompleted(json.one_month_completed ?? false);
        setTradingDaysElapsed(json.trading_days_elapsed ?? 0);
      } catch (err: any) {
        setError(err.message || "Failed to fetch price data");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [apiUrl, token, ticker, trade_date, isUpcoming]);

  // Build ordered date list for smart tick formatting
  const allDates = useMemo(() => chartData.map((d) => d.date), [chartData]);

  const { yMin, yMax } = useMemo(() => {
    if (!chartData.length)
      return { yMin: 0, yMax: "auto" as number | "auto" };

    const prices: number[] = chartData.flatMap((d) => [
      d.open,
      d.high,
      d.low,
      d.close,
    ]);
    if (issuePrice != null) prices.push(issuePrice);
    if (stopLoss != null) prices.push(stopLoss);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const spread = max - min || 1;

    return {
      yMin: Math.floor(min - spread * 0.05),
      yMax: Math.ceil(max + spread * 0.05),
    };
  }, [chartData, issuePrice, stopLoss]);

  const stopLossOffset = useMemo(() => {
    if (issuePrice == null || stopLoss == null) return 0;
    if (Math.abs(issuePrice - stopLoss) > 1e-6) return 0;
    const spread =
      typeof yMax === "number" && typeof yMin === "number"
        ? yMax - yMin
        : 0;
    return spread ? spread * 0.01 : 0.05;
  }, [issuePrice, stopLoss, yMin, yMax]);

  const issueLineValue = issuePrice != null ? issuePrice : undefined;
  const stopLossLineValue =
    stopLoss != null ? stopLoss - stopLossOffset : undefined;

  const cleanedTicker = ticker?.replace(/\s+US$/i, "") || ticker;
  const normalizedRegion = (region || "").trim().toUpperCase();
  const showLiveTradingChart =
    normalizedRegion !== "EMEA" && normalizedRegion !== "APAC";

  /* ── Upcoming deals: show placeholders ── */
  if (isUpcoming) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {/* FactSet placeholder */}
        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
          }}
        >
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              px: 3,
              py: 2,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <ShowChartIcon sx={{ color: "#38BDF8", fontSize: 22 }} />
            <Box>
              <Typography
                sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: 15 }}
              >
                FactSet Time Series & AI/ML Signals
              </Typography>
              <Typography
                sx={{
                  color: "#94A3B8",
                  fontSize: 12,
                  fontWeight: 500,
                  mt: 0.25,
                }}
              >
                Post-IPO price action with buy/sell signals from proprietary
                models
              </Typography>
            </Box>
          </Box>
          <ChartPlaceholder
            title="Chart Available Once Listed"
            subtitle={`The price timeseries chart for ${issuerName || ticker} will appear here once the ticker begins trading.`}
            dealStatus={dealStatus}
            expectedDate={expectedDate}
          />
        </Box>

        {showLiveTradingChart && (
          <Box
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              border: "1px solid #E2E8F0",
            }}
          >
            <Box
              sx={{
                background:
                  "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                px: 3,
                py: 2,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
              >
                <CandlestickChartIcon
                  sx={{ color: "#38BDF8", fontSize: 22 }}
                />
                <Typography
                  sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: 15 }}
                >
                  Live Trading Chart
                </Typography>
              </Box>
              <Chip
                label={dealStatus || "Price Range"}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.1)",
                  color: "#94A3B8",
                  fontWeight: 700,
                  fontSize: 11,
                  height: 24,
                  border: "1px solid rgba(255,255,255,0.15)",
                }}
              />
            </Box>
            <ChartPlaceholder
              title="Chart Available Once Listed"
              subtitle={`The live trading chart for ${issuerName || ticker} will appear here once the ticker begins trading.`}
              dealStatus={dealStatus}
              expectedDate={expectedDate}
            />
          </Box>
        )}
      </Box>
    );
  }

  /* ── Listed deals: show actual charts ── */
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* ── FactSet Candlestick Chart ── */}
      <Box
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #E2E8F0",
          bgcolor: "#FFFFFF",
        }}
      >
        {/* Dark header */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            px: 3,
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <ShowChartIcon sx={{ color: "#38BDF8", fontSize: 22 }} />
              <Typography
                sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: 15 }}
              >
                FactSet Time Series & AI/ML Signals
              </Typography>
            </Box>
            <Typography
              sx={{
                color: "#94A3B8",
                fontSize: 12,
                fontWeight: 500,
                mt: 0.5,
                ml: 4.5,
              }}
            >
              Post-IPO price action with buy/sell signals from proprietary
              models
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Trading duration badge */}
            {oneMonthCompleted && (
              <Box
                sx={{
                  bgcolor: "rgba(251, 191, 36, 0.12)",
                  border: "1px solid rgba(251, 191, 36, 0.3)",
                  borderRadius: 2,
                  px: 1.5,
                  py: 0.75,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    color: "#FCD34D",
                    fontSize: 9.5,
                    fontWeight: 700,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                  }}
                >
                  Trading Duration
                </Typography>
                <Typography
                  sx={{ color: "#FBBF24", fontSize: 13, fontWeight: 800 }}
                >
                  {tradingDaysElapsed} Days
                </Typography>
              </Box>
            )}

            {/* T+1M Prediction badge */}
            <Box
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.12)",
                border: "1px solid rgba(16, 185, 129, 0.25)",
                borderRadius: 2,
                px: 1.5,
                py: 0.75,
                textAlign: "right",
                minWidth: 100,
              }}
            >
              <Typography
                sx={{
                  color: "#6EE7B7",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                }}
              >
                T+1M Prediction
              </Typography>
              <Typography
                sx={{ color: "#10B981", fontSize: 13, fontWeight: 800 }}
              >
                Positive
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Chart body */}
        <Box sx={{ p: 2 }}>
          {loading && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
              }}
            >
              <CircularProgress size={28} sx={{ color: "#64748B" }} />
            </Box>
          )}

          {!loading && error && (
            <Alert
              sx={{ mt: 1, borderRadius: 1.5, fontSize: 12.5 }}
              severity="info"
            >
              {error}
            </Alert>
          )}

          {!loading && !error && chartData.length > 0 && (
            <>
              <Box
                sx={{
                  height: 420,
                  overflowX: chartData.length > 25 ? "auto" : "hidden",
                  overflowY: "hidden",
                  "&::-webkit-scrollbar": { height: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: "#CBD5E1",
                    borderRadius: 3,
                  },
                }}
              >
                <Box
                  sx={{
                    minWidth: chartData.length > 25
                      ? `${Math.max(chartData.length * 32, 900)}px`
                      : "100%",
                    height: "100%",
                  }}
                >
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 18, right: 30, bottom: 20, left: 50 }}
                    style={{ overflow: "visible" }}
                  >
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={{ stroke: "#E2E8F0" }}
                      interval={chartData.length > 60 ? Math.floor(chartData.length / 30) : 0}
                      height={50}
                      tick={<DayTick allDates={allDates} />}
                    />
                    <YAxis
                      yAxisId="price"
                      domain={[yMin, yMax]}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#000000" }}
                      axisLine={{ stroke: "#E2E8F0" }}
                    />

                    <Customized component={<YAxisTopLabel />} />

                    <Bar
                      dataKey="close"
                      yAxisId="price"
                      fill="transparent"
                      barSize={1}
                      legendType="none"
                      name="close"
                    />

                    <Tooltip content={<CustomTooltip />} />
                    <Customized component={<Candles />} />

                    {/* Reference lines */}
                    {issuePrice != null && (
                      <ReferenceLine
                        y={issueLineValue}
                        yAxisId="price"
                        stroke="#3B82F6"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                      />
                    )}
                    {stopLoss != null && (
                      <ReferenceLine
                        y={stopLossLineValue}
                        yAxisId="price"
                        stroke="#EF4444"
                        strokeWidth={1.5}
                        strokeDasharray="6 4"
                      />
                    )}

                    {/* Labels */}
                    {issuePrice != null && (
                      <Customized
                        component={
                          <OutsideLeftLabel
                            yValue={issueLineValue}
                            text={`IPO $${issuePrice.toFixed(2)}`}
                            color="#3B82F6"
                            labelYOffset={-2}
                          />
                        }
                      />
                    )}
                    {stopLoss != null && (
                      <Customized
                        component={
                          <OutsideLeftLabel
                            yValue={stopLossLineValue}
                            text={`Stop $${stopLoss.toFixed(2)}`}
                            color="#EF4444"
                            labelYOffset={12}
                          />
                        }
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
                </Box>
              </Box>

              {/* Legend */}
              <Box
                sx={{
                  mt: 1,
                  display: "flex",
                  flexWrap: "wrap",
                  justifyContent: "center",
                  gap: 3,
                  alignItems: "center",
                  py: 1,
                  borderTop: "1px solid #F1F5F9",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "#10B981",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    Bullish candle
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: "#EF4444",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    Bearish candle
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 0,
                      borderTop: "2px dashed #3B82F6",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    IPO Price
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 18,
                      height: 0,
                      borderTop: "2px dashed #EF4444",
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "#64748B",
                      fontWeight: 600,
                    }}
                  >
                    Stop Loss
                  </Typography>
                </Box>
              </Box>
            </>
          )}

          {!loading && !error && chartData.length === 0 && (
            <Alert
              sx={{ mt: 1, borderRadius: 1.5, fontSize: 12.5 }}
              severity="info"
            >
              No price data available.
            </Alert>
          )}
        </Box>
      </Box>

      {/* ── TradingView Widget ── */}
      {ticker && showLiveTradingChart && (
        <Box
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            bgcolor: "#131722",
          }}
        >
          {/* Dark header */}
          <Box
            sx={{
              background:
                "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
              px: 3,
              py: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <CandlestickChartIcon
                sx={{ color: "#38BDF8", fontSize: 22 }}
              />
              <Typography
                sx={{ color: "#FFFFFF", fontWeight: 800, fontSize: 15 }}
              >
                Live Trading Chart
              </Typography>
              <Chip
                label={`NASDAQ:${cleanedTicker}`}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.08)",
                  color: "#94A3B8",
                  fontWeight: 600,
                  fontSize: 11,
                  height: 22,
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              />
            </Box>
            <Chip
              label="LIVE"
              size="small"
              sx={{
                bgcolor: "#DC2626",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: 10,
                height: 22,
                letterSpacing: 0.5,
              }}
            />
          </Box>

          <TradingViewWidget ticker={ticker} />
        </Box>
      )}
    </Box>
  );
};

export default PriceChartsSection;

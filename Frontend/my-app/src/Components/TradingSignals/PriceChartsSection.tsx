import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Divider,
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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

/* ---------- chart sub-components ---------- */

const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const point = payload[0].payload as DealPoint;

  return (
    <Paper
      elevation={4}
      sx={{ p: 1.25, minWidth: 200, borderRadius: 1.5, border: "1px solid #E2E8F0" }}
    >
      <Typography sx={{ mb: 0.5, fontWeight: 700, fontSize: 12.5, color: "#0F172A" }}>
        {formatFullDate(point.date)}
      </Typography>
      <Table size="small" sx={{ "& td": { borderBottom: "none", py: 0.25 } }}>
        <TableBody>
          {(["open", "high", "low", "close"] as const).map((key) => (
            <TableRow key={key}>
              <TableCell
                sx={{ color: "#64748B", pr: 1, width: 50, textTransform: "capitalize", fontSize: 11.5, fontWeight: 600 }}
              >
                {key}
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textAlign: "right", fontSize: 12, color: "#0F172A" }}>
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
        const { label, open, close, high, low } = entry;
        const xCenter = (xScale(label) ?? 0) + bandWidth / 2;
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
              strokeWidth={1}
            />
            <rect
              x={xCenter - bodyWidth / 2}
              y={bodyTop}
              width={bodyWidth}
              height={bodyHeight}
              fill={color}
              stroke={color}
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

/* ---------- main component ---------- */

interface Props {
  ticker: string;
  trade_date: string;
}

const PriceChartsSection: React.FC<Props> = ({ ticker, trade_date }) => {
  const [chartData, setChartData] = useState<DealPoint[]>([]);
  const [issuePrice, setIssuePrice] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    setChartData([]);
    setIssuePrice(null);
    setStopLoss(null);
    setError(null);

    if (!ticker || !trade_date || !apiUrl) return;

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

        const raw = (json.data || []).map((row) => ({
          date: row.date,
          open: Number(row.open_price),
          close: Number(row.close_price),
          high: Number(row.high_price),
          low: Number(row.low_price),
        }));

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
      } catch (err: any) {
        setError(err.message || "Failed to fetch price data");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [apiUrl, token, ticker, trade_date]);

  const { yMin, yMax } = useMemo(() => {
    if (!chartData.length) return { yMin: 0, yMax: "auto" as number | "auto" };

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
      typeof yMax === "number" && typeof yMin === "number" ? yMax - yMin : 0;
    return spread ? spread * 0.01 : 0.05;
  }, [issuePrice, stopLoss, yMin, yMax]);

  const issueLineValue = issuePrice != null ? issuePrice : undefined;
  const stopLossLineValue =
    stopLoss != null ? stopLoss - stopLossOffset : undefined;

  return (
    <Box>
      {/* ── FactSet Candlestick Chart ── */}
      <Box
        sx={{
          borderRadius: 2,
          bgcolor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          p: 2,
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 3,
            height: "100%",
            bgcolor: "#3B82F6",
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <ShowChartIcon sx={{ color: "#3B82F6", fontSize: 20 }} />
          <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>
            {ticker} - Deal Price Timeseries
          </Typography>
        </Box>

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
          <Alert sx={{ mt: 1, borderRadius: 1.5, fontSize: 12.5 }} severity="info">
            {error}
          </Alert>
        )}

        {!loading && !error && chartData.length > 0 && (
          <>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 18, right: 30, bottom: 20, left: 50 }}
                  style={{ overflow: "visible" }}
                >
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    tickLine={false}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    yAxisId="price"
                    domain={[yMin, yMax]}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />

                  <Customized component={<YAxisTopLabel />} />

                  <Bar
                    dataKey="close"
                    yAxisId="price"
                    fill="transparent"
                    barSize={1}
                    legendType="none"
                  />

                  <Tooltip content={<CustomTooltip />} />
                  <Customized component={<Candles />} />

                  {/* Reference lines */}
                  {issuePrice != null && (
                    <ReferenceLine
                      y={issueLineValue}
                      yAxisId="price"
                      stroke="#475569"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  )}
                  {stopLoss != null && (
                    <ReferenceLine
                      y={stopLossLineValue}
                      yAxisId="price"
                      stroke="#DC2626"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  )}

                  {/* Labels */}
                  {issuePrice != null && (
                    <Customized
                      component={
                        <OutsideLeftLabel
                          yValue={issueLineValue}
                          text={`Issue = ${issuePrice.toFixed(2)}`}
                          color="#475569"
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
                          text={`Stop = ${stopLoss.toFixed(2)}`}
                          color="#DC2626"
                          labelYOffset={12}
                        />
                      }
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend */}
            <Box
              sx={{
                mt: 1.5,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 2.5,
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 0,
                    borderTop: "2px dashed #475569",
                  }}
                />
                <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                  Issue Price
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 16,
                    height: 0,
                    borderTop: "2px dashed #DC2626",
                  }}
                />
                <Typography sx={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                  Stop Loss
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <InfoOutlinedIcon sx={{ fontSize: 13, color: "#94A3B8" }} />
                <Typography sx={{ fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>
                  Trade date to 30 trading days
                </Typography>
              </Box>
            </Box>
          </>
        )}

        {!loading && !error && chartData.length === 0 && (
          <Alert sx={{ mt: 1, borderRadius: 1.5, fontSize: 12.5 }} severity="info">
            No price data available.
          </Alert>
        )}
      </Box>

      {/* ── TradingView Widget ── */}
      {ticker && (
        <Box
          sx={{
            borderRadius: 2,
            bgcolor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: 3,
              height: "100%",
              bgcolor: "#6366F1",
              zIndex: 1,
            }}
          />
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 13, color: "#0F172A" }}>
              {ticker} - TradingView Chart
            </Typography>
          </Box>
          <Divider sx={{ borderColor: "#F1F5F9" }} />
          <TradingViewWidget ticker={ticker} />
        </Box>
      )}
    </Box>
  );
};

export default PriceChartsSection;

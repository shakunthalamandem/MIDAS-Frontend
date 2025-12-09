// src/Components/AIMLResults/DealPricesChart.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
  Container,
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TradingViewWidget from "../Main/InvestmentStrategy/Tradingview/TradingViewWidget";

// 🔽 adjust this path if needed

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

// minimal shape we need for the selected deal
export interface DealForChart {
  ticker: string;
  pricing_date: string;
}

/**
 * Props:
 * - You can EITHER pass `deal` OR pass `ticker` + `pricing_date`.
 */
export interface DealPricesChartProps {
  deal?: DealForChart | null;
  ticker?: string;
  pricing_date?: string;
}

/* ---------- Helpers ---------- */

const formatDateLabel = (value: string): string => {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(d);
};

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

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload as DealPoint;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {formatFullDate(point.date || label)}
      </Typography>
      <Typography variant="body2">Open: {formatPrice(point.open)}</Typography>
      <Typography variant="body2">High: {formatPrice(point.high)}</Typography>
      <Typography variant="body2">Low: {formatPrice(point.low)}</Typography>
      <Typography variant="body2">Close: {formatPrice(point.close)}</Typography>
    </Paper>
  );
};

/**
 * Candlesticks using <Customized>.
 * Each candle is centered on the X-axis tick (vertical grid line).
 */
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

  const candles: DealPoint[] = data;

  return (
    <g>
      {candles.map((entry, index) => {
        const { label, open, close, high, low } = entry;

        // Center of band: left edge + bandWidth / 2
        const xCenter = (xScale(label) ?? 0) + bandWidth / 2;

        const color = close >= open ? "#008000" : "#CC0000";

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
            {/* Wick */}
            <line
              x1={xCenter}
              x2={xCenter}
              y1={highY}
              y2={lowY}
              stroke={color}
              strokeWidth={1}
            />
            {/* Body */}
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

/**
 * Label for a horizontal line:
 * - Y is on the line
 * - X is at the right edge *inside* the chart
 */
const HorizontalLineLabel: React.FC<any> = (props) => {
  const {
    yValue,
    text,
    color,
    yAxisMap,
    offset,
    labelYOffset = 0,
    labelXOffset = 0,
  } = props;
  if (yValue == null || !yAxisMap || !offset) return null;

  const yAxis = yAxisMap.price || yAxisMap[Object.keys(yAxisMap)[0]];
  const yScale = yAxis.scale;

  const y = yScale(yValue); // same coordinates as ReferenceLine
  if (y == null) return null;
  const xRight = offset.left + offset.width;
  const yPos = y - 6 + labelYOffset; // lift label off the line for readability
  const xPos = xRight - 4 + labelXOffset;

  return (
    <text
      x={xPos}
      y={yPos}
      textAnchor="end"
      fill={color}
      stroke="white"
      strokeWidth={2}
      paintOrder="stroke"
      fontSize={11}
      fontWeight={600}
      pointerEvents="none"
    >
      {text}
    </text>
  );
};

/* ---------- Main Component ---------- */

const DealPricesChart: React.FC<DealPricesChartProps> = ({
  deal,
  ticker: tickerProp,
  pricing_date: pricingDateProp,
}) => {
  const [chartData, setChartData] = useState<DealPoint[]>([]);
  const [issuePrice, setIssuePrice] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // unified source of truth for ticker / pricing_date
  const ticker = deal?.ticker || tickerProp || "";
  const pricingDate = deal?.pricing_date || pricingDateProp || "";
  const hasSelection = !!ticker && !!pricingDate;

  useEffect(() => {
    // reset state whenever selection changes
    setChartData([]);
    setIssuePrice(null);
    setStopLoss(null);
    setError(null);

    if (!hasSelection) {
      return;
    }

    if (!apiUrl) {
      setError("API URL is not configured");
      return;
    }

    const fetchPrices = async () => {
      try {
        setLoading(true);

        const res = await fetch(`${apiUrl}/api/fs_price_timeseries/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({
            ticker,
            pricing_date: pricingDate,
          }),
        });

        if (!res.ok) {
          // Special-case 404 into a friendly message
          if (res.status === 404) {
            let msg = "No data available for this ticker.";
            try {
              const errJson = await res.json();
              if (typeof errJson?.error === "string") msg = errJson.error;
            } catch {
              // ignore parse error, keep default message
            }
            throw new Error(msg);
          }

          throw new Error(`Request failed with status ${res.status}`);
        }

        const json: ApiResponse = await res.json();

        const processed: DealPoint[] = (json.data || []).map(
          (row: PriceApiRow) => ({
            date: row.date,
            label: formatDateLabel(row.date),
            open: Number(row.open_price),
            close: Number(row.close_price),
            high: Number(row.high_price),
            low: Number(row.low_price),
          })
        );

        setChartData(processed);
        setIssuePrice(Number(json.issue_price));
        setStopLoss(Number(json.stop_loss));
      } catch (err: any) {
        setError(err.message || "Failed to fetch price data");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [apiUrl, token, ticker, pricingDate, hasSelection]);

  const { yMin, yMax } = useMemo(() => {
    if (!chartData.length) {
      return {
        yMin: 0,
        yMax: "auto" as number | "auto",
      };
    }

    const prices: number[] = chartData.flatMap((d) => [
      d.open,
      d.high,
      d.low,
      d.close,
    ]);
    if (issuePrice != null) prices.push(issuePrice);
    if (stopLoss != null) prices.push(stopLoss);

    let min = Math.min(...prices);
    let max = Math.max(...prices);
    const spread = max - min || 1;

    const paddedMin = Math.floor(min - spread * 0.05);
    const paddedMax = Math.ceil(max + spread * 0.05);

    return {
      yMin: paddedMin,
      yMax: paddedMax,
    };
  }, [chartData, issuePrice, stopLoss]);

  const stopLossOffset = useMemo(() => {
    if (issuePrice == null || stopLoss == null) return 0;
    if (Math.abs(issuePrice - stopLoss) > 1e-6) return 0;
    const spread =
      typeof yMax === "number" && typeof yMin === "number" ? yMax - yMin : 0;
    const offset = spread ? spread * 0.01 : 0.05;
    return offset || 0.05;
  }, [issuePrice, stopLoss, yMin, yMax]);

  const issueLineValue: number | undefined =
    issuePrice != null ? issuePrice : undefined;
  // Keep stop loss visually below issue price when they are equal
  const stopLossLineValue: number | undefined =
    stopLoss != null ? stopLoss - stopLossOffset : undefined;

  // If nothing selected yet, show helper message
  if (!hasSelection) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Deal Price Timeseries
          </Typography>
          <Alert severity="info">Select a deal to view its price chart.</Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography
          variant="h6"
          gutterBottom
          textAlign={"center"}
          color="#002060"
          fontWeight={"bold"}
        >
          {ticker} – Deal Price Timeseries
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          mb={1}
          sx={{ gap: 1 }}
        />

        {loading && (
          <Box
            mt={3}
            display="flex"
            justifyContent="center"
            alignItems="center"
            height={260}
          >
            <CircularProgress />
          </Box>
        )}

        {!loading && error && (
          <Alert sx={{ mt: 3 }} severity="info">
            {error}
          </Alert>
        )}

        {!loading && !error && chartData.length > 0 && (
          <>
            <Box sx={{ mt: 3, height: 420 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 10, right: 70, bottom: 20, left: 50 }}
                >
                  <XAxis dataKey="label" />
                  <YAxis
                    yAxisId="price"
                    domain={[yMin, yMax]}
                    tickLine={false}
                    label={{
                      value: "Price",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />

                  {/* Hidden series so tooltip works */}
                  <Bar
                    dataKey="close"
                    yAxisId="price"
                    fill="transparent"
                    barSize={1}
                    legendType="none"
                  />

                  <Tooltip content={<CustomTooltip />} />

                  {/* Candlesticks */}
                  <Customized component={<Candles />} />

                  {/* Horizontal reference lines */}
                  {issuePrice != null && (
                    <ReferenceLine
                      y={issueLineValue}
                      yAxisId="price"
                      stroke="#5B3310"
                      strokeWidth={2.25}
                      strokeDasharray="3 3"
                    />
                  )}
                  {stopLoss != null && (
                    <ReferenceLine
                      y={stopLossLineValue}
                      yAxisId="price"
                      stroke="#B00020"
                      strokeWidth={2.25}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Labels on those lines */}
                  {issuePrice != null && (
                    <Customized
                      component={
                        <HorizontalLineLabel
                          yValue={issueLineValue}
                          text={`Issue Price = ${issuePrice.toFixed(2)}`}
                          color="#000000"
                          labelYOffset={-6}
                          labelXOffset={-6}
                        />
                      }
                    />
                  )}
                  {stopLoss != null && (
                    <Customized
                      component={
                        <HorizontalLineLabel
                          yValue={stopLossLineValue}
                          text={`Stop Loss = ${stopLoss.toFixed(2)}`}
                          color="#B00020"
                          labelYOffset={10}
                          labelXOffset={-6}
                        />
                      }
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>

            {/* Line legend + info note */}
            <Box
              mt={2}
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              gap={2}
            >
              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: "3px dashed #000000",
                    mr: 0.5,
                  }}
                />
                Issue Price
              </Typography>

              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: "2px dashed #B00020",
                    mr: 0.5,
                  }}
                />
                Stop Loss
              </Typography>

              <Box display="flex" alignItems="center" mt={0.5}>
                <InfoOutlinedIcon
                  fontSize="small"
                  sx={{ color: "grey.500", mr: 0.5 }}
                />
                <Typography variant="caption" color="text.secondary">
                  Data is from pricing date to one week
                </Typography>
              </Box>
            </Box>

            {/* 🔽 TradingView widget below the chart, using same ticker */}
            {ticker && (
              <Box mt={4}>
                <TradingViewWidget ticker={ticker} />
              </Box>
            )}
          </>
        )}

        {!loading && !error && chartData.length === 0 && (
          <Alert sx={{ mt: 3 }} severity="info">
            No price data available.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default DealPricesChart;

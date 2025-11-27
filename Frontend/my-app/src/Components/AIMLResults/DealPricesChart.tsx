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
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Bar,
  Customized,
  Legend,
} from "recharts";

type TPredictionPolarity = "positive" | "negative" | null;

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
  t1w_pred: string;
  t1d_openprice_pred: string;
  t1m_pred: string;
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
 * - `DealsPredictionsTable` uses `deal`.
 * - Existing code (AIMLResultsHome) can keep using `ticker` / `pricing_date`.
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

const getPolarityFromText = (text?: string): TPredictionPolarity => {
  if (!text) return null;
  const lower = text.toLowerCase();
  if (lower.includes("positive")) return "positive";
  if (lower.includes("negative")) return "negative";
  return null;
};

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload as DealPoint;

  return (
    <Paper sx={{ p: 1.5 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {formatDateLabel(label)}
      </Typography>
      <Typography variant="body2">Open: {point.open}</Typography>
      <Typography variant="body2">High: {point.high}</Typography>
      <Typography variant="body2">Low: {point.low}</Typography>
      <Typography variant="body2">Close: {point.close}</Typography>
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
  const { yValue, text, color, yAxisMap, offset } = props;
  if (yValue == null || !yAxisMap || !offset) return null;

  const yAxis = yAxisMap.price || yAxisMap[Object.keys(yAxisMap)[0]];
  const yScale = yAxis.scale;

  const y = yScale(yValue); // same coordinates as ReferenceLine
  const xRight = offset.left + offset.width;

  return (
    <text
      x={xRight - 4}
      y={y - 3}
      textAnchor="end"
      fill={color}
      fontSize={11}
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
  const [t1mPolarity, setT1mPolarity] = useState<TPredictionPolarity>(null);
  const [t1wPred, setT1wPred] = useState<string | null>(null);
  const [t1dOpenPred, setT1dOpenPred] = useState<string | null>(null);
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
    setT1mPolarity(null);
    setT1wPred(null);
    setT1dOpenPred(null);
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
        setT1mPolarity(getPolarityFromText(json.t1m_pred));
        setT1wPred(json.t1w_pred || null);
        setT1dOpenPred(json.t1d_openprice_pred || null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch price data");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [apiUrl, token, ticker, pricingDate, hasSelection]);

  const { yMin, yMax, t1mLineValue, t1mLabel } = useMemo(() => {
    if (!chartData.length) {
      return {
        yMin: 0,
        yMax: "auto" as number | "auto",
        t1mLineValue: null as number | null,
        t1mLabel: "",
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

    let lineValue: number | null = null;
    let label = "";

    if (t1mPolarity === "positive") {
      max += spread * 0.2;
      lineValue = max - spread * 0.03;
      label = "T+1M (Positive)";
    } else if (t1mPolarity === "negative") {
      min -= spread * 0.2;
      lineValue = min + spread * 0.03;
      label = "T+1M (Negative)";
    }

    const paddedMin = Math.floor(min - spread * 0.05);
    const paddedMax = Math.ceil(max + spread * 0.05);

    return {
      yMin: paddedMin,
      yMax: paddedMax,
      t1mLineValue: lineValue,
      t1mLabel: label,
    };
  }, [chartData, issuePrice, stopLoss, t1mPolarity]);

  // If nothing selected yet, show helper message
  if (!hasSelection) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom color="#002060">
  <strong>Deal Price Timeseries</strong>
</Typography>


          <Alert severity="info">
            Select a deal to view its price chart.
          </Alert>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {ticker} – Deal Price Timeseries
        </Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          justifyContent="space-between"
          mb={1}
          sx={{ gap: 1 }}
        >
          <Typography variant="body2" color="text.secondary">
            Candlesticks show Open–High–Low–Close per day.
          </Typography>
          <Box display="flex" gap={2}>
            {t1dOpenPred && (
              <Typography variant="body2" color="error">
                T+1D (from Open): {t1dOpenPred}
              </Typography>
            )}
            {t1wPred && (
              <Typography
                variant="body2"
                color={
                  getPolarityFromText(t1wPred) === "positive"
                    ? "success.main"
                    : "error.main"
                }
              >
                T+1W: {t1wPred}
              </Typography>
            )}
            {t1mPolarity && (
              <Typography
                variant="body2"
                color={t1mPolarity === "positive" ? "success.main" : "error.main"}
              >
                T+1M: {t1mPolarity === "positive" ? "Positive" : "Negative"}
              </Typography>
            )}
          </Box>
        </Box>

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
          <Alert sx={{ mt: 3 }} severity="error">
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
                  <CartesianGrid
                    stroke="#d3d3d3"
                    strokeDasharray="3 3"
                    vertical
                    horizontal
                  />

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
                  <Legend />

                  {/* Candlesticks */}
                  <Customized component={<Candles />} />

                  {/* Horizontal reference lines */}
                  {issuePrice != null && (
                    <ReferenceLine
                      y={issuePrice}
                      yAxisId="price"
                      stroke="#5B3310"
                      strokeWidth={1.3}
                      strokeDasharray="3 3"
                    />
                  )}
                  {stopLoss != null && (
                    <ReferenceLine
                      y={stopLoss}
                      yAxisId="price"
                      stroke="#B00020"
                      strokeWidth={1.3}
                      strokeDasharray="3 3"
                    />
                  )}
                  {t1mLineValue != null && (
                    <ReferenceLine
                      y={t1mLineValue}
                      yAxisId="price"
                      stroke="#C56800"
                      strokeWidth={1.3}
                      strokeDasharray="3 3"
                    />
                  )}

                  {/* Labels on those lines */}
                  {issuePrice != null && (
                    <Customized
                      component={
                        <HorizontalLineLabel
                          yValue={issuePrice}
                          text={`Issue Price = ${issuePrice.toFixed(2)}`}
                          color="#5B3310"
                        />
                      }
                    />
                  )}
                  {stopLoss != null && (
                    <Customized
                      component={
                        <HorizontalLineLabel
                          yValue={stopLoss}
                          text={`Stop Loss = ${stopLoss.toFixed(2)}`}
                          color="#B00020"
                        />
                      }
                    />
                  )}
                  {t1mLineValue != null && t1mLabel && (
                    <Customized
                      component={
                        <HorizontalLineLabel
                          yValue={t1mLineValue}
                          text={t1mLabel}
                          color="#C56800"
                        />
                      }
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>

            {/* Colour legend */}
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
                    width: 12,
                    height: 12,
                    bgcolor: "#008000",
                    mr: 0.5,
                  }}
                />
                Green candle: Close ≥ Open
              </Typography>

              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 12,
                    height: 12,
                    bgcolor: "#CC0000",
                    mr: 0.5,
                  }}
                />
                Red candle: Close &lt; Open
              </Typography>

              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: "2px dashed #5B3310",
                    mr: 0.5,
                  }}
                />
                Brown dashed: Issue Price
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
                Red dashed: Stop Loss
              </Typography>

              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: "2px dashed #C56800",
                    mr: 0.5,
                  }}
                />
                Orange dashed: T+1M Indicator
              </Typography>
            </Box>
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

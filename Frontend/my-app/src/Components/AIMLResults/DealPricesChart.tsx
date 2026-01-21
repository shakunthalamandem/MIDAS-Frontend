// src/Components/AIMLResults/DealPricesChart.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Typography,
  Container,
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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TradingViewWidget from "../Main/InvestmentStrategy/Tradingview/TradingViewWidget";

import {
  PredictionMarkerResolved,
  markerColor,
  markerTooltipText,
  clampIndex,
} from "./predictionUtils";
import { PredictionBadges } from "./PredictionBadges";

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

export interface DealForChart {
  ticker: string;
  trade_date: string;
  t1d_pred: string;
  t1w_pred: string;
  t1m_pred: string;
}

export interface DealPricesChartProps {
  deal?: DealForChart | null;
  ticker?: string;
  trade_date?: string;
}

/* ---------- Helpers ---------- */

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

/**
 * X-axis labels:
 * - First tick of a month: "02 Dec"
 * - Rest of the month: "03", "04", ...
 * - When month changes, show "01 Jan", then only "02", "03" ...
 */
const formatDateLabelSmart = (isoDate: string, prevIsoDate?: string): string => {
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

/**
 * Cleaner tooltip with aligned values (table-like layout)
 */
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const point = payload[0].payload as DealPoint;

  return (
    <Paper elevation={6} sx={{ p: 1.25, minWidth: 220, borderRadius: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 0.75, fontWeight: 700 }}>
        {formatFullDate(point.date)}
      </Typography>

      <Table size="small" sx={{ "& td": { borderBottom: "none", py: 0.35 } }}>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: "text.secondary", pr: 1, width: 70 }}>
              Open
            </TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
              {formatPrice(point.open)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: "text.secondary", pr: 1 }}>High</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
              {formatPrice(point.high)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: "text.secondary", pr: 1 }}>Low</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
              {formatPrice(point.low)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: "text.secondary", pr: 1 }}>Close</TableCell>
            <TableCell sx={{ fontWeight: 700, textAlign: "right" }}>
              {formatPrice(point.close)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Paper>
  );
};

/**
 * Candlesticks using <Customized>.
 * Each candle is centered on the X-axis tick.
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

/**
 * OUTSIDE-left label (left of Y-axis, not inside plot area).
 */
const OutsideLeftHorizontalLineLabel: React.FC<any> = (props) => {
  const { yValue, text, color, yAxisMap, offset, labelYOffset = 0 } = props;
  if (yValue == null || !yAxisMap || !offset) return null;

  const yAxis = yAxisMap.price || yAxisMap[Object.keys(yAxisMap)[0]];
  const yScale = yAxis.scale;

  const y = yScale(yValue);
  if (y == null) return null;

  const xOutside = Math.max(6, offset.left - 10);
  const yPos = y - 4 + labelYOffset;

  return (
    <text
      x={xOutside}
      y={yPos}
      textAnchor="end"
      fill={color}
      fontSize={11}
      fontWeight={700}
      pointerEvents="none"
    >
      {text}
    </text>
  );
};

/**
 * "Price" label at top-left of Y axis (top corner, near axis).
 * Placed inside chart SVG, slightly above plot area.
 */
const YAxisTopLabel: React.FC<any> = (props) => {
  const { offset } = props;
  if (!offset) return null;

  const x = Math.max(6, offset.left - 10);
  const y = Math.max(12, offset.top - 6);

  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      fill="rgba(0,0,0,0.75)"
      fontSize={12}
      fontWeight={800}
      pointerEvents="none"
    >
      Price
    </text>
  );
};

/* ---------- Main Component ---------- */

const DealPricesChart: React.FC<DealPricesChartProps> = ({
  deal,
  ticker: tickerProp,
  trade_date: tradeDateProp,
}) => {
  const [chartData, setChartData] = useState<DealPoint[]>([]);
  const [issuePrice, setIssuePrice] = useState<number | null>(null);
  const [stopLoss, setStopLoss] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const ticker = deal?.ticker || tickerProp || "";
  const tradeDate = deal?.trade_date || tradeDateProp || "";
  const hasSelection = !!ticker && !!tradeDate;

  useEffect(() => {
    setChartData([]);
    setIssuePrice(null);
    setStopLoss(null);
    setError(null);

    if (!hasSelection) return;

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
            trade_date: tradeDate,
          }),
        });

        if (!res.ok) {
          if (res.status === 404) {
            let msg = "No data available for this ticker.";
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

        raw.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const processed: DealPoint[] = raw.map((row, idx) => ({
          ...row,
          label: formatDateLabelSmart(row.date, idx > 0 ? raw[idx - 1].date : undefined),
        }));

        setChartData(processed);
        setIssuePrice(json.issue_price != null ? Number(json.issue_price) : null);
        setStopLoss(json.stop_loss != null ? Number(json.stop_loss) : null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch price data");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [apiUrl, token, ticker, tradeDate, hasSelection]);

  const { yMin, yMax } = useMemo(() => {
    if (!chartData.length) return { yMin: 0, yMax: "auto" as number | "auto" };

    const prices: number[] = chartData.flatMap((d) => [d.open, d.high, d.low, d.close]);

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

    const spread = typeof yMax === "number" && typeof yMin === "number" ? yMax - yMin : 0;
    const offset = spread ? spread * 0.01 : 0.05;
    return offset || 0.05;
  }, [issuePrice, stopLoss, yMin, yMax]);

  const issueLineValue: number | undefined = issuePrice != null ? issuePrice : undefined;

  const stopLossLineValue: number | undefined =
    stopLoss != null ? stopLoss - stopLossOffset : undefined;

  // ✅ 1D close value (used as reference line + anchor for 1W/1M when 1D is Positive)
  const close1d = useMemo(() => {
    if (!chartData.length) return null;
    const len = chartData.length;
    const idx1d = clampIndex(0, len);
    return chartData[idx1d]?.close ?? null;
  }, [chartData]);

  const desiredIdx1d = 0;
  const desiredIdx1w = 4;
  const desiredIdx1m = 21;

  const show1WInBox = chartData.length < desiredIdx1w + 1 && !!deal?.t1w_pred;
  const show1MInBox = chartData.length < desiredIdx1m + 1 && !!deal?.t1m_pred;
  const showPredictionBox = show1WInBox || show1MInBox;

  const predictionBoxItems = useMemo(() => {
    if (!deal) return [];
    const items: { key: string; text: string; color: string }[] = [];
    if (show1WInBox && deal.t1w_pred) {
      const p = String(deal.t1w_pred ?? "").trim();
      items.push({ key: "1w", text: `1W ${p}`, color: markerColor("t1w", p) });
    }
    if (show1MInBox && deal.t1m_pred) {
      const p = String(deal.t1m_pred ?? "").trim();
      items.push({ key: "1m", text: `1M ${p}`, color: markerColor("t1m", p) });
    }
    return items;
  }, [deal, show1WInBox, show1MInBox]);

  // ✅ Prediction markers with custom Y positioning
  //    - Badge text should be only Positive/Negative/Neutral (no "1D:" prefix)
  //    - If 1D is Negative => 1D marker goes under Issue Price
  //    - If 1D is Positive => 1W/1M markers align to 1D close
  const predictionMarkers = useMemo(() => {
    if (!deal || !chartData.length) return [];

    const len = chartData.length;

    const idx1d = clampIndex(desiredIdx1d, len);
    const idx1w = clampIndex(desiredIdx1w, len);
    const idx1m = clampIndex(desiredIdx1m, len);

    const oneDayPredRaw = String(deal.t1d_pred ?? "").trim();
    const oneDayPred = oneDayPredRaw.toLowerCase();

    const is1dPositive =
      oneDayPred === "positive" || oneDayPred === "pos" || oneDayPred === "+";
    const is1dNegative =
      oneDayPred === "negative" || oneDayPred === "neg" || oneDayPred === "-";

    const spread =
      typeof yMax === "number" && typeof yMin === "number" ? yMax - yMin : 1;
    const offsetSmall = Math.max(spread * 0.01, 0.05);

    const oneDayClose = chartData[idx1d]?.close ?? chartData[len - 1].close;

    // We add a `yValue` field for PredictionBadges to use as the vertical anchor.
    // (PredictionBadges must read marker.yValue if present.)
    const mk = (
      key: "t1d" | "t1w" | "t1m",
      title: "1D" | "1W" | "1M",
      pred: string,
      desiredIndex: number
    ) => {
      const index = clampIndex(desiredIndex, len);
      const date = chartData[index]?.date ?? chartData[len - 1].date;

      // ✅ Only show Positive/Negative/etc in the badge
      const p = String(pred ?? "").trim();

      const marker: any = {
        key,
        title, // keep for internal uniqueness/tooltip, but badge should render ONLY `pred`
        pred: p,
        displayText: p ? `${title} ${p}` : title,
        index,
        date,
        color: markerColor(key, p),
        tooltipText: markerTooltipText(key, p),
      };

      // ✅ Positioning rules
      if (key === "t1d" && is1dNegative && issuePrice != null) {
        marker.yValue = issuePrice - offsetSmall; // under Issue line
      } else if ((key === "t1w" || key === "t1m") && is1dPositive) {
        marker.yValue = oneDayClose + offsetSmall; // based on 1D close
      } else {
        marker.yValue = chartData[index]?.close ?? chartData[len - 1].close; // default
      }

      const resolvesToLastBar = index === len - 1;
      const targetBeyondEnd = desiredIndex >= len;
      const isShortSeries = len <= 5; // 1 bar or 5 bars case called out
      if (key !== "t1d" && resolvesToLastBar && (targetBeyondEnd || isShortSeries)) {
        // shift future markers to the right of the last candle for clarity
        marker.horizontalOffsetBands = key === "t1m" ? 2 : 1;
      }

      return marker;
    };

    const out: any[] = [];
    if (deal.t1d_pred) out.push(mk("t1d", "1D", deal.t1d_pred, idx1d));
    if (deal.t1w_pred) out.push(mk("t1w", "1W", deal.t1w_pred, idx1w));
    if (deal.t1m_pred) out.push(mk("t1m", "1M", deal.t1m_pred, idx1m));

    return out.filter((m) => m.pred && m.pred !== "");
  }, [deal, chartData, issuePrice, yMin, yMax]);

  if (!ticker || !tradeDate) {
    return (
      <Container maxWidth="xl" sx={{ mt: 3, mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Momentum & Predictions
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
            <Box sx={{ mt: 3, height: 420, position: "relative" }}>
              {showPredictionBox && predictionBoxItems.length > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 12,
                    zIndex: 2,
                    bgcolor: "rgba(255,255,255,0.96)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 1.5,
                    p: 1.25,
                    boxShadow: 1,
                    minWidth: 140,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ display: "block", fontWeight: 700, color: "text.secondary", mb: 0.5 }}
                  >
                    Future predictions
                  </Typography>
                  {predictionBoxItems.map((item) => (
                    <Box
                      key={item.key}
                      display="flex"
                      alignItems="center"
                      justifyContent="flex-start"
                      gap={1}
                      sx={{ mt: 0.25 }}
                    >
                      <Box
                        component="span"
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 18, right: 70, bottom: 20, left: 50 }}
                  style={{ overflow: "visible" }}
                >
                  <XAxis dataKey="label" />
                  <YAxis yAxisId="price" domain={[yMin, yMax]} tickLine={false} />

                  {/* ✅ Price label at top-left of the Y axis */}
                  <Customized component={<YAxisTopLabel />} />

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

                  {/* ✅ 1D Close line (slightly thicker) */}
                  {close1d != null && (
                    <ReferenceLine
                      y={close1d}
                      yAxisId="price"
                      stroke="rgba(0,0,0,0.30)"
                      strokeWidth={2} // slightly thicker
                    />
                  )}

                  {/* Prediction badges */}
                  {predictionMarkers.length > 0 && (
                    <Customized
                      component={
                        <PredictionBadges
                          // PredictionBadges should:
                          // 1) show ONLY marker.pred (no "1D:" prefix)
                          // 2) use marker.yValue if present to position vertically
                          markers={predictionMarkers as PredictionMarkerResolved[]}
                        />
                      }
                    />
                  )}

                  {/* Reference lines */}
                  {issuePrice != null && (
                    <ReferenceLine
                      y={issueLineValue}
                      yAxisId="price"
                      stroke="rgba(0,0,0,0.35)"
                      strokeWidth={1.25}
                      strokeDasharray="3 4"
                    />
                  )}
                  {stopLoss != null && (
                    <ReferenceLine
                      y={stopLossLineValue}
                      yAxisId="price"
                      stroke="rgba(176,0,32,0.40)"
                      strokeWidth={1.25}
                      strokeDasharray="3 4"
                    />
                  )}

                  {/* Labels OUTSIDE-left of Y-axis */}
                  {issuePrice != null && (
                    <Customized
                      component={
                        <OutsideLeftHorizontalLineLabel
                          yValue={issueLineValue}
                          text={`Issue = ${issuePrice.toFixed(2)}`}
                          color="rgba(0,0,0,0.70)"
                          labelYOffset={-2}
                        />
                      }
                    />
                  )}
                  {stopLoss != null && (
                    <Customized
                      component={
                        <OutsideLeftHorizontalLineLabel
                          yValue={stopLossLineValue}
                          text={`Stop = ${stopLoss.toFixed(2)}`}
                          color="rgba(176,0,32,0.75)"
                          labelYOffset={12}
                        />
                      }
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </Box>

            {/* Legend + info note */}
            <Box
              mt={2}
              display="flex"
              flexWrap="wrap"
              justifyContent="center"
              gap={2}
              alignItems="center"
            >
              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: "2px dashed rgba(0,0,0,0.55)",
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
                    borderTop: "2px dashed rgba(176,0,32,0.55)",
                    mr: 0.5,
                  }}
                />
                Stop Loss
              </Typography>

              <Typography variant="caption">
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    width: 18,
                    height: 0,
                    borderTop: "2px solid rgba(0,0,0,0.30)",
                    mr: 0.5,
                  }}
                />
                1D Close
              </Typography>

              <Box display="flex" alignItems="center" mt={0.5}>
                <InfoOutlinedIcon fontSize="small" sx={{ color: "grey.500", mr: 0.5 }} />
                <Typography variant="caption" color="text.secondary">
                  Data is from Trade date to one week
                </Typography>
              </Box>
            </Box>

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

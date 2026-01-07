// src/Components/AIMLResults/PredictionBadges.tsx

import React from "react";

interface PredictionMarkerResolved {
  index: number;
  title: string; // keep for internal use/tooltips if you want
  pred: string;
  color: string;
  key: string;
  tooltipText: string;

  // ✅ NEW: optional y anchor (price value) to position badge
  // If not provided, we fall back to candle high (current behavior)
  yValue?: number;
}

/**
 * Draws small badges above the candle for the resolved marker indices.
 * Implemented via Recharts <Customized>.
 */
export const PredictionBadges: React.FC<any> = (props) => {
  const { xAxisMap, yAxisMap, data, offset, markers } = props as {
    xAxisMap: any;
    yAxisMap: any;
    data: any[];
    offset: any;
    markers: PredictionMarkerResolved[];
  };

  if (!xAxisMap || !yAxisMap || !data?.length || !offset || !markers?.length) {
    return null;
  }

  const xKey = Object.keys(xAxisMap)[0];
  const xAxis = xAxisMap[xKey];
  const xScale = xAxis.scale;

  const bandWidth =
    xAxis.bandSize ??
    (typeof xScale.bandwidth === "function" ? xScale.bandwidth() : 10);

  const yAxis = yAxisMap.price || yAxisMap[Object.keys(yAxisMap)[0]];
  const yScale = yAxis.scale;

  // group markers by index so we can stack them
  const byIndex = new Map<number, PredictionMarkerResolved[]>();
  for (const m of markers) {
    const arr = byIndex.get(m.index) ?? [];
    arr.push(m);
    byIndex.set(m.index, arr);
  }

  // Visual constants
  const bodyPadX = 6;
  const badgeHeight = 16;
  const badgeGap = 4;
  const maxBadgeWidth = Math.max(90, bandWidth * 0.95); // keep readable

  // Helper: choose the anchor Y (in pixels) for the badge stack
  const getAnchorY = (entry: any, ms: PredictionMarkerResolved[]) => {
    // If ANY marker has yValue, use the first one’s yValue as the anchor
    // (they’ll still stack nicely relative to this anchor).
    const withY = ms.find((m) => typeof m.yValue === "number");
    if (withY && typeof withY.yValue === "number") {
      const y = yScale(withY.yValue);
      return Number.isFinite(y) ? y : null;
    }

    // fallback: candle high (old behavior)
    const highY = yScale(entry.high);
    return Number.isFinite(highY) ? highY : null;
  };

  return (
    <g>
      {Array.from(byIndex.entries()).map(([idx, ms]) => {
        const entry = data[idx];
        if (!entry) return null;

        const label = entry.label;
        const xCenter = (xScale(label) ?? 0) + bandWidth / 2;

        const anchorY = getAnchorY(entry, ms);
        if (anchorY == null) return null;

        return (
          <g key={`pred-group-${idx}`}>
            {ms.map((m, j) => {
              // ✅ CHANGE #1: show ONLY Positive/Negative/etc
              const text = `${m.pred}`;

              // ✅ CHANGE #2: position relative to anchorY (either yValue or high)
              // Move badges slightly above the anchor, stack upward
              const y = anchorY - 10 - j * (badgeHeight + badgeGap);

              // approximate text width (simple + safe); prevents huge overflow
              const estWidth = Math.min(
                maxBadgeWidth,
                Math.max(56, text.length * 6.2 + bodyPadX * 2)
              );

              const xLeft = xCenter - estWidth / 2;

              return (
                <g key={`${m.key}-${idx}-${j}`}>
                  {/* background */}
                  <rect
                    x={xLeft}
                    y={y - badgeHeight}
                    width={estWidth}
                    height={badgeHeight}
                    rx={6}
                    ry={6}
                    fill="white"
                    opacity={0.92}
                    stroke={m.color}
                    strokeWidth={1}
                  />
                  {/* color dot */}
                  <circle
                    cx={xLeft + 10}
                    cy={y - badgeHeight / 2}
                    r={3}
                    fill={m.color}
                  />
                  {/* text */}
                  <text
                    x={xLeft + 18}
                    y={y - 5}
                    fill="#111827"
                    fontSize={11}
                    fontWeight={700}
                    pointerEvents="none"
                  >
                    {text}
                  </text>

                  {/* native SVG title tooltip */}
                  <title>{m.tooltipText}</title>
                </g>
              );
            })}
          </g>
        );
      })}
    </g>
  );
};

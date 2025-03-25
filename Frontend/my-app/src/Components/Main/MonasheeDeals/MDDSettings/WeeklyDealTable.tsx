import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000)
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000)
    return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
};

const formatNegativeValue = (value: number) => {
  const formattedValue = formatValue(value);
  return value < 0 ? (
    <Typography sx={{ color: "red", display: "flex", alignItems: "center",fontSize: "13px", }}>
      {formattedValue}
      <ArrowDownwardIcon sx={{ fontSize: "13px", marginRight: "4px" }} />

    </Typography>
  ) : (
    formattedValue
  );
};

interface DealStats {
  count: number;
  volume: number;
  allocation_capital: number;
  allocation_weighted: number;
  monahsee_actual_total: number;
  model_actual_total: number;
  GAP: number;
}

interface WeeklyDealTableProps {
  data: Record<string, Record<string, DealStats>>;
  selectedRegions: string[];
  selectedDealTypes: string[];
}

const WeeklyDealTable: React.FC<WeeklyDealTableProps> = ({
  data,
  selectedRegions,
  selectedDealTypes,
}) => {
  let rows = Object.entries(data)
    .filter(
      ([region]) =>
        region !== "SUMMARY" &&
        (selectedRegions.length === 0 || selectedRegions.includes(region))
    )
    .flatMap(([region, regionData]) =>
      Object.entries(regionData)
        .filter(
          ([dealType]) =>
            selectedDealTypes.length === 0 || selectedDealTypes.includes(dealType)
        )
        .map(([dealType, dealStats]) => ({ region, dealType, dealStats }))
    );

  // Include SUMMARY row
  if (data.SUMMARY && data.SUMMARY.TOTAL) {
    rows.push({
      region: "SUMMARY",
      dealType: "TOTAL",
      dealStats: data.SUMMARY.TOTAL,
    });
  }

  let rowSpans: Record<string, number> = {};
  let previousRegion: string | null = null;
  let renderedRegions: Record<string, boolean> = {};

  rows.forEach(({ region }) => {
    if (region !== previousRegion) {
      rowSpans[region] = 1;
    } else {
      rowSpans[region]++;
    }
    previousRegion = region;
  });

  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#002060" }}>
          {[
            "Region",
            "Deal Type",
            "Deal Count",
            "Deal Volume",
            "Allocation Capital",
            "Weighted Allocation as % of deal size",
            "Monashee Actual Total PnL(Gross)",
            "Model Actual Total PnL(Gross)",
            "Total Gap",
          ].map((heading) => (
            <TableCell key={heading} sx={{ color: "white", minWidth: "40px" }}>
              {heading}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} align="center">
              No data found
            </TableCell>
          </TableRow>
        ) : (
          rows.map(({ region, dealType, dealStats }, idx) => {
            const isSummaryRow = region === "SUMMARY";
            const rowColor = isSummaryRow ? "#91ce89" : idx % 6 < 3 ? "#" : "#";
            const showRegion = !renderedRegions[region];

            if (showRegion) {
              renderedRegions[region] = true;
            }

            return (
              <TableRow
                key={`${region}-${dealType}`}
                sx={{
                  backgroundColor: rowColor,
                  fontWeight: isSummaryRow ? "bold" : "normal",
                }}
              >
                {showRegion && (
                  <TableCell
                    rowSpan={rowSpans[region]}
                    sx={{ fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}
                  >
                    {region}
                  </TableCell>
                )}
                <TableCell>{dealType}</TableCell>
                <TableCell>{dealStats.count}</TableCell>
                <TableCell>{formatNegativeValue(dealStats.volume)}</TableCell>
                <TableCell>{formatNegativeValue(dealStats.allocation_capital)}</TableCell>
                <TableCell>
                  {dealStats.allocation_weighted
                    ? dealStats.allocation_weighted.toFixed(2)
                    : "N/A"}
                  %
                </TableCell>
                <TableCell>{formatNegativeValue(dealStats.monahsee_actual_total)}</TableCell>
                <TableCell>{formatNegativeValue(dealStats.model_actual_total)}</TableCell>
                <TableCell>{formatNegativeValue(dealStats.GAP)}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default WeeklyDealTable;

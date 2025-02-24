import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

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

const WeeklyDealTable: React.FC<WeeklyDealTableProps> = ({ data, selectedRegions, selectedDealTypes }) => {
  const rows = Object.entries(data)
    .filter(([region]) => selectedRegions.length === 0 || selectedRegions.includes(region))
    .flatMap(([region, regionData]) =>
      Object.entries(regionData)
        .filter(([dealType]) => selectedDealTypes.length === 0 || selectedDealTypes.includes(dealType))
        .map(([dealType, dealStats]) => ({ region, dealType, dealStats }))
    );

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
          {["Region", "Deal Type", "Count", "Volume", "Allocation Capital", "Allocation of Deal Size %", "Monashee Actual Total PnL(Gross)", "Model Actual Total PnL(Gross)", "Gap"].map((heading) => (
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
            const isLastRow = idx === rows.length - 1;
            const rowColor = idx % 6 < 3 ? "#f5f5f5" : "#e0e0e0";
            const showRegion = !renderedRegions[region];

            if (showRegion) {
              renderedRegions[region] = true;
            }

            return (
              <TableRow
                key={`${region}-${dealType}`}
                sx={{ backgroundColor: isLastRow ? "#59735b" : rowColor }}
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
                <TableCell>{formatValue(dealStats.volume)}</TableCell>
                <TableCell>{formatValue(dealStats.allocation_capital)}</TableCell>
                <TableCell>{dealStats.allocation_weighted.toFixed(2)}%</TableCell>
                <TableCell>{formatValue(dealStats.monahsee_actual_total)}</TableCell>
                <TableCell>{formatValue(dealStats.model_actual_total)}</TableCell>
                <TableCell>{formatValue(dealStats.GAP)}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default WeeklyDealTable;

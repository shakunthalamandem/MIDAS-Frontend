import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
} from "@mui/material";
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

const formatNegativeValue = (value: number, isTotalRow: boolean) => {
  const formattedValue = formatValue(value);
  return value < 0 ? (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "13px",
        fontWeight: isTotalRow ? "bold" : "normal",
        color: "red",
      }}
    >
      <ArrowDownwardIcon sx={{ fontSize: "13px", mr: "4px" }} />
      {formattedValue}
    </Box>
  ) : (
    <Typography
      sx={{
        fontSize: "13px",
        fontWeight: isTotalRow ? "bold" : "normal",
        textAlign: "center",
      }}
    >
      {formattedValue}
    </Typography>
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
  let rows: {
    region: string;
    dealType: string;
    dealStats: DealStats;
  }[] = [];

  Object.entries(data).forEach(([region, regionData]) => {
    if (region === "SUMMARY" || (selectedRegions.length && !selectedRegions.includes(region))) {
      return;
    }

    const dealEntries = Object.entries(regionData).filter(
      ([dealType]) => dealType !== "TOTAL"
    );

    const filtered = dealEntries.filter(
      ([dealType]) =>
        selectedDealTypes.length === 0 || selectedDealTypes.includes(dealType)
    );

    if (filtered.length > 0) {
      // Push filtered rows
      filtered.forEach(([dealType, dealStats]) => {
        rows.push({ region, dealType, dealStats });
      });

      // Compute total
      const totalStats = filtered.reduce<DealStats>(
        (acc, [, stats]) => {
          acc.count += stats.count;
          acc.volume += stats.volume;
          acc.allocation_capital += stats.allocation_capital;
          acc.monahsee_actual_total += stats.monahsee_actual_total;
          acc.model_actual_total += stats.model_actual_total;
          acc.GAP += stats.GAP;
          acc.allocation_weighted += stats.allocation_weighted;
          return acc;
        },
        {
          count: 0,
          volume: 0,
          allocation_capital: 0,
          allocation_weighted: 0,
          monahsee_actual_total: 0,
          model_actual_total: 0,
          GAP: 0,
        }
      );

      // Average allocation_weighted
      totalStats.allocation_weighted /= filtered.length;

      rows.push({ region, dealType: "TOTAL", dealStats: totalStats });
    }
  });

  // Add SUMMARY.TOTAL if it exists
  if (data.SUMMARY?.TOTAL) {
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
        <TableRow sx={{ backgroundColor: "#002060",border: "1px solid #000" }}>
          {["Region", "Deal Type", "Deal Count", "Deal Volume", "Allocation Capital", "Weighted Allocation as % of deal size", "Monashee Actual Total PnL(Gross)", "Model Actual Total PnL(Gross)", "Total Gap"].map((heading) => (
            <TableCell key={heading} sx={{ color: "white", minWidth: "40px",border: "1px solid #000" }}>
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
          rows.map(({ region, dealType, dealStats }) => {
            const isSummaryRow = region === "SUMMARY";
            const isTotalRow = dealType === "TOTAL";
            const rowColor = isSummaryRow ? "#91ce89" : isTotalRow ? "#ffffff" :"#ffffff";
            const showRegion = !renderedRegions[region];

            if (showRegion) {
              renderedRegions[region] = true;
            }

            return (
              <TableRow
                key={`${region}-${dealType}`}
                sx={{ border: "1px solid #000",backgroundColor: rowColor, fontWeight: isTotalRow || isSummaryRow ? "bold" : "normal" }}
              >
                {showRegion && (
                  <TableCell
                    rowSpan={rowSpans[region]}
                    sx={{ border: "1px solid #000",fontWeight: "bold", textAlign: "center", verticalAlign: "middle" }}
                  >
                    {region}
                  </TableCell>
                )}
                <TableCell
                  sx={{ border: "1px solid #000",fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {dealType}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid #000",fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {dealStats.count}
                </TableCell>
                <TableCell
                  sx={{border: "1px solid #000", fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {formatNegativeValue(dealStats.volume, isTotalRow)}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid #000",fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {formatNegativeValue(dealStats.allocation_capital, isTotalRow)}
                </TableCell>
                <TableCell
                  sx={{border: "1px solid #000", fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                {(dealStats.allocation_weighted ?? 0).toFixed(2)}%

                </TableCell>
                <TableCell
                  sx={{ border: "1px solid #000",fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {formatNegativeValue(
                    dealStats.monahsee_actual_total,
                    isTotalRow
                  )}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid #000",fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {formatNegativeValue(
                    dealStats.model_actual_total,
                    isTotalRow
                  )}
                </TableCell>
                <TableCell
                  sx={{ border: "1px solid #000",fontWeight: isTotalRow ? "bold" : "normal" }}
                  align="center"
                >
                  {formatNegativeValue(dealStats.GAP, isTotalRow)}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
};

export default WeeklyDealTable;

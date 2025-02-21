import React from "react";
import { Table, TableHead, TableRow, TableCell, TableBody, Typography } from "@mui/material";

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000)
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
};

interface WeeklyDealTableProps {
  data: any;
  selectedRegions: string[];
  selectedDealTypes: string[];
}

const WeeklyDealTable: React.FC<WeeklyDealTableProps> = ({ data, selectedRegions, selectedDealTypes }) => {
  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#466675" }}>
          {[
            "Region", 
            "Deal Type", 
            "Count", 
            "Volume", 
            "Allocation Capital", 
            "Allocation Deal %", 
            "Modal Actual Total Return", 
            "Model Actual Total", 
            "Gap"
          ].map((heading) => (
            <TableCell key={heading} sx={{ color: "white", minWidth: "40px" }}>
              {heading}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Object.entries(data).length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} align="center">
              No data found
            </TableCell>
          </TableRow>
        ) : (
          Object.entries(data)
            .filter(([region]) => selectedRegions.length === 0 || selectedRegions.includes(region))
            .flatMap(([region, regionData]: [string, any]) =>
              Object.entries(regionData)
                .filter(([dealType]) => selectedDealTypes.length === 0 || selectedDealTypes.includes(dealType))
                .map(([dealType, dealStats]: [string, any]) => (
                  <TableRow key={`${region}-${dealType}`}>
                    <TableCell>{region}</TableCell>
                    <TableCell>{dealType}</TableCell>
                    <TableCell>{dealStats.count}</TableCell>
                    <TableCell>{formatValue(dealStats.volume)}</TableCell>
                    <TableCell>{formatValue(dealStats.allocation_capital)}</TableCell>
                    <TableCell>{(dealStats.allocation_weighted).toFixed(2)}%</TableCell>
                    <TableCell>{formatValue(dealStats.model_actual_return)}</TableCell>
                    <TableCell>{dealStats.model_actual_total.toFixed(2)}</TableCell>
                    <TableCell>{dealStats.GAP.toFixed(2)}</TableCell>
                  </TableRow>
                ))
            )
        )}
      </TableBody>
    </Table>
  );
};

export default WeeklyDealTable;

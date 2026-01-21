import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { formatTwoDecimals } from "./NewDashboardLifeCycleUtils";

type ComparableTableProps = {
  rows: Array<Record<string, any>>;
};

const formatValue = (value: any) => {
  if (value == null) return "nm";
  if (typeof value === "string" && value.trim().toLowerCase() === "nan") return "nm";
  const num = Number(value);
  if (Number.isNaN(num)) return String(value);
  return formatTwoDecimals(num);
};

const formatPercent = (value: any) => {
  const formatted = formatValue(value);
  return formatted === "nm" ? formatted : `${formatted}%`;
};

const NewDashboardLifeCycleComparableTable: React.FC<ComparableTableProps> = ({ rows }) => {
  const columns = useMemo(
    () => [
      { field: "competitor", label: "Ticker" },
      { field: "price_usd", label: "Price (USD)", format: formatValue },
      { field: "market_cap", label: "Market Cap (USDm)", format: formatValue },
      { field: "ev_usd_million", label: "EV (USDm)", format: formatValue },
      { field: "present_year_ev_sales", label: "2026 EV/Sales", format: formatValue },
      { field: "one_year_later_ev_sales", label: "2027 EV/Sales", format: formatValue },
      { field: "present_year_price_earning", label: "2026 P/E", format: formatValue },
      { field: "one_year_later_price_earning", label: "2027 P/E", format: formatValue },
      { field: "present_year_ev_ebitda", label: "2026 EV/EBITDA", format: formatValue },
      { field: "one_year_later_ev_ebitda", label: "2027 EV/EBITDA", format: formatValue },
      { field: "sales_growth", label: "Sales Growth (26-27)", format: formatPercent },
      { field: "eps_growth", label: "EPS Growth (26-27)", format: formatPercent },
    ],
    []
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "auto" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#002060" }}>
              {columns.map((col) => (
                <TableCell
                  key={col.field}
                  sx={{ color: "#ffffff", fontWeight: 700, whiteSpace: "nowrap" }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow
                key={row.id ?? `${row.competitor ?? row.ticker ?? "row"}-${idx}`}
                sx={{ backgroundColor: idx % 2 === 0 ? "#f8fafc" : "#ffffff" }}
              >
                {columns.map((col) => {
                  const raw = row[col.field as keyof typeof row];
                  const value = col.format ? col.format(raw) : raw ?? "nm";
                  return <TableCell key={col.field}>{value}</TableCell>;
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default NewDashboardLifeCycleComparableTable;

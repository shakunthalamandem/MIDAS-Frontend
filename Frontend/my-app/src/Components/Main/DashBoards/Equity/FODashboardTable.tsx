import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Zoom,
} from "@mui/material";
import { motion } from "framer-motion";

interface RegionMonthwiseMetric {
  Total_Deal_Count_Sum: number;
  Total_Deal_Volume_Sum: number;
  Total_Postively_Performing_Deals: number;
  Total_Expected_returns_excess: number;
}

type MetricKey = keyof RegionMonthwiseMetric;

interface FODashboardTableProps {
  payload: Record<string, Record<string, RegionMonthwiseMetric>>; // year -> month -> metrics
}

const formatCurrency = (value?: number): string => {
  if (!value || isNaN(value)) return "-";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
};

const formatPercentage = (value?: number): string =>
  value !== undefined && !isNaN(value) ? `${value.toFixed(2)}%` : "-";

const monthOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const FODashboardTable: React.FC<FODashboardTableProps> = ({ payload }) => {
  const allMonthYearKeys = Object.entries(payload).flatMap(([year, months]) =>
    Object.keys(months)
      .filter((month) => monthOrder.includes(month))
      .map((month) => `${month} ${year}`)
  );

  const availableMonthYears = allMonthYearKeys.sort((a, b) => {
    const [monthA, yearA] = a.split(" ");
    const [monthB, yearB] = b.split(" ");
    const yearDiff = parseInt(yearA) - parseInt(yearB);
    return yearDiff !== 0
      ? yearDiff
      : monthOrder.indexOf(monthA) - monthOrder.indexOf(monthB);
  });

  const rows: {
    label: string;
    key: MetricKey;
    formatter: (val?: number) => string;
  }[] = [
    { label: "Deal Count", key: "Total_Deal_Count_Sum", formatter: (v) => v?.toString() ?? "-" },
    { label: "Deal Volume", key: "Total_Deal_Volume_Sum", formatter: formatCurrency },
    { label: "% Positive", key: "Total_Postively_Performing_Deals", formatter: formatPercentage },
    { label: "Excess Returns", key: "Total_Expected_returns_excess", formatter: formatPercentage },
  ];

  return (
    <Zoom in>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#fcfcdc",
          borderRadius: 2,
          boxShadow: 3,
          paddingTop: 2,
          mt: 3,
          overflowX: "auto",
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{ color: "#002060", fontWeight: 600 }}
        >
          FO Deal Summary
        </Typography>

        <Table
          size="small"
          sx={{
            tableLayout: "fixed",
            width: "100%",
            '& td, & th': {
              padding: "8px 10px",
              fontSize: "0.85rem",
              wordWrap: "break-word",
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: "#f0f0f0" }}>Metric</TableCell>
              {availableMonthYears.map((monthYear) => (
                <TableCell
                  key={monthYear}
                  align="center"
                  sx={{ fontWeight: 600, backgroundColor: "#f0f0f0" }}
                >
                  {monthYear}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <motion.tr
                key={row.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 + idx * 0.1 }}
              >
                <TableCell>{row.label}</TableCell>
                {availableMonthYears.map((monthYear) => {
                  const [month, year] = monthYear.split(" ");
                  const val = payload[year]?.[month]?.[row.key];
                  return (
                    <TableCell key={monthYear} align="center">
                      {row.formatter(val)}
                    </TableCell>
                  );
                })}
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Zoom>
  );
};

export default FODashboardTable;

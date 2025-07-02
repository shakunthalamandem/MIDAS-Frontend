import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Zoom,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { motion } from "framer-motion";

interface RegionMonthwiseMetric {
  Total_Deal_Count_Sum: number;
  Total_Deal_Volume_Sum: number;
  Total_Postively_Performing_Deals: number; 
  Total_Expected_returns_excess: number;
  Total_Long_Opportunity_Value: number;
}

interface RegionwiseMonthwise {
  [region: string]: {
    [year: string]: {
      [month: string]: {
        Total_Deal_Count: number;
        Total_Deal_Volume: number;
        Positively_Performing_Deals_Percentage: number;
        Expected_Returns_Excess: number;
        Long_Opportunity_Value: number;
      };
    };
  };
}

type MetricKey = keyof RegionMonthwiseMetric;

interface IPODashboardTableProps {
  payload: Record<string, Record<string, RegionMonthwiseMetric>>;
  regionwiseMonthwise: RegionwiseMonthwise;
}

const REGION_ORDER = ["US", "EMEA", "APAC", "Non-US America"];

const formatCurrency = (value?: number): string => {
  if (value === undefined || isNaN(value)) return "-";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000) return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  return `${sign}$${absValue.toFixed(1)}`;
};


const formatPercentage = (value?: number): string =>
  value !== undefined && !isNaN(value) ? `${value.toFixed(1)}%` : "-";

const monthOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MotionTableRow = motion(TableRow);

const IPODashboardTable: React.FC<IPODashboardTableProps> = ({
  payload,
  regionwiseMonthwise,
}) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    const newSet = new Set(expandedRows);
    newSet.has(key) ? newSet.delete(key) : newSet.add(key);
    setExpandedRows(newSet);
  };

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

  const rows = [
    {
      label: "Deal Count",
      key: "Total_Deal_Count_Sum" as MetricKey,
      regionKey: "Total_Deal_Count",
      formatter: (v?: number) => v?.toString() ?? "-",
    },
    {
      label: "Deal Volume",
      key: "Total_Deal_Volume_Sum" as MetricKey,
      regionKey: "Total_Deal_Volume",
      formatter: formatCurrency,
    },
    {
      label: "% of Positively Performing Deals",
      key: "Total_Postively_Performing_Deals" as MetricKey,
      regionKey: "Positively_Performing_Deals_Percentage",
      formatter: formatPercentage,
    },
    {
      label: "Excess Returns (T + 1M)",
      key: "Total_Expected_returns_excess" as MetricKey,
      regionKey: "Expected_Returns_Excess",
      formatter: formatPercentage,
    },
    {
      label: "Opportunity Value (T + 1M Excess)",
      key: "Total_Long_Opportunity_Value" as MetricKey,
      regionKey: "Long_Opportunity_Value",
      formatter: formatCurrency,
    },
  ];

  return (
    <Zoom in>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#fcfcdc",
          borderRadius: 2,
          boxShadow: 3,
          mt: 3,
        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{ color: "#002060", fontWeight: 600 }}
        >
          IPO Deal Summary
        </Typography>

        <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, backgroundColor: "#f0f0f0", width: "200px" }}>
                Metric
              </TableCell>
              <TableCell
                align="center"
                sx={{ fontWeight: 600, backgroundColor: "#f0f0f0" }}
              >
                Region
              </TableCell>
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
            {rows.map((row, idx) => {
              const isExpanded = expandedRows.has(row.key);
              const totalRowSpan = REGION_ORDER.length + 1;

              if (isExpanded) {
                return (
                  <React.Fragment key={row.key}>
                    {REGION_ORDER.map((region, regionIdx) => {
                      const data = regionwiseMonthwise[region];
                      return (
                        <TableRow key={`${row.key}-${region}`}>
                          {regionIdx === 0 && (
                            <TableCell
                              rowSpan={totalRowSpan}
                              sx={{ borderRight: "1px solid #ccc" }}
                            >
                              {row.label}
                            </TableCell>
                          )}
                          <TableCell align="center">{region}</TableCell>
                          {availableMonthYears.map((monthYear) => {
                            const [month, year] = monthYear.split(" ");
                            const value =
                              data?.[year]?.[month]?.[
                                row.regionKey as keyof typeof data[typeof year][typeof month]
                              ];
                            return (
                              <TableCell key={monthYear} align="center">
                                {row.formatter(value)}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })}

                    <MotionTableRow
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 + idx * 0.1 }}
                    >
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        <Box display="flex" alignItems="center" justifyContent="center">
                          <Typography variant="body2" sx={{ pr: 0.5, fontWeight: 600 }}>
                            Sum
                          </Typography>
                          <IconButton size="small" onClick={() => toggleRow(row.key)}>
                            <Remove fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>

                      {availableMonthYears.map((monthYear) => {
                        const [month, year] = monthYear.split(" ");
                        const val = payload[year]?.[month]?.[row.key];
                        return (
                          <TableCell key={monthYear} align="center" sx={{ fontWeight: 600 }}>
                            {row.formatter(val)}
                          </TableCell>
                        );
                      })}
                    </MotionTableRow>
                  </React.Fragment>
                );
              }

              return (
                <MotionTableRow
                  key={row.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 + idx * 0.1 }}
                >
                  <TableCell sx={{ borderRight: "1px solid #ccc",width: "200px" }}>
                    {row.label}
                  </TableCell>
                  <TableCell align="center">
                    <Box display="flex" alignItems="center" justifyContent="center">
                      <Typography variant="body2" sx={{ pr: 0.5 }}>
                        Sum
                      </Typography>
                      <IconButton size="small" onClick={() => toggleRow(row.key)}>
                        <Add fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                  {availableMonthYears.map((monthYear) => {
                    const [month, year] = monthYear.split(" ");
                    const val = payload[year]?.[month]?.[row.key];
                    return (
                      <TableCell key={monthYear} align="center">
                        {row.formatter(val)}
                      </TableCell>
                    );
                  })}
                </MotionTableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Zoom>
  );
};

export default IPODashboardTable;

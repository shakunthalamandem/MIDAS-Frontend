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

interface DealData {
  deal_size?: number;
  count?: number;
}

interface FODashboardTableProps {
  payload: {
    [month: string]: {
      [dealType: string]: DealData;
    };
  };
}

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const getMonthIndex = (monthKey: string): number => {
  const parts = monthKey.match(/\d+/g);
  const monthNum = parseInt(parts?.[1] || "1", 10);
  return monthNum - 1;
};

const formatCurrency = (value?: number): string => {
  if (!value || isNaN(value)) return "-";
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toFixed(2)}`;
};

const FODashboardTable: React.FC<FODashboardTableProps> = ({ payload }) => {
  const monthData: { [index: number]: DealData } = {};

  Object.entries(payload).forEach(([month, dealTypes]) => {
    const idx = getMonthIndex(month);
    const deal = dealTypes["FO"];
    if (deal) {
      monthData[idx] = deal;
    }
  });

  return (
    <Zoom in>
      <TableContainer
        component={Paper}
        sx={{
          backgroundColor: "#fcfcdc",
          borderRadius: 2,
          boxShadow: 3,
                              paddingTop:2

        }}
      >
        <Typography
          variant="h6"
          gutterBottom
          align="center"
          sx={{ color: "#002060", fontWeight: 600 }}
        >
          FO Deal Summary (Jan - June 2025)
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 ,backgroundColor:'#f0f0f0'}}>Metric</TableCell>
              {monthNames.slice(0, 6).map((name, idx) => (
                <TableCell key={idx} align="center" sx={{ fontWeight: 600,backgroundColor: "#f0f0f0" }}>
                  {name.slice(0, 3)}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            <motion.tr
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <TableCell>Count</TableCell>
              {monthNames.slice(0, 6).map((_, idx) => (
                <TableCell key={idx} align="center">
                  {monthData[idx]?.count ?? "-"}
                </TableCell>
              ))}
            </motion.tr>

            <motion.tr
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <TableCell>Deal Size</TableCell>
              {monthNames.slice(0, 6).map((_, idx) => {
                const value = monthData[idx]?.deal_size;
                return (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{
                      fontWeight: 500,
                      borderRadius: 1,
                    }}
                  >
                    {formatCurrency(value)}
                  </TableCell>
                );
              })}
            </motion.tr>
          </TableBody>
        </Table>
      </TableContainer>
    </Zoom>
  );
};

export default FODashboardTable;

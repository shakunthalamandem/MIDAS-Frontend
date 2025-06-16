import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Paper,
  TableContainer,
  Box,
  Fade,
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
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const getMonthIndex = (monthKey: string): number => {
  const parts = monthKey.match(/\d+/g);
  const monthNum = parseInt(parts?.[1] || "1", 10);
  return monthNum - 1;
};

const formatCurrency = (value?: number): string => {
  if (!value || isNaN(value)) return "-";
  if (value >= 1_000_000_000) return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  return `₹${value.toFixed(2)}`;
};

const getDealColor = (value?: number): string => {
  if (!value) return "#f0f0f0";
  if (value >= 1_000_000_000) return "#004d00";
  if (value >= 500_000_000) return "#1a6600";
  if (value >= 100_000_000) return "#339900";
  if (value >= 10_000_000) return "#66cc33";
  return "#e6ffe6";
};

const FODashboardTable: React.FC<FODashboardTableProps> = ({ payload }) => {
  const monthData: { [index: number]: DealData } = {};

  Object.entries(payload).forEach(([month, dealTypes]) => {
    const idx = getMonthIndex(month);
    if (idx <= 5) {
      const deal = dealTypes["FO"];
      if (deal) monthData[idx] = deal;
    }
  });

  return (
    <Fade in timeout={600}>
      <Box mt={4}>
        <Typography
          variant="h6"
          color="#002060"
          gutterBottom
          align="center"
          sx={{ fontWeight: 600 }}
        >
          FO Deal Summary (Till June 2025)
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            backgroundColor: "#f9fafb",
            borderRadius: 2,
            boxShadow: 3,
            p: 2,
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e3f2fd" }}>
                  Metric
                </TableCell>
                {monthNames.slice(0, 6).map((name, idx) => (
                  <TableCell
                    key={idx}
                    align="center"
                    sx={{ backgroundColor: "#e3f2fd", fontWeight: 600 }}
                  >
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
                <TableCell sx={{ fontWeight: 500 }}>Count</TableCell>
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
                <TableCell sx={{ fontWeight: 500 }}>Deal Size</TableCell>
                {monthNames.slice(0, 6).map((_, idx) => {
                  const value = monthData[idx]?.deal_size;
                  return (
                    <TableCell
                      key={idx}
                      align="center"
                      sx={{
                        backgroundColor: getDealColor(value),
                        color: value ? "#fff" : "#000",
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
      </Box>
    </Fade>
  );
};

export default FODashboardTable;

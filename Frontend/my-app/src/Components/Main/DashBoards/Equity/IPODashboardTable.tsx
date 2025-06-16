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

interface DealData {
  opportunity_value_ex: number;
  count?: number;
}

interface IPODashboardTableProps {
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
  if (!parts) return 0;
  const monthNum = parseInt(parts[parts.length - 1], 10);
  return monthNum - 1;
};

const formatValue = (value: number): string => {
  if (Math.abs(value) >= 1_000_000_000) return `₹${(value / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(value) >= 1_000_000) return `₹${(value / 1_000_000).toFixed(2)}M`;
  return `₹${value.toFixed(2)}`;
};

const IPODashboardTable: React.FC<IPODashboardTableProps> = ({ payload }) => {
  const monthData: { [index: number]: DealData } = {};

  Object.entries(payload).forEach(([month, dealTypes]) => {
    const idx = getMonthIndex(month);
    if (idx <= 5) {
      const deal = dealTypes["IPO"];
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
          IPO Deal Summary (Till June 2025)
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
                <TableCell sx={{ fontWeight: "bold", backgroundColor: "#e8f5e9" }}>
                  Metric
                </TableCell>
                {monthNames.slice(0, 6).map((name, idx) => (
                  <TableCell key={idx} align="center" sx={{ backgroundColor: "#e8f5e9" }}>
                    {name.slice(0, 3)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 500 }}>Count</TableCell>
                {monthNames.slice(0, 6).map((_, idx) => (
                  <TableCell key={idx} align="center">
                    {monthData[idx]?.count ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow sx={{ backgroundColor: "#fff3e0" }}>
                <TableCell sx={{ fontWeight: 500 }}>Deal Value</TableCell>
                {monthNames.slice(0, 6).map((_, idx) => (
                  <TableCell key={idx} align="center">
                    {monthData[idx]?.opportunity_value_ex
                      ? formatValue(monthData[idx].opportunity_value_ex)
                      : "-"}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Fade>
  );
};

export default IPODashboardTable;

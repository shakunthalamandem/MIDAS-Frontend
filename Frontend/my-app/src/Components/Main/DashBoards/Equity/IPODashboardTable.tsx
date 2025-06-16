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

interface DealData {
  deal_size?: number;
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
  "July", "August", "September", "October", "November", "December",
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

const IPODashboardTable: React.FC<IPODashboardTableProps> = ({ payload }) => {
  const monthData: { [index: number]: DealData } = {};

  Object.entries(payload).forEach(([month, dealTypes]) => {
    const idx = getMonthIndex(month);
    const deal = dealTypes["IPO"] || dealTypes["FO"]; // fallback to FO if IPO is missing
    if (deal) {
      monthData[idx] = deal;
    }
  });

  return (
    <Zoom in>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom align="center" color="#002060" fontWeight={600}>
         IPO Deal Summary (Jan - June 2025)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Metric</TableCell>
                {monthNames.slice(0, 6).map((name, idx) => (
                  <TableCell key={idx} align="center">{name.slice(0, 3)}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>Count</TableCell>
                {monthNames.slice(0, 6).map((_, idx) => (
                  <TableCell key={idx} align="center">
                    {monthData[idx]?.count ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow hover>
                <TableCell>Deal Size</TableCell>
                {monthNames.slice(0, 6).map((_, idx) => (
                  <TableCell key={idx} align="center">
                    {formatCurrency(monthData[idx]?.deal_size)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Zoom>
  );
};

export default IPODashboardTable;

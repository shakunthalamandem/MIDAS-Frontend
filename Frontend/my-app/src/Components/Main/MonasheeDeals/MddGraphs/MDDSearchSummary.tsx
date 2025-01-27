import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  IconButton,
  Collapse,
  Grid,
  Box,
} from "@mui/material";
import { ExpandMore, ExpandLess } from "@mui/icons-material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

interface Summary {
  ticker: string;
  no_of_deals: number;
  avg_allocation_deal_size: number;
  avg_allocation_ioi: number;
  total_capital_committed: number;
  avg_hold_period: number;
  total_return: number;
  total_return_percent: number
}

interface MDDSearchSummaryProps {
  summary: Summary;
}

const MDDSearchSummary: React.FC<MDDSearchSummaryProps> = ({ summary }) => {
  const [open, setOpen] = useState(false);

  const formatCurrency = (value: number): string => {
    const formattedValue = Math.abs(value).toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    });
    return value >= 0 ? formattedValue : `-${formattedValue}`;
  };

  const rows = [
    {
      label1: "Ticker",
      value1: summary.ticker,
      label2: "Number of Deals",
      value2: summary.no_of_deals,
    },
    {
      label1: "Avg Allocation Deal Size",
      value1: summary.avg_allocation_deal_size + "%",
      label2: "Total Capital Committed",
      value2: formatCurrency(summary.total_capital_committed),
    },
    {
      label1: "Avg Allocation IOI",
      value1: summary.avg_allocation_ioi + "%",
      label2: "Total Return",
      value2: (
        <>
          {formatCurrency(summary.total_return)}{" "}
          {summary.total_return >= 0 ? (
            <ArrowUpward style={{ color: "green", fontSize: "1rem" }} />
          ) : (
            <ArrowDownward style={{ color: "red", fontSize: "1rem" }} />
          )}
        </>
      ),
    },
    {
      label1: "Avg Hold Period",
      value1: `${summary.avg_hold_period} days`,
      label2: "Total Return in %",
      value2: 
      <>
      {summary.total_return_percent + "%"}
      {summary.total_return_percent >= 0 ? (
        <ArrowUpward style={{ color: "green", fontSize: "1rem" }} />
      ) : (
        <ArrowDownward style={{ color: "red", fontSize: "1rem" }} />
      )}
    </>
      ,
    },
  ];

  return (
    <Box>
      <Grid
        container
        alignItems="center"
        justifyContent="space-between"
        sx={{
          padding: 1.5,
          borderBottom: "1px solid #e0e0e0",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "bold",
            color: "#333",
            fontSize: "1.1rem",
          }}
        >
          Summary of All Deals Below
        </Typography>
        <IconButton
          onClick={() => setOpen(!open)}
          aria-label="expand"
          sx={{
            border: "1px solid #ccc",
            borderRadius: "50%",
            backgroundColor: open ? "#e0f7fa" : "#f3f3f3",
            "&:hover": {
              backgroundColor: "#d4f1f9",
            },
          }}
        >
          {open ? (
            <ExpandLess sx={{ color: "#00796b" }} />
          ) : (
            <ExpandMore sx={{ color: "#333" }} />
          )}
        </IconButton>
      </Grid>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <TableContainer>
          <Table size="small" aria-label="Summary Table">
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{
                    backgroundColor: i % 2 === 0 ? "#f3f3f3" : "#ffffff",
                    "&:hover": { backgroundColor: "#e0f7fa" },
                  }}
                >
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      fontWeight: "bold",
                      color: "#333",
                      width: "25%",
                    }}
                  >
                    {row.label1}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      width: "25%",
                    }}
                  >
                    {row.value1}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      fontWeight: "bold",
                      color: "#333",
                      width: "25%",
                    }}
                  >
                    {row.label2}
                  </TableCell>
                  <TableCell
                    sx={{
                      border: "1px solid #ccc",
                      width: "25%",
                    }}
                  >
                    {row.value2}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Box>
  );
};

export default MDDSearchSummary;

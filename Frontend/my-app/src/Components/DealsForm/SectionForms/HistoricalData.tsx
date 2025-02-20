import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Container,
} from "@mui/material";
import { DealFormData } from "../../../types/DealFormData";

// Define the structure for each transaction
interface Transaction {
  announcement_and_trade_date: string;
  price_discount: number;
  type: string;
  deal_size: {
    usd: number;
    percentage_of_co: number;
    shares_m: string;
  };
  bookrunners: string[];
  primary_secondary: string;
  monashee_demand_alloc_hold_period: string;
  lock_up_date: string;
  performance: {
    open: string;
    close: string;
    "1W": string;
    "1M": string;
  };
  sellers: string[];
}

interface HistoricalDataProps {
  data: Transaction[]; // Explicitly define the type of data
}

const HistoricalData: React.FC<HistoricalDataProps> = ({ data }) => {
  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      <Typography
        variant="h6"
        color="#aa1e13"
        style={{ textAlign: "center", marginBottom: 2 }}
      >
        Historical Data
      </Typography>

      <TableContainer
        component={Paper}
        sx={{
          height: "400px",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#aaa",
            borderRadius: "10px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#888",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f0f0f0",
            borderRadius: "10px",
          },
        }}
      >
        <Table size="small" aria-label="historical data table">
          <TableHead>
            <TableRow
              sx={{
                position: "sticky",
                top: 0,
                zIndex: 1,
                backgroundColor: "#f3ecec",
              }}
            >
              <TableCell sx={{ color: "#002060" }}>
                <strong>Key</strong>
              </TableCell>
              <TableCell sx={{ color: "#002060" }}>
                <strong>Value</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((transaction, index) => (
              <React.Fragment key={index}>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }} colSpan={2}>
                    <strong>Transaction {index + 1}</strong>
                  </TableCell>
                </TableRow>

                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Announcement and Trade Date</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>
                    {transaction.announcement_and_trade_date}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Price Discount</strong>
                  </TableCell>
                  <TableCell>{transaction.price_discount}%</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell>{transaction.type}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Deal Size (USD)</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.deal_size.usd}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Deal Size (% of Co)</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>
                    {transaction.deal_size.percentage_of_co}%
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Deal Size (Shares M)</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.deal_size.shares_m}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Bookrunners</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.bookrunners.join(", ")}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Primary/Secondary</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.primary_secondary}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{bgcolor:"#d4b8de",color:"#4d4d4d"}} >
                    <strong>Monashee Demand Alloc Hold Period</strong>
                  </TableCell>
                  <TableCell>
                    {transaction.monashee_demand_alloc_hold_period}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Lock-Up Date</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.lock_up_date}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Performance (Open)</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.performance.open}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}>
                    <strong>Performance (Close)</strong>
                  </TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.performance.close}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}><strong>Performance (1W)</strong></TableCell>
                  <TableCell  sx={{bgcolor:"#dbed91"}}>{transaction.performance["1W"]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }} ><strong>Performance (1M)</strong></TableCell>
                  <TableCell  sx={{bgcolor:"#dbed91"}}>{transaction.performance["1M"]}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell sx={{ color: "#4d4d4d" }}><strong>Sellers</strong></TableCell>
                  <TableCell sx={{bgcolor:"#dbed91"}}>{transaction.sellers.join(", ")}</TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default HistoricalData;

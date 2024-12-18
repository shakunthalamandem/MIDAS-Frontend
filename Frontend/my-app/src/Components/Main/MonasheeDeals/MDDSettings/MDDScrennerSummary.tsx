import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";

// Define the type for the summary data
interface Summary {
  totalDealSize: number; // Total sum of deal sizes
  avgT1DIssuePrice: number; // Average of T+1D Issue Price
  avgFoDiscount: number; // Average of FO Discount
  avgT1MReturns: number; // Average of T+1M Returns
  avgT1DReturns: number; // Average of T+1D Returns
  avgAllocationDealSize: number; // Average of Allocation Deal Size
}

interface MDDScreenerSummaryProps {
  apiResponse: any;
}

const MDDScreenerSummary: React.FC<MDDScreenerSummaryProps> = ({ apiResponse }) => {
  // Helper function to calculate the summary
  const calculateSummary = (data: any[]): Summary => {
    let totalDealSize = 0;
    let totalT1DIssuePrice = 0;
    let totalFoDiscount = 0;
    let totalT1MReturns = 0;
    let totalT1DReturns = 0;
    let totalAllocationDealSize = 0;
    let count = 0;

    data.forEach((item) => {
      // Summing up deal size
      const dealSize = item.deal_size ? parseFloat(item.deal_size.replace(/[^0-9.-]+/g, "")) : 0;
      if (!isNaN(dealSize)) totalDealSize += dealSize;

      // Averaging other values
      if (item.Tplus1DIssuePrice) {
        const issuePrice = parseFloat(item.Tplus1DIssuePrice.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(issuePrice)) totalT1DIssuePrice += issuePrice;
      }

      if (item.fo_discount) {
        const foDiscount = parseFloat(item.fo_discount.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(foDiscount)) totalFoDiscount += foDiscount;
      }

      if (item.Tplus1Mreturns) {
        const t1mReturns = parseFloat(item.Tplus1Mreturns.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(t1mReturns)) totalT1MReturns += t1mReturns;
      }

      if (item.Tplus1Dreturns) {
        const t1dReturns = parseFloat(item.Tplus1Dreturns.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(t1dReturns)) totalT1DReturns += t1dReturns;
      }

      if (item.allocation_deal_size) {
        const allocationDealSize = parseFloat(item.allocation_deal_size.replace(/[^0-9.-]+/g, ""));
        if (!isNaN(allocationDealSize)) totalAllocationDealSize += allocationDealSize;
      }

      count += 1;
    });

    // Calculate averages for fields except deal size
    return {
      totalDealSize,
      avgT1DIssuePrice: count > 0 ? totalT1DIssuePrice / count : 0,
      avgFoDiscount: count > 0 ? totalFoDiscount / count : 0,
      avgT1MReturns: count > 0 ? totalT1MReturns / count : 0,
      avgT1DReturns: count > 0 ? totalT1DReturns / count : 0,
      avgAllocationDealSize: count > 0 ? totalAllocationDealSize / count : 0,
    };
  };

  // Ensure data exists and calculate the summary
  const summary: Summary = apiResponse?.data ? calculateSummary(apiResponse.data) : {
    totalDealSize: 0,
    avgT1DIssuePrice: 0,
    avgFoDiscount: 0,
    avgT1MReturns: 0,
    avgT1DReturns: 0,
    avgAllocationDealSize: 0,
  };

  return (
    <Card sx={{ maxWidth: 400, margin: "20px auto" }}>
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          Summary
        </Typography>
        <Box>
          <Typography variant="body1" gutterBottom>
            <strong>Total Deal Size:</strong> ${summary.totalDealSize.toLocaleString()}
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Avg T+1D Issue Price:</strong> {summary.avgT1DIssuePrice.toFixed(2)}%
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Avg FO Discount:</strong> {summary.avgFoDiscount.toFixed(2)}%
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Avg T+1M Returns:</strong> {summary.avgT1MReturns.toFixed(2)}%
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Avg T+1D Returns:</strong> {summary.avgT1DReturns.toFixed(2)}%
          </Typography>
          <Typography variant="body1" gutterBottom>
            <strong>Avg Allocation Deal Size:</strong> {summary.avgAllocationDealSize.toFixed(2)}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MDDScreenerSummary;

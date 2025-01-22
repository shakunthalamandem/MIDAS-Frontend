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

const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

const MDDScreenerSummary: React.FC<MDDScreenerSummaryProps> = ({
  apiResponse,
}) => {
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
      // Correct mapping for the fields in API response
      const dealSize = item.deal_size
        ? parseFloat(item.deal_size.replace(/[^0-9.-]+/g, ""))
        : 0;
      if (!isNaN(dealSize)) totalDealSize += dealSize;

      // T+1D Issue Price
      if (item["t1d_issueprice"]) {
        const issuePrice = parseFloat(
          item["t1d_issueprice"].replace(/[^0-9.-]+/g, "")
        );
        if (!isNaN(issuePrice)) totalT1DIssuePrice += issuePrice;
      }

      // FO Discount
      if (item.fo_discount) {
        const foDiscount = parseFloat(
          item.fo_discount.replace(/[^0-9.-]+/g, "")
        );
        if (!isNaN(foDiscount)) totalFoDiscount += foDiscount;
      }

      // T+1M Returns
      if (item["t1m_returns"]) {
        const t1mReturns = parseFloat(
          item["t1m_returns"].replace(/[^0-9.-]+/g, "")
        );
        if (!isNaN(t1mReturns)) totalT1MReturns += t1mReturns;
      }

      // T+1D Returns
      if (item["t1d_returns"]) {
        const t1dReturns = parseFloat(
          item["t1d_returns"].replace(/[^0-9.-]+/g, "")
        );
        if (!isNaN(t1dReturns)) totalT1DReturns += t1dReturns;
      }

      // Allocation Deal Size
      if (item.allocation_deal_size) {
        const allocationDealSize = parseFloat(
          item.allocation_deal_size.replace(/[^0-9.-]+/g, "")
        );
        if (!isNaN(allocationDealSize))
          totalAllocationDealSize += allocationDealSize;
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
  const summary: Summary = apiResponse?.data
    ? calculateSummary(apiResponse.data)
    : {
        totalDealSize: 0,
        avgT1DIssuePrice: 0,
        avgFoDiscount: 0,
        avgT1MReturns: 0,
        avgT1DReturns: 0,
        avgAllocationDealSize: 0,
      };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
        
      }}
    >
      <Card
        sx={{
          width: "100%",
          boxShadow: 3,
          borderRadius: 2,
          backgroundColor: "#ffffff",
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#002060",
              }}
            >
              Summary
            </Typography>
          </Box>
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f0f8ff",
                borderRadius: "8px",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" gutterBottom>
                <strong>Total Deal Size:</strong> 
                {/* {summary.totalDealSize.toLocaleString()} */}
                {formatValue(summary.totalDealSize)}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Avg T+1D Issue Price:</strong>{" "}
                {summary.avgT1DIssuePrice.toFixed(2)}%
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Avg FO Discount:</strong>{" "}
                {summary.avgFoDiscount.toFixed(2)}%
              </Typography>
            </Box>

            {/* Second Row */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px",
                backgroundColor: "#f0f8ff",
                borderRadius: "8px",
                boxShadow: 1,
              }}
            >
              <Typography variant="body1" gutterBottom>
                <strong>Avg T+1M Returns:</strong>{" "}
                {summary.avgT1MReturns.toFixed(2)}%
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Avg T+1D Returns:</strong>{" "}
                {summary.avgT1DReturns.toFixed(2)}%
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MDDScreenerSummary;

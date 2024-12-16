import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  CardContent,
  Card,
  Button,
} from "@mui/material";

// Format values to represent millions, billions, etc.
const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

// Function to sort the ranges in descending order
const sortRangesDescending = (ranges: string[]): string[] => {
  return ranges.sort((a, b) => {
    const getValue = (range: string) => {
      const match = range.match(/-?\d+(\.\d+)?%/);
      return match ? parseFloat(match[0].replace("%", "")) : 0;
    };
    return getValue(b) - getValue(a); // Sort in descending order
  });
};

interface CategoryData {
  "Number of deals": number;
  "Weighted Allocation as % of Deal Size": number;
  "Weighted Allocation as % of IOI": number;
  "Deal volume": number;
  "Model Actual Return": number;
  "Model Return 1% Allocation": number;
}

interface ResponseData {
  [year: string]: {
    [category: string]: {
      [range: string]: CategoryData;
    };
  };
}

interface MDDCaptureTableProps {
  responseData: ResponseData;
  apiName: string;
}

const MDDCaptureTable: React.FC<MDDCaptureTableProps> = ({
  responseData,
  apiName,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<"IPO" | "FO">("IPO");
  const [dynamicCategoryByYear, setDynamicCategoryByYear] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (!responseData) return;

    const groupCategoriesByYear = Object.keys(responseData).reduce(
      (acc: Record<string, string[]>, year) => {
        if (responseData[year]?.[selectedCategory]) {
          const categories = Object.keys(responseData[year][selectedCategory]);
          acc[year] = Array.from(new Set(categories)).sort(); // Unique sorted categories
        }
        return acc;
      },
      {}
    );

    setDynamicCategoryByYear(groupCategoriesByYear);
  }, [responseData, selectedCategory]);

  // Function to move "Summary" row to the end after sorting
  const sortRangesWithSummaryAtEnd = (ranges: string[]): string[] => {
    const sortedRanges = ranges.filter((range) => range !== "Summary").sort((a, b) => {
      const getValue = (range: string) => {
        const match = range.match(/-?\d+(\.\d+)?%/);
        return match ? parseFloat(match[0].replace("%", "")) : 0;
      };
      return getValue(b) - getValue(a); // Sort in descending order
    });
    // Push the "Summary" row to the end
    sortedRanges.push("Summary");
    return sortedRanges;
  };

  return (
    <Box mr={0} sx={{ Width: "100%", maxWidth: "2000px" }}>
      <Box
        display="flex"
        justifyContent="center"
        mb={3}
        sx={{ gap: "10px" }}
      >
        <Button
          variant={selectedCategory === "IPO" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setSelectedCategory("IPO")}
        >
          IPO
        </Button>
        <Button
          variant={selectedCategory === "FO" ? "contained" : "outlined"}
          color="secondary"
          onClick={() => setSelectedCategory("FO")}
        >
          FO
        </Button>
      </Box>

      {Object.keys(responseData)
        .sort((a, b) => b.localeCompare(a)) // Sort years in descending order
        .map((year) => (
          <motion.div
            key={year}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <Card
              elevation={4}
              sx={{
                backgroundColor: "#fdfff8",
                marginBottom: "30px",
                padding: 2,
                width: "1400px",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  gutterBottom
                  sx={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#002060",
                  }}
                >
                  {year}
                </Typography>

                <Grid container spacing={3}>
                  {(() => {
                    const categoryData = responseData[year]?.[selectedCategory] || {};
                    const dynamicCategoryOrder = dynamicCategoryByYear[year] || [];
                    const sortedCategoryData = sortRangesWithSummaryAtEnd(dynamicCategoryOrder).map(
                      (range) =>
                        categoryData[range] || {
                          "Number of deals": 0,
                          "Weighted Allocation as % of Deal Size": 0,
                          "Weighted Allocation as % of IOI": 0,
                          "Deal volume": 0,
                          "Model Actual Return": 0,
                          "Model Return 1% Allocation": 0,
                        }
                    );

                    return (
                      <Grid item xs={12}>
                        <Card elevation={4} sx={{ backgroundColor: "#f7edd8" }}>
                          <CardContent>
                            <Typography
                              variant="h5"
                              gutterBottom
                              sx={{
                                fontWeight: "bold",
                                marginBottom: "15px",
                                textAlign: "center",
                                color: "#002060",
                              }}
                            >
                              {selectedCategory}
                            </Typography>

                            <TableContainer component={Paper}>
                              <Table
                                sx={{
                                  width: "100%",
                                }}
                                aria-label={`${selectedCategory} table`}
                              >
                                <TableHead>
                                  <TableRow
                                    sx={{
                                      backgroundColor: "#d8e2f7",
                                      color: "white",
                                    }}
                                  >
                                    {[
                                      "Quintile", // New column for serial numbers
                                      "T+1M Excess Returns",
                                      "No of Deals",
                                      "Alloc as % of Deal Size(Weighted)",
                                      "Alloc as % of IOI(Weighted)",
                                      "Deal Volume",
                                      "Model Actual Return",
                                      selectedCategory === "IPO"
                                        ? "Model Return 0.5% Allocation"
                                        : "Model Return 1% Allocation", // Dynamic header
                                    ].map((header, idx) => (
                                      <TableCell
                                        key={idx}
                                        sx={{
                                          fontSize: "0.725rem",
                                          fontWeight: "bold",
                                          border: "1px solid #ddd",
                                          padding: "4px 8px",
                                          width: idx === 0 ? "80px" : "90px", // Adjust width for Quantiles
                                        }}
                                      >
                                        {header}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {sortedCategoryData.map((data, index) => {
                                    const range = sortRangesWithSummaryAtEnd(dynamicCategoryOrder)[index];
                                    const isSummary = range === "Summary"; // Check if it's the summary row
                                    return (
                                      <TableRow
                                        key={range}
                                        sx={{
                                          "&:nth-of-type(odd)": {
                                            backgroundColor: "#f9f9f9",
                                          },
                                          backgroundColor: isSummary ? "#d1f7d1" : "inherit", // Highlight the summary row
                                        }}
                                      >
                                        <TableCell
                                          component="th"
                                          scope="row"
                                          sx={{
                                            fontSize: "0.8rem",
                                            border: "1px solid #ddd",
                                            padding: "4px 8px",
                                            fontWeight: isSummary ? "bold" : "normal",
                                          }}
                                        >
                                          {isSummary ? "" : index + 1}
                                        </TableCell>
                                        <TableCell
                                          component="th"
                                          scope="row"
                                          sx={{
                                            fontSize: "0.8rem",
                                            border: "1px solid #ddd",
                                            padding: "4px 8px",
                                            fontWeight: isSummary ? "bold" : "normal",
                                          }}
                                        >
                                          {range}
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontSize: "0.8rem" }}>
                                          {data["Number of deals"] || 0}
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontSize: "0.8rem" }}>
                                          {data["Weighted Allocation as % of Deal Size"]?.toFixed(2) || "0.00"}%
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontSize: "0.8rem" }}>
                                          {data["Weighted Allocation as % of IOI"]?.toFixed(2) || "0.00"}%
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontSize: "0.8rem" }}>
                                          {formatValue(data["Deal volume"] || 0)}
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontSize: "0.8rem" }}>
                                          {formatValue(data["Model Actual Return"] || 0)}
                                        </TableCell>
                                        <TableCell align="left" sx={{ fontSize: "0.8rem" }}>
                                          {formatValue(data["Model Return 1% Allocation"] || 0)}
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })()}
                </Grid>
                {selectedCategory === "FO" && (
                  <Typography mt={4} sx={{ fontWeight: "bold" }}>
                    * Blocks are not included
                  </Typography>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
    </Box>
  );
};

export default MDDCaptureTable;

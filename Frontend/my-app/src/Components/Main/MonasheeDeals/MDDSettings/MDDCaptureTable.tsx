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
import "./MDDCaptureTable.css";


// Format values to represent millions, billions, etc.
const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000_000)
    return `${sign}$${(absValue / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000)
    return `${sign}$${(absValue / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `${sign}$${(absValue / 1_000).toFixed(1)}K`;

  return `${sign}$${absValue.toFixed(2)}`;
};

interface CategoryData {
  "Number of deals": number;
  "Weighted Allocation as % of Deal Size": number;
  "Weighted Allocation as % of IOI": number;
  "Deal volume": number;
  "Model Actual Return": number;
  "Model Return 1% Allocation": number;
  // "Net of Hedge": number;
  "Allocation Return": number;
  "AM Return": number;
  "Model AM Return": number;
  "Total Return": number;
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
  const [dynamicCategoryByYear, setDynamicCategoryByYear] = useState<
    Record<string, string[]>
  >({});

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
    const sortedRanges = ranges
      .filter((range) => range !== "Summary")
      .sort((a, b) => {
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
    <Box mr={0} sx={{ Width: "100%" }}>
      <Box display="flex" justifyContent="left" mb={3} sx={{ gap: "10px" }}>
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
                width: "1200px",
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
                    const categoryData =
                      responseData[year]?.[selectedCategory] || {};
                    const dynamicCategoryOrder =
                      dynamicCategoryByYear[year] || [];
                    const sortedCategoryData = sortRangesWithSummaryAtEnd(
                      dynamicCategoryOrder
                    ).map(
                      (range) =>
                        categoryData[range] || {
                          "Number of deals": 0,
                          "Weighted Allocation as % of Deal Size": 0,
                          "Weighted Allocation as % of IOI": 0,
                          "Deal volume": 0,
                          "Model Actual Return": 0,
                          "Model Return 1% Allocation": 0,
                          // "Net of Hedge": 0,
                          "Allocation Return": 0,
                          "AM Return": 0,
                          "Total Return": 0,
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
                                    {/* Individual TableCell for each header */}
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "40px", // Specific width for "Quintile"
                                        // Add top border
                                      }}   

                                    >
                                      Quintile
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "130px",
                                      }}
                                    >
                                      T+1M Absolute Returns
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                      }}
                                    >
                                      No of Deals
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                      }}
                                    >
                                      Deal Volume ($)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                      }}
                                    >
                                      Allocation as % of Deal Size (Weighted)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                      }}
                                    >
                                      Allocation as % of IOI (Weighted)
                                    </TableCell>
                             
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        borderLeft:"2px solid #666666 !important",
                                        borderTop: "2px solid #666666 !important",
                                        
                                       
                                      }}  
                                      // className="flowing-top-border"

                                    > 
                                      Monashee Actual Allocation PnL (Gross $)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        // borderLeft:
                                        //   "2px solid #666666 !important",
                                        borderTop:
                                          "2px solid #666666 !important", // Add top border
                                      }} 
                                      // className="flowing-left-border flowing-top-border"
                                    >
                                      Model PnL With Actual Allocation (Gross $)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        borderRight:
                                          "2px solid #666666 !important",
                                        borderTop:
                                          "2px solid #666666 !important", // Add top border
                                      }} 
                                      // className="flowing-top-border" 
                                    >
                                      {selectedCategory === "IPO"
                                        ? "Model PnL with model Allocation (0.5%) (Gross $)"
                                        : "Model PnL with model Allocation (1%) (Gross $)"
                                      }
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        borderTop: "2px solid #666666", // Add top border
                                      }} 
                                      // className="flowing-top-border"
                                    >
                                       Monashee Actual AM PnL (Gross $)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        borderTop: "2px solid #666666", // Add top border
                                      }}
                                      // className="flowing-top-border"
                                    >
                                       Model PnL with model AM allocation (Gross $)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        borderTop: "2px solid #666666", // Add top border
                                        borderLeft:  "2px solid #666666 !important",
                                      }} 
                                      // className="flowing-top-border"
                                    >
                                       Monashee Actual Total PnL (Gross $)
                                    </TableCell>
                                    <TableCell
                                      sx={{
                                        fontSize: "0.725rem",
                                        fontWeight: "bold",
                                        border: "1px solid #ddd",
                                        padding: "4px 8px",
                                        width: "90px",
                                        borderTop: "2px solid #666666", // Add top border
                                        borderRight:  "2px solid #666666 !important",
                                      }} 
                                      // className="flowing-top-border"
                                    >
                                       Model Actual Total PnL (Gross $)
                                    </TableCell>
                                  </TableRow>
                                </TableHead>

                                <TableBody>
                                  {sortedCategoryData.map((data, index) => {
                                    const range =
                                      sortRangesWithSummaryAtEnd(
                                        dynamicCategoryOrder
                                      )[index];
                                    const isSummary = range === "Summary";
                                    const isLastRow =
                                      index === sortedCategoryData.length - 1;

                                    return (
                                      <TableRow
                                        key={index}
                                        sx={{
                                          "&:nth-of-type(odd)": {
                                            backgroundColor: "#f9f9f9",
                                          },
                                          backgroundColor: isSummary
                                            ? "#d1f7d1"
                                            : "inherit",
                                        }}
                                      >
                                        {/* First column: Quintile */}
                                        <TableCell
                                          component="th"
                                          scope="row"
                                          sx={{
                                            fontSize: "0.8rem",
                                            border: "1px solid #ddd",
                                            padding: "4px 8px",
                                            fontWeight: isSummary
                                              ? "bold"
                                              : "normal",
                                          }}
                                        >
                                          {isSummary ? "" : index + 1}
                                        </TableCell>

                                        {/* Range */}
                                        <TableCell
                                          component="th"
                                          scope="row"
                                          sx={{
                                            fontSize: "0.8rem",
                                            border: "1px solid #ddd",
                                            padding: "4px 8px",
                                            fontWeight: isSummary
                                              ? "bold"
                                              : "normal",
                                          }}
                                        >
                                          {range}
                                        </TableCell>

                                        {/* Standard Columns */}
                                        <TableCell
                                          align="left"
                                          sx={{ fontSize: "0.8rem" }}
                                        >
                                          {data["Number of deals"] || 0}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{ fontSize: "0.8rem" }}
                                        >
                                          {formatValue(
                                            data["Deal volume"] || 0
                                          )}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{ fontSize: "0.8rem" }}
                                        >
                                          {data[
                                            "Weighted Allocation as % of Deal Size"
                                          ]?.toFixed(2) || "0.00"}
                                          %
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{ fontSize: "0.8rem" }}
                                        >
                                          {data[
                                            "Weighted Allocation as % of IOI"
                                          ]?.toFixed(2) || "0.00"}
                                          %
                                        </TableCell>
                                    

                                        {/* Boxed Columns: Monashee */}
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            borderLeft:
                                              "2px solid #666666 !important",
                                            // borderTop: isFirstRow ? "2px solid #666666 !important" : "none",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }}
                                          // className="flowing-left-border"

                                        >
                                          {formatValue(
                                            data["Allocation Return"] || 0
                                          )}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            // borderTop: isFirstRow ? "2px solid blue !important" : "none",
                                            // borderLeft:
                                            //   "2px solid #666666 !important",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }}    
                                          // className={isLastRow ? "flowing-bottom-border" : ""}


                                        >
                                          {formatValue(
                                            data["Model Actual Return"] || 0
                                          )}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            borderRight:
                                              "2px solid #666666 !important",
                                            // borderTop: isFirstRow ? "2px solid blue !important" : "none",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }}
                                          // className={isLastRow ? "flowing-bottom-border" : ""}
                                        >
                                          {formatValue(
                                            data[
                                              "Model Return 1% Allocation"
                                            ] || 0
                                          )}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            borderColor: "#ddd",
                                            // borderTop: isFirstRow ? "2px solid #666666 !important" : "none",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }}
                                          // className={isLastRow ? "flowing-bottom-border" : ""}
                                        >
                                          {formatValue(data["AM Return"] || 0)}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            borderColor: "#ddd",
                                            // borderTop: isFirstRow ? "2px solid #666666 !important" : "none",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }}
                                          // className={isLastRow ? "flowing-bottom-border" : ""}
                                        >
                                          {formatValue(data["Model AM Return"] || 0)}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            borderLeft:
                                              "2px solid #666666 !important",
                                            // borderTop: isFirstRow ? "2px solid #666666 !important" : "none",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }}
                                          // className={isLastRow ? "flowing-bottom-border" : ""}
                                          
                                        >
                                          {formatValue(
                                            data["Total Return"] || 0
                                          )}
                                        </TableCell>
                                        <TableCell
                                          align="left"
                                          sx={{
                                            fontSize: "0.8rem",
                                            borderRight:"2px solid #666666 !important",
                                            borderBottom: isLastRow
                                              ? "2px solid #666666 !important"
                                              : "none",
                                          }} 
                                          // className="flowing-right-border"
                                        >
                                          {formatValue(
                                            data["Model Return 1% Allocation"] + data["Model AM Return"] || 0
                                          )}
                                        </TableCell>

                                        {/* Boxed Columns: Model */}
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
                {/* {selectedCategory === "FO" && (
                  <Typography mt={4} sx={{ fontWeight: "bold" }}>
                    * Blocks are not included
                  </Typography>
                )} */}
              </CardContent>
            </Card>
          </motion.div>
        ))}
    </Box>
  );
};

export default MDDCaptureTable;

import React from "react";
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
} from "@mui/material";

// Format values to represent millions, billions, etc.
const formatValue = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (absValue >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(2)}`;
};

const categoryOrder = [
  "> 40%",
  "20% to 40%",
  "10% to 20%",
  "0% to 10%",
  "-10% to 0%",
  "-10% to -20%",
  "< -20%",
];

interface CategoryData {
  "Number of deals": number;
  "Allocation as % of Deal Size": number;
  "Weighted Allocation as % of Deal Size": number;
  "Allocation as % of IOI": number;
  "Weighted Allocation as % of IOI": number;
  "Deal volume": number;
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
  return (
    <Box mr={0} sx={{ Width: "100%",maxWidth:'2000px' }}>
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
                backgroundColor: "#e6ebf5",
                marginBottom: "30px",
                padding: 2,
                width:"1400px",
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
  {["FO", "IPO"].map((category) => {
    const categoryData = responseData[year]?.[category] || {};

    // Sort the ranges according to the categoryOrder and fill missing data
    const sortedCategoryData = categoryOrder.map((range) =>
      categoryData[range] || {
        "Number of deals": 0,
        "Allocation as % of Deal Size": 0,
        "Weighted Allocation as % of Deal Size": 0,
        "Allocation as % of IOI": 0,
        "Weighted Allocation as % of IOI": 0,
        "Deal volume": 0,
      }
    );

    return (
      <Grid item xs={12} sm={6} key={category}> {/* Use full width for each item */}
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
              {category}
            </Typography>

            <TableContainer component={Paper}>
              <Table
                sx={{
                  // minWidth: 200,
                  // tableLayout: "fixed", // Manage column widths
                  width: "100%",
                }}
                aria-label={`${category} table`}
              >
                <TableHead>
                  <TableRow
                    sx={{
                      backgroundColor: "#d8e2f7",
                      color: "white",
                    }}
                  >
                    {[
                      "T+1M Excess Returns",
                      "No of Deals",
                      "Alloc as % of Deal Size(Simple)",
                      "Alloc as % of Deal Size(Weighted)",
                      "Alloc as % of IOI(Simple)",
                      "Alloc as % of IOI(Weighted)",
                      "Deal Volume",
                    ].map((header, idx) => (
                      <TableCell
                        key={idx}
                        sx={{
                          fontSize: "0.725rem",
                          fontWeight: "bold",
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                          width: idx === 0 ? "120px" : "80px",
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedCategoryData.map((data, index) => {
                    const range = categoryOrder[index];

                    return (
                      <TableRow
                        key={range}
                        sx={{
                          "&:nth-of-type(odd)": {
                            backgroundColor: "#f9f9f9",
                          },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{
                            fontSize: "0.8rem",
                            border: "1px solid #ddd",
                            padding: "4px 8px"
                          }}
                        >
                          {range}
                        </TableCell>
                        <TableCell
                          align="left"
                          sx={{
                            fontSize: "0.8rem",
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                          }}
                        >
                          {data["Number of deals"] || 0}
                        </TableCell>
                        <TableCell align="left" 
                         sx={{
                          fontSize: "0.8rem",
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                        }}>
                          {data["Allocation as % of Deal Size"]?.toFixed(2) ||
                            "0.00"}
                          %
                        </TableCell>
                        <TableCell align="left"
                         sx={{
                          fontSize: "0.8rem",
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                        }}>
                          {data[
                            "Weighted Allocation as % of Deal Size"
                          ]?.toFixed(2) || "0.00"}
                          %
                        </TableCell>
                        <TableCell align="left" 
                         sx={{
                          fontSize: "0.8rem",
                          border: "1px solid #ddd",
                          padding: "4px 8px",
                        }}>
                          {data["Allocation as % of IOI"]?.toFixed(2) || "0.00"}
                          %
                        </TableCell>
                        <TableCell align="left"  sx={{
                            fontSize: "0.8rem",
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                          }}>
                          {data[
                            "Weighted Allocation as % of IOI"
                          ]?.toFixed(2) || "0.00"}
                          %
                        </TableCell>
                        <TableCell align="left"  sx={{
                            fontSize: "0.8rem",
                            border: "1px solid #ddd",
                            padding: "4px 8px",
                          }}>
                          {formatValue(data["Deal volume"] || 0)}
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
  })}
</Grid>

              </CardContent>
            </Card>
          </motion.div>
        ))}
    </Box>
  );
};

export default MDDCaptureTable;

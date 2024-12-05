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
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  } else if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
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

interface MDDCaptureTableProps {
  responseData: any;
  apiName: string;
}

const MDDCaptureTable: React.FC<MDDCaptureTableProps> = ({
  responseData,
  apiName,
}) => {
  return (
    <Box mr={0}>
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

                <Grid container spacing={2}>
                  {["FO", "IPO"].map((category) => {
                    const categoryData = responseData[year][category];

                    // Sort the ranges according to the category_order
                    const sortedCategoryData = categoryOrder.map(
                      (range) => categoryData[range]
                    );

                    return (
                      <Grid item xs={12} sm={6} key={category}>
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card
                            elevation={4}
                            sx={{ backgroundColor: "#f7edd8" }}
                          >
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
                                  sx={{ minWidth: 300 }}
                                  aria-label={`${category} table`}
                                >
                                  <TableHead>
                                    <TableRow
                                      sx={{
                                        backgroundColor: "#d8e2f7",
                                        color: "white",
                                      }}
                                    >
                                      <TableCell
                                        sx={{
                                          fontSize: "0.85rem",
                                          fontWeight: "bold",
                                          border: "1px solid #ddd",
                                          padding: "4px 8px",
                                          width: "120px",
                                        }}
                                      >
                                        T+1M Excess Returns
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        sx={{
                                          fontSize: "0.85rem",
                                          fontWeight: "bold",
                                          border: "1px solid #ddd",
                                          padding: "4px 8px",
                                          width: "60px",
                                        }}
                                      >
                                        No of Deals
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        sx={{
                                          fontSize: "0.85rem",
                                          fontWeight: "bold",
                                          border: "1px solid #ddd",
                                          padding: "4px 8px",
                                          width: "80px",
                                        }}
                                      >
                                        Allocation as % of Deal Size
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        sx={{
                                          fontSize: "0.85rem",
                                          fontWeight: "bold",
                                          border: "1px solid #ddd",
                                          padding: "4px 8px",
                                          width: "80px",
                                        }}
                                      >
                                        Allocation as % of IOI
                                      </TableCell>
                                      <TableCell
                                        align="left"
                                        sx={{
                                          fontSize: "0.85rem",
                                          border: "1px solid #ddd",
                                          fontWeight: "bold",
                                          padding: "4px 8px",
                                          width: "80px",
                                        }}
                                      >
                                        Deal Volume
                                      </TableCell>
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
                                              fontSize: "0.85rem",
                                              border: "1px solid #ddd",
                                              padding: "4px 8px",
                                            }}
                                          >
                                            {range}
                                          </TableCell>
                                          <TableCell
                                            align="left"
                                            sx={{
                                              fontSize: "0.85rem",
                                              border: "1px solid #ddd",
                                              padding: "4px 8px",
                                            }}
                                          >
                                            {data["Number of deals"]}
                                          </TableCell>
                                          <TableCell
                                            align="left"
                                            sx={{
                                              fontSize: "0.85rem",
                                              border: "1px solid #ddd",
                                              padding: "4px 8px",
                                            }}
                                          >
                                            {data[
                                              "Allocation as % of Deal Size"
                                            ].toFixed(2)}
                                            %
                                          </TableCell>
                                          <TableCell
                                            align="left"
                                            sx={{
                                              fontSize: "0.85rem",
                                              border: "1px solid #ddd",
                                              padding: "4px 8px",
                                            }}
                                          >
                                            {data[
                                              "Allocation as % of IOI"
                                            ].toFixed(2)}
                                            %
                                          </TableCell>
                                          <TableCell
                                            align="left"
                                            sx={{
                                              fontSize: "0.85rem",
                                              border: "1px solid #ddd",
                                              padding: "4px 8px",
                                            }}
                                          >
                                            {formatValue(data["Deal volume"])}
                                          </TableCell>
                                        </TableRow>
                                      );
                                    })}
                                  </TableBody>
                                </Table>
                              </TableContainer>
                            </CardContent>
                          </Card>
                        </motion.div>
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

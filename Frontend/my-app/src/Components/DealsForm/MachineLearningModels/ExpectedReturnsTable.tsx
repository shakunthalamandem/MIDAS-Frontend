import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";

type ReturnData = {
  region_type: {
    allocation_weighted: number;
    min_expectation: number;
    max_expectation: number;
  };
  sector_type_region: {
    allocation_weighted: number;
    min_expectation: number;
    max_expectation: number;
  };
};

type Props = {
  data: ReturnData;
};

const ExpectedReturnsTable: React.FC<Props> = ({ data }) => {
  const { region_type, sector_type_region } = data;

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 320,
        height: "100%",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: "#1a237e" }}>
          Expected Returns Details
        </Typography>
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                  Region Return (Weighted)
                </TableCell>
                <TableCell>{region_type.allocation_weighted.toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                  Region Return Range
                </TableCell>
                <TableCell>
                  {region_type.min_expectation.toFixed(2)}% to {region_type.max_expectation.toFixed(2)}%
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                  Sector Return (Weighted)
                </TableCell>
                <TableCell>{sector_type_region.allocation_weighted.toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                  Sector Return Range
                </TableCell>
                <TableCell>
                  {sector_type_region.min_expectation.toFixed(2)}% to {sector_type_region.max_expectation.toFixed(2)}%
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default ExpectedReturnsTable;

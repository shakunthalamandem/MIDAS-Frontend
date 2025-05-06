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
  Stack,
  Divider,
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
  target: string;
  region: string;
};

const formatTargetLabel = (target: string): string => {
  if (target === "T1D") return "T+1 Day";
  if (target === "T1M") return "T+1 Month";
  return target;
};

const ExpectedReturnsTable: React.FC<Props> = ({ data, target, region }) => {
  const { region_type, sector_type_region } = data;

  const targetLabel = formatTargetLabel(target);

  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 320,
        height: "100%",
        boxShadow: 3,
        borderRadius: 2,
        backgroundColor: "#ffffff",
      }}
    >
      <CardContent>
        <Stack spacing={2}>
        <Typography variant="body1" color="text.primary">
        The table below shows expected {targetLabel} returns based on the past 2 years of data from the {region} region. It includes both region-level and sector-level estimates weighted by deal size.
          </Typography>

          <Divider />

          <Typography variant="h6" gutterBottom sx={{ color: "#1a237e" }}>
            Expected {targetLabel} Returns Summary
          </Typography>

          <TableContainer component={Paper} elevation={0}>
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                    {targetLabel} Returns (Deal Size Weighted)
                  </TableCell>
                  <TableCell>{region_type.allocation_weighted.toFixed(2)}%</TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                    Region Return Range
                  </TableCell>
                  <TableCell>
                    {region_type.min_expectation.toFixed(2)}% to {region_type.max_expectation.toFixed(2)}%
                  </TableCell>
                </TableRow> */}
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                    {targetLabel} based on Sector (Deal Size Weighted)
                  </TableCell>
                  <TableCell>{sector_type_region.allocation_weighted.toFixed(2)}%</TableCell>
                </TableRow>
                {/* <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: "#ede7f6" }}>
                    Sector Return Range
                  </TableCell>
                  <TableCell>
                    {sector_type_region.min_expectation.toFixed(2)}% to {sector_type_region.max_expectation.toFixed(2)}%
                  </TableCell>
                </TableRow> */}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ExpectedReturnsTable;

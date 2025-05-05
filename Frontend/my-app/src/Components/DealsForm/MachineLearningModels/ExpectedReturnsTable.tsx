import React from 'react';
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
} from '@mui/material';

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
  const {
    region_type,
    sector_type_region,
  } = data;

  return (
    <Card variant="outlined" sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Expected Returns Summary
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableBody>
              <TableRow>
                <TableCell>Expected Returns (Weighted)</TableCell>
                <TableCell>{region_type.allocation_weighted.toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Range of Expected Regions</TableCell>
                <TableCell>
                  {region_type.min_expectation.toFixed(2)} to {region_type.max_expectation.toFixed(2)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Same Sector Returns</TableCell>
                <TableCell>{sector_type_region.allocation_weighted.toFixed(2)}%</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Range of Sector Returns</TableCell>
                <TableCell>
                  {sector_type_region.min_expectation.toFixed(2)} to {sector_type_region.max_expectation.toFixed(2)}
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

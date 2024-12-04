import React from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

interface MDDCaptureTableProps {
  responseData: any; // The response data from the API
  apiName: string; // The API name that determines the key
}

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
  '> 40%', '20% to 40%', '10% to 20%', '0% to 10%', '-10% to 0%',
  '-10% to -20%', '< -20%'
];

const MDDCaptureTable: React.FC<MDDCaptureTableProps> = ({ responseData, apiName }) => {
  return (
    <div>
      {Object.keys(responseData).map((year) => (
        <div key={year} style={{ marginBottom: '30px' }}>
          <Typography variant="h4" gutterBottom>
            {year}
          </Typography>

          <Grid container spacing={2}>
            {['FO', 'IPO'].map((category) => {
              const categoryData = responseData[year][category];

              // Sort the ranges according to the category_order
              const sortedCategoryData = categoryOrder.map((range) => categoryData[range]);

              return (
                <Grid item xs={12} sm={6} key={category}>
                  <Typography variant="h5" gutterBottom>
                    {category}
                  </Typography>

                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 300 }} aria-label={`${category} table`}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontSize: '0.85rem' }}>Range</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                            Number of Deals
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                            Allocation as % of Deal Size
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                            Allocation as % of IOI
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                            Deal Volume
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedCategoryData.map((data, index) => {
                          const range = categoryOrder[index];

                          return (
                            <TableRow key={range}>
                              <TableCell component="th" scope="row" sx={{ fontSize: '0.85rem' }}>
                                {range}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                {data['Number of deals']}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                {data['Allocation as % of Deal Size'].toFixed(2)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                {data['Allocation as % of IOI'].toFixed(2)}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                                {formatValue(data['Deal volume'])}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              );
            })}
          </Grid>
        </div>
      ))}
    </div>
  );
};

export default MDDCaptureTable;

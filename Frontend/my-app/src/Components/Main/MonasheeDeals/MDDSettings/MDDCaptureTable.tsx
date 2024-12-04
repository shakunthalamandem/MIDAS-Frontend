import React from 'react';
import { Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, CardContent, Card } from '@mui/material';

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
  '> 40%', '20% to 40%', '10% to 20%', '0% to 10%', '-10% to 0%',
  '-10% to -20%', '< -20%'
];

interface MDDCaptureTableProps {
  responseData: any;
  apiName: string;
}

const MDDCaptureTable: React.FC<MDDCaptureTableProps> = ({ responseData, apiName }) => {
  return (
    <Box mr={0}>
      {Object.keys(responseData).map((year) => (
        <div key={year} style={{ marginBottom: '30px' }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            {year}
          </Typography>

          <Grid container spacing={2}>
            {['FO', 'IPO'].map((category) => {
              const categoryData = responseData[year][category];

              // Sort the ranges according to the category_order
              const sortedCategoryData = categoryOrder.map((range) => categoryData[range]);

              return (
                 <Card sx={{ width: 1200, padding: 2, margin: "auto" }}>
                <CardContent>
                <Grid item xs={12} sm={6} key={category}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    {category}
                  </Typography>

                  <TableContainer component={Paper} sx={{ border: '2px solid #1976d2', borderRadius: '8px' }}>
                    <Table sx={{ minWidth: 300 }} aria-label={`${category} table`}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                          <TableCell sx={{ fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #ddd', padding: '4px 8px',width:'100px' }}>T+1M Excess Returns</TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #ddd', padding: '4px 8px' }}>
                            No of Deals
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #ddd', padding: '4px 8px' }}>
                            Allocation as % of Deal Size
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #ddd', padding: '4px 8px' }}>
                            Allocation as % of IOI
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: '0.85rem', fontWeight: 'bold', border: '1px solid #ddd', padding: '4px 8px' }}>
                            Deal Volume
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {sortedCategoryData.map((data, index) => {
                          const range = categoryOrder[index];

                          return (
                            <TableRow key={range} sx={{ '&:nth-of-type(odd)': { backgroundColor: '#f9f9f9' } }}>
                              <TableCell component="th" scope="row" sx={{ fontSize: '0.85rem', border: '1px solid #ddd', padding: '4px 8px' }}>
                                {range}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem', border: '1px solid #ddd', padding: '4px 8px' }}>
                                {data['Number of deals']}
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem', border: '1px solid #ddd', padding: '4px 8px' }}>
                                {data['Allocation as % of Deal Size'].toFixed(2)}%
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem', border: '1px solid #ddd', padding: '4px 8px' }}>
                                {data['Allocation as % of IOI'].toFixed(2)}%
                              </TableCell>
                              <TableCell align="right" sx={{ fontSize: '0.85rem', border: '1px solid #ddd', padding: '4px 8px' }}>
                                {formatValue(data['Deal volume'])}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                </CardContent>
                </Card>
              );
            })}
          </Grid>
        </div>
      ))}
    </Box>
  );
};

export default MDDCaptureTable;

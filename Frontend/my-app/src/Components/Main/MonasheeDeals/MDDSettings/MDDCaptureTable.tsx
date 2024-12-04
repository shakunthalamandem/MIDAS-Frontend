import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';

interface MDDCaptureTableProps {
  responseData: any; // The response data from the API
  apiName: string; // The API name that determines the key
}

const MDDCaptureTable: React.FC<MDDCaptureTableProps> = ({ responseData, apiName }) => {
  return (
    <div>
      {Object.keys(responseData).map((year) => (
        <div key={year} style={{ marginBottom: '30px' }}>
          <Typography variant="h4" gutterBottom>
            {year}
          </Typography>

          {['FO', 'IPO'].map((category) => {
            const categoryData = responseData[year][category];

            return (
              <div key={category} style={{ marginBottom: '20px' }}>
                <Typography variant="h5" gutterBottom>
                  {category}
                </Typography>

                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 650 }} aria-label={`${category} table`}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Range</TableCell>
                        <TableCell align="right">Number of Deals</TableCell>
                        <TableCell align="right">Allocation as % of Deal Size</TableCell>
                        <TableCell align="right">Allocation as % of IOI</TableCell>
                        <TableCell align="right">Deal Volume</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {Object.keys(categoryData).map((range) => {
                        const data = categoryData[range];

                        return (
                          <TableRow key={range}>
                            <TableCell component="th" scope="row">
                              {range}
                            </TableCell>
                            <TableCell align="right">{data['Number of deals']}</TableCell>
                            <TableCell align="right">{data['Allocation as % of Deal Size'].toFixed(2)}</TableCell>
                            <TableCell align="right">{data['Allocation as % of IOI'].toFixed(2)}</TableCell>
                            <TableCell align="right">{data['Deal volume'].toLocaleString()}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default MDDCaptureTable;

import React from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Type definition for the table data
interface TableData {
  Total_Deal_Count: number;
  Positively_Performing_Deals_Percentage: number;
  Negatively_Performing_Deals_Percentage: number;
  Average_T1M_Abs_Return_of_Positively: number;
  Average_T1M_Abs_Return_of_Negatively: number;
  Expected_Returns_Absolute: number;
  Expected_Returns_Excess: number;
  Long_Opportunity_Value: number;
}

interface SectorTableDataProps {
  data: { Yearwise: { [year: string]: TableData } }; // Data passed from parent component
}

const SectorTableData: React.FC<SectorTableDataProps> = ({ data }) => {
  // Extract the Yearwise data
  const yearwiseData = data?.Yearwise;

  // Define columns for the table
  const columns = [
    'Year',
    'Total Deal Count',
    'Positively Performing Deals Percentage',
    'Negatively Performing Deals Percentage',
    'Avg T+1M Abs Return (Positively)',
    'Avg T+1M Abs Return (Negatively)',
    'Expected Returns Absolute',
    'Expected Returns Excess',
    'Long Opportunity Value',
  ];

  // Render the table only if Yearwise data exists
  if (!yearwiseData) {
    return <div>No data available</div>;
  }

  return (
    <TableContainer component={Paper} sx={{ marginTop: 2,marginBottom:4 }}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell
                key={column}
                sx={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  padding: '4px 8px', // Reduced padding
                  fontSize: '0.875rem', // Optional: Reduce font size
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(yearwiseData).map((year) => {
            const row = yearwiseData[year];
            return (
              <TableRow key={year}>
                <TableCell sx={{ padding: '4px 8px' }}>{year}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Total_Deal_Count}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Positively_Performing_Deals_Percentage}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Negatively_Performing_Deals_Percentage}%</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Average_T1M_Abs_Return_of_Positively}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Average_T1M_Abs_Return_of_Negatively}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Expected_Returns_Absolute}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Expected_Returns_Excess}</TableCell>
                <TableCell sx={{ padding: '4px 8px' }}>{row.Long_Opportunity_Value}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SectorTableData;

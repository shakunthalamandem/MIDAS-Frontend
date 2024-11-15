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
  data: { Sectorwise: { [sector: string]: TableData } }; // Data passed from parent component
}

const YearlyTableData: React.FC<SectorTableDataProps> = ({ data }) => {
  // Extract the Sectorwise data
  const sectorwiseData = data?.Sectorwise;
  console.log("sectorwiseData", sectorwiseData);

  // Define columns for the table
  const columns = [
    'Sector',
    'Total Deal Count',
    'Positively Performing Deals Percentage',
    'Negatively Performing Deals Percentage',
    'Avg T+1M Abs Return (Positively)',
    'Avg T+1M Abs Return (Negatively)',
    'Expected Returns Absolute',
    'Expected Returns Excess',
    'Long Opportunity Value',
  ];

  // Render the table only if Sectorwise data exists
  if (!sectorwiseData) {
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
                  padding: '4px 8px', // Reduce padding for smaller cell size
                  fontSize: '0.875rem', // Optional: Adjust font size if needed
                }}
              >
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.keys(sectorwiseData).map((sector) => {
            const row = sectorwiseData[sector];
            return (
              <TableRow key={sector}>
                <TableCell sx={{ padding: '4px 8px' }}>{sector}</TableCell>
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

export default YearlyTableData;

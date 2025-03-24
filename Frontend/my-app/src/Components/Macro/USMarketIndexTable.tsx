import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Container
} from '@mui/material';

interface MarketData {
  latest_date: string;
  snp_500: number;
  dow_jones: number;
  russell_2000: number;
  top_gainers: Record<string, number>;
  top_losers: Record<string, number>;
}

interface DataTableProps {
  latest_data: MarketData;
  time_frame: string;
}

// Helper function to prettify keys
const formatLabel = (label: string): string => {
  // Handle common replacements
  const replacements: Record<string, string> = {
    sp500: 'S&P 500',
    nasdaq: 'NASDAQ',
    dowjones: 'Dow Jones',
    russell2000: 'Russell 2000'
  };

  // Split on underscores
  const words = label.split('_');

  return words
    .map((word) => {
      const lowerWord = word.toLowerCase();
      if (replacements[lowerWord]) {
        return replacements[lowerWord];
      }
      // Capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

const USMarketIndexTable: React.FC<DataTableProps> = ({ latest_data, time_frame }) => {
  return (
    <Container sx={{ marginTop: 2, marginBottom: 2 }}>
    <Grid container spacing={3}>

      {/* Top Gainers Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: 'green', fontWeight: 'bold' }}
              align='center'
            >
              Top Gainers ({time_frame})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(0, 128, 0, 0.1)' }}>
                    <TableCell sx={{ color: '#002060', fontWeight: 'bold'}}>Sector</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: '#002060', fontWeight: 'bold'}}
                    >
                      Change(%)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(latest_data.top_gainers).map(([sector, change]) => (
                    <TableRow key={sector}>
                      <TableCell>{formatLabel(sector)}</TableCell>
                      <TableCell align="right">{change.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Market Indices Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: '#002060', fontWeight: 'bold' }}
              align='center'
            >
              Market Indices ({time_frame})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell align="right">{latest_data.latest_date}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell >S&P 500</TableCell>
                    <TableCell align="right" >{latest_data.snp_500.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Dow Jones</TableCell>
                    <TableCell align="right">{latest_data.dow_jones.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Russell 2000</TableCell>
                    <TableCell align="right">{latest_data.russell_2000.toFixed(2)}%</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      

      {/* Top Losers Card */}
      <Grid item xs={12} md={4}>
        <Card sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ color: 'red', fontWeight: 'bold' }}
              
              align='center'
            >
              Top Losers ({time_frame})
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}>
                    <TableCell sx={{ color: '#002060', fontWeight: 'bold' }}>Sector</TableCell>
                    <TableCell
                      align="right"
                      sx={{ color: '#002060', fontWeight: 'bold' }}
                    >
                      Change(%)
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(latest_data.top_losers).map(([sector, change]) => (
                    <TableRow key={sector}>
                      <TableCell>{formatLabel(sector)}</TableCell>
                      <TableCell align="right">{change.toFixed(2)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
    </Container>
  );
};

export default USMarketIndexTable;

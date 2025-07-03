import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography, Box, TableSortLabel
} from '@mui/material';

interface FilterOptions {
  funds: string[];
  from_date: string;
  to_date: string;
}

interface DealTypeRow {
  region: string;
  total_pnl: number;
  total_exposure: number;
}

interface ApiResponse {
  by_region: DealTypeRow[];
  total_pnl: number;
  total_exposure: number;
}

interface PnlTablesProps {
  selectedFilters: FilterOptions;
}

type Order = 'asc' | 'desc';

const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  let formattedValue: string;

  if (absValue >= 1e9) {
    formattedValue = `${(absValue / 1e9).toFixed(1)}B`; // Billion
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(1)}M`; // Million
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(1)}K`; // Thousand
  } else {
    formattedValue = absValue.toString(); // No formatting for values < 1000
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const EFRegionwise: React.FC<PnlTablesProps> = ({ selectedFilters }) => {
  const [data, setData] = useState<DealTypeRow[]>([]);
  const [totalPnl, setTotalPnl] = useState<number>(0);
  const [totalExposure, setTotalExposure] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sorting state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DealTypeRow>('region');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');
        if (!apiUrl) throw new Error('API URL is not defined');

        const response = await fetch(`${apiUrl}/api/pnl_by_region/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ filters: selectedFilters }),
        });

        if (!response.ok) throw new Error('Failed to fetch PnL data');
        const result: ApiResponse = await response.json();
        setData(result.by_region);
        setTotalPnl(result.total_pnl);
        setTotalExposure(result.total_exposure);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedFilters]);

  // Sorting logic
  const handleSort = (property: keyof DealTypeRow) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  }

  function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key
  ): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
    return order === 'desc'
      ? (a, b) => descendingComparator(a, b, orderBy)
      : (a, b) => -descendingComparator(a, b, orderBy);
  }

  const sortedData = [...data].sort(getComparator(order, orderBy));

  if (loading) {
    return (
      <Box textAlign="center" p={2}>
        <CircularProgress />
        <Typography mt={2}>Loading table...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
  <Box>
    <Typography variant="h5" gutterBottom align="center">
      Equity Funds By Region
    </Typography>
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell
              align="left"
              sx={{
                width: '33.33%',
                borderRight: '1px solid #e0e0e0'
              }}
              sortDirection={orderBy === 'region' ? order : false}
            >
              <TableSortLabel
                active={orderBy === 'region'}
                direction={orderBy === 'region' ? order : 'asc'}
                onClick={() => handleSort('region')}
              >
                <b>Region</b>
              </TableSortLabel>
            </TableCell>
            <TableCell
              align="center"
              sx={{
                width: '33.33%',
                borderRight: '1px solid #e0e0e0'
              }}
              sortDirection={orderBy === 'total_pnl' ? order : false}
            >
              <TableSortLabel
                active={orderBy === 'total_pnl'}
                direction={orderBy === 'total_pnl' ? order : 'asc'}
                onClick={() => handleSort('total_pnl')}
              >
                <b>PnL</b>
              </TableSortLabel>
            </TableCell>
            <TableCell
              align="center"
              sx={{ width: '33.33%' }}
              sortDirection={orderBy === 'total_exposure' ? order : false}
            >
              <TableSortLabel
                active={orderBy === 'total_exposure'}
                direction={orderBy === 'total_exposure' ? order : 'asc'}
                onClick={() => handleSort('total_exposure')}
              >
                <b>Exposure</b>
              </TableSortLabel>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedData.map((row) => (
            <TableRow key={row.region}>
              <TableCell align="left" sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0' }}>
                {row.region}
              </TableCell>
              <TableCell align="center" sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0' }}>
                {formatNumber(row.total_pnl)}
              </TableCell>
              <TableCell align="center" sx={{ width: '33.33%' }}>
                {formatNumber(row.total_exposure)}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell align="left" sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0' }}>
              <b>Total</b>
            </TableCell>
            <TableCell align="center" sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0' }}>
              <b>{formatNumber(totalPnl)}</b>
            </TableCell>
            <TableCell align="center" sx={{ width: '33.33%' }}>
              <b>{formatNumber(totalExposure)}</b>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);
};

export default EFRegionwise;
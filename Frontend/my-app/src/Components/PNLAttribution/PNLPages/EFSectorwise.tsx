import React, { useEffect, useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  CircularProgress, Typography, Box, TableSortLabel
} from '@mui/material';

interface FilterOptions {
  funds: string[];
  from_date: string;
  to_date: string;
}

interface DealTypeRow {
  sector: string;
  total_pnl: number;
  total_exposure: number;
}

interface ApiResponse {
  by_sector: DealTypeRow[];
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
    formattedValue = `${(absValue / 1e9).toFixed(1)}B`;
  } else if (absValue >= 1e6) {
    formattedValue = `${(absValue / 1e6).toFixed(1)}M`;
  } else if (absValue >= 1e3) {
    formattedValue = `${(absValue / 1e3).toFixed(1)}K`;
  } else {
    formattedValue = absValue.toFixed(1);
  }

  return value < 0 ? `-${formattedValue}` : formattedValue;
};

const EFSectorwise: React.FC<PnlTablesProps> = ({ selectedFilters }) => {
  const [data, setData] = useState<DealTypeRow[]>([]);
  const [totalPnl, setTotalPnl] = useState<number>(0);
  const [totalExposure, setTotalExposure] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof DealTypeRow>('sector');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.REACT_APP_API_URL;
        const token = localStorage.getItem('access_token');
        if (!apiUrl) throw new Error('API URL is not defined');

        const response = await fetch(`${apiUrl}/api/pnl_by_sector/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : '',
          },
          body: JSON.stringify({ filters: selectedFilters }),
        });

        if (!response.ok) throw new Error('Failed to fetch PnL data');
        const result: ApiResponse = await response.json();
        setData(result.by_sector);
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

  const handleSort = (property: keyof DealTypeRow) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
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
      <Typography variant="h6" gutterBottom align="center" color='#025f73' fontWeight={600}>
        Equity Funds By Sector
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ backgroundColor: "#002060", color: '#fff' }}>
            <TableRow>
              <TableCell
                align="left"
                sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0', color: '#fff' }}
                sortDirection={orderBy === 'sector' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'sector'}
                  direction={orderBy === 'sector' ? order : 'asc'}
                  onClick={() => handleSort('sector')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                    '& .MuiTableSortLabel-label': { color: '#fff !important' },
                  }}
                >
                  <b>Sector</b>
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0', color: '#fff' }}
                sortDirection={orderBy === 'total_pnl' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'total_pnl'}
                  direction={orderBy === 'total_pnl' ? order : 'asc'}
                  onClick={() => handleSort('total_pnl')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                    '& .MuiTableSortLabel-label': { color: '#fff !important' },
                  }}
                >
                  <b>P&L</b>
                </TableSortLabel>
              </TableCell>
              <TableCell
                align="center"
                sx={{ width: '33.33%', color: '#fff' }}
                sortDirection={orderBy === 'total_exposure' ? order : false}
              >
                <TableSortLabel
                  active={orderBy === 'total_exposure'}
                  direction={orderBy === 'total_exposure' ? order : 'asc'}
                  onClick={() => handleSort('total_exposure')}
                  sx={{
                    color: '#fff !important',
                    '& .MuiTableSortLabel-icon': { color: '#fff !important' },
                    '& .MuiTableSortLabel-label': { color: '#fff !important' },
                  }}
                >
                  <b>Exposure</b>
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedData.map((row, idx) => (
              <TableRow
                key={row.sector}
                sx={{ backgroundColor: idx % 2 === 0 ? '#fff' : '#f5f5f5' }}
              >
                <TableCell align="left" sx={{ width: '33.33%', borderRight: '1px solid #e0e0e0' }}>
                  {row.sector}
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

export default EFSectorwise;

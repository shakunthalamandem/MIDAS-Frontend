import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
} from '@mui/material';

// Define the type for each row of data
interface ScreenerDataRow {
  pricing_date: string;
  issuer_name: string;
  ticker_symbol: string;
  gics_sector: string;
  us_international: string;
  deal_type: string;
  deal_value: number;
  t1m_returns: number;
  t1_return: number;
  t1m_returns_index_returns: number;
  t1d_returns_index_returns: number;
  opportunity_value_ex: number;
}

interface ScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] }; // Add this prop
  // Add any other existing props here
}

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({ sectorwiseData }) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100); // Default rows per page
  const [totalRows, setTotalRows] = useState(0); // Total rows from API

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData, page, pageSize);
    }
  }, [sectorwiseData, page, pageSize]);

  const fetchDataFromApi = async (
    data: ScreenerDataTableProps['sectorwiseData'],
    page: number,
    pageSize: number
  ) => {
    setLoading(true);
    setError(null);

    const payload = {
      year_range: data.year_range,
      dealType: data.dealType,
      region: data.region,
      sector: data.sector,
      deal_value: data.deal_value,
      t1_return: data.t1_return,
      t1m_returns: data.t1m_returns,
      page: page + 1, // Adjust to 1-based index
      pageSize,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables');
      }

      const response = await fetch(`${apiUrl}/api/super-screener/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(result); // Log the API response for debugging
        setRows(result.data || []); // Default to empty array if data is undefined
        setTotalRows(result.pagination?.total_items || 0); // Ensure total_items is available
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'pricing_date', label: 'Pricing Date' },
    { id: 'issuer_name', label: 'Issuer Name' },
    { id: 'ticker_symbol', label: 'Ticker Symbol' },
    { id: 'gics_sector', label: 'Sector' },
    { id: 'us_international', label: 'Region' },
    { id: 'deal_type', label: 'Deal Type' },
    { id: 'deal_value', label: 'Deal Value' },
    { id: 't1_return', label: 'T + 1D Return' },
    { id: 't1d_returns_index_returns', label: 'T + 1D Index Returns' },
    { id: 't1m_returns', label: 'T + 1M Returns' },
    { id: 't1m_returns_index_returns', label: 'T + 1M Index Returns' },
    { id: 'opportunity_value_ex', label: 'Opportunity Value Excess' },
  ];

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPageSize(parseInt(event.target.value, 10));
    setPage(0); // Reset to the first page
  };

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <TableContainer
        component={Paper}
        style={{ maxHeight: '500px', overflowY: 'auto' }}
      >
        <Table stickyHeader aria-label="Screener Data Table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align="left"
                  style={{
                    fontWeight: 'bold',
                    color: '#002060',
                    minWidth: '180px', // Increase column width
                    padding: '6px 10px', // Reduce padding to decrease cell height
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {(rows || []).length > 0 ? (
              rows.map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id}
                      align="left"
                      style={{
                        minWidth: '180px', // Increase column width
                        padding: '6px 10px', // Reduce padding to decrease cell height
                      }}
                    >
                      {row[column.id as keyof ScreenerDataRow] ?? '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[10, 25, 50, 100]}
        component="div"
        count={totalRows}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </div>
  );
};

export default ScreenerDataTable;

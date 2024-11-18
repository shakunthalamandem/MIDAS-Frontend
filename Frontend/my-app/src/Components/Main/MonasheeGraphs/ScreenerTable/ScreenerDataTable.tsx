import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

// Define the type for each row of data
interface ScreenerDataRow {
  announcement_date: string;
  pricing_date: string;
  deal_type: string;
  ticker_symbol: string;
  issuer_name: string;
  deal_value: string;
  shares_offered: string;
  first_trade_date: string;
  gics_sector: string;
  us_international: string;
  month: string;
  year: string;
  t1_return: string;
  t30_return: string;
  t1m_returns: string;
  t1m_returns_index_returns: string;
  t1m_returns_excess_returns: string;
  opportunity_value_ex: string;
  opportunity_value_on_abs_basis: string;
  t1d_returns_index_returns: string;
  t1d_returns_excess_returns: string;
}

// Define the type for the ScreenerDataTableProps
interface ScreenerDataTableProps {
  sectorwiseData: {
    deal_type: string[];
    region: string[];
    sector: string[];
    t1return: string[];
    tmreturn: string[];
    year_range: number[];
  };
}

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({ sectorwiseData }) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Send the data to the API when the component is mounted or when sectorwiseData changes
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
      console.log(sectorwiseData, "+++++++++++++++++++++")
    }
  }, [sectorwiseData]);

  const fetchDataFromApi = async (data: ScreenerDataTableProps['sectorwiseData']) => {
    setLoading(true);
    setError(null); // Reset error state

    const payload = {
      deal_type: data.deal_type,
      region: data.region,
      sector: data.sector,
      t1return: data.t1return,
      tmreturn: data.tmreturn,
      year_range: data.year_range
    };

    try {
      const response = await fetch('http://192.168.1.59:9000/api/super-screener/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setRows(result); // Assuming the API response is an array of rows
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Define the columns for the table
  const columns = [
    { id: 'announcement_date', label: 'Announcement Date' },
    { id: 'pricing_date', label: 'Pricing Date' },
    { id: 'deal_type', label: 'Deal Type' },
    { id: 'ticker_symbol', label: 'Ticker Symbol' },
    { id: 'issuer_name', label: 'Issuer Name' },
    { id: 'deal_value', label: 'Deal Value' },
    { id: 'shares_offered', label: 'Shares Offered' },
    { id: 'first_trade_date', label: 'First Trade Date' },
    { id: 'gics_sector', label: 'Sector' },
    { id: 'us_international', label: 'Region' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
    { id: 't1_return', label: 'T1 Return' },
    { id: 't30_return', label: 'T30 Return' },
    { id: 't1m_returns', label: 'T1M Returns' },
    { id: 't1m_returns_index_returns', label: 'T1M Index Returns' },
    { id: 't1m_returns_excess_returns', label: 'T1M Excess Returns' },
    { id: 'opportunity_value_ex', label: 'Opportunity Value Ex' },
    { id: 'opportunity_value_on_abs_basis', label: 'Opportunity Value (Abs)' },
    { id: 't1d_returns_index_returns', label: 'T1D Index Returns' },
    { id: 't1d_returns_excess_returns', label: 'T1D Excess Returns' },
  ];

  return (
    <div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <TableContainer component={Paper}>
        <Table aria-label="Screener Data Table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.id} align="left">
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row, index) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.id} align="left">
                      {row[column.id as keyof ScreenerDataRow] || '-'}
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
    </div>
  );
};

export default ScreenerDataTable;

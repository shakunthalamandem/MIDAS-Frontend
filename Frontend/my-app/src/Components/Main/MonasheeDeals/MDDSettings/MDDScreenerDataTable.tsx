import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';

// Define the type for each row of data with updated column names
interface ScreenerDataRow {
  id: number; // Unique ID for each row
  pricing_date: string;
  issuer_name: string;
  ticker: string;
  gics_sector_from_bloomberg: string;
  broad_region: string;
  deal_type: string;
  deal_size: number;
  issue_price_lcl: number;
  t1m_excess_returns: number;
  t1d_return_from_bloomberg: number;
  t1m_return_from_dealogic: number;
}

interface MDDScreenerDataTableProps {
  sectorwiseData: { [key: string]: (string | number)[] };
}

const MDDScreenerDataTable: React.FC<MDDScreenerDataTableProps> = ({ sectorwiseData }) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [totalRows, setTotalRows] = useState(0); // Total rows from API

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData, paginationModel]);

  const fetchDataFromApi = async (data: MDDScreenerDataTableProps['sectorwiseData']) => {
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
      page: paginationModel.page + 1, // API pages are often 1-indexed
      pageSize: paginationModel.pageSize,
    };

    try {
      const apiUrl = process.env.REACT_APP_API_URL;

      if (!apiUrl) {
        throw new Error('API URL is not defined in environment variables');
      }

      const response = await fetch(`${apiUrl}/api/mddsuper-screener/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        setRows(
          (result.data || []).map((item: ScreenerDataRow, index: number) => ({
            ...item,
            id: index + 1, // Ensure each row has a unique ID
          }))
        );
        setTotalRows(result.pagination?.total_items || 0); // Set total rows
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Updated columns with new field names
  const columns: GridColDef[] = [
    { field: 'pricing_date', headerName: 'Pricing Date', width: 150 },
    { field: 'issuer_name', headerName: 'Issuer Name', width: 200 },
    { field: 'ticker', headerName: 'Ticker', width: 150 },
    { field: 'gics_sector_from_bloomberg', headerName: 'Sector (From Bloomberg)', width: 180 },
    { field: 'broad_region', headerName: 'Region', width: 150 },
    { field: 'deal_type', headerName: 'Deal Type', width: 150 },
    { field: 'deal_size', headerName: 'Deal Size', width: 180 },
    { field: 'issue_price_lcl', headerName: 'Issue Price (Local Currency)', width: 180 },
    { field: 't1m_excess_returns', headerName: 'T + 1M Excess Returns', width: 200 },
    { field: 't1d_return_from_bloomberg', headerName: 'T + 1D Return (From Bloomberg)', width: 220 },
    { field: 't1m_return_from_dealogic', headerName: 'T + 1M Return (From Dealogic)', width: 220 },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>Loading...</p>}
      
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={totalRows}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "transparent",
            fontWeight: 'bold',
            color: '#002060',
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: 'bold',
          },
          "& .MuiDataGrid-cell": {
            color: "#000000",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#F5F5F5",
          },
        }}
      />
    </div>
  );
};

export default MDDScreenerDataTable;

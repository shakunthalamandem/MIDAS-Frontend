import React, { useState, useEffect } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';

interface ScreenerDataRow {
  id: number; // Add a unique ID field required for the DataGrid
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
  sectorwiseData: { [key: string]: (string | number)[] };
}

const ScreenerDataTable: React.FC<ScreenerDataTableProps> = ({ sectorwiseData }) => {
  const [rows, setRows] = useState<ScreenerDataRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });
  const [totalRows, setTotalRows] = useState<number>(0);

  useEffect(() => {
    if (sectorwiseData) {
      fetchDataFromApi(sectorwiseData);
    }
  }, [sectorwiseData, paginationModel]);

  const fetchDataFromApi = async (data: ScreenerDataTableProps['sectorwiseData']) => {
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

      const response = await fetch(`${apiUrl}/api/super-screener/`, {
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
        setTotalRows(result.pagination?.total_items || 0);
      } else {
        throw new Error('Failed to fetch data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    { field: 'pricing_date', headerName: 'Pricing Date', width: 150 },
    { field: 'issuer_name', headerName: 'Issuer Name', width: 200 },
    { field: 'ticker_symbol', headerName: 'Ticker Symbol', width: 150 },
    { field: 'gics_sector', headerName: 'Sector', width: 180 },
    { field: 'us_international', headerName: 'Region', width: 110 },
    { field: 'deal_type', headerName: 'Deal Type', width: 100 },
    { field: 'deal_value', headerName: 'Deal Value', width: 180 },
    { field: 't1_return', headerName: 'T + 1D Return', width: 180 },
    { field: 't1d_returns_index_returns', headerName: 'T + 1D Index Returns', width: 200 },
    { field: 't1m_returns', headerName: 'T + 1M Returns', width: 180 },
    { field: 't1m_returns_index_returns', headerName: 'T + 1M Index Returns', width: 200 },
    { field: 'opportunity_value_ex', headerName: 'Opportunity Value Excess', width: 220 },
  ];

  return (
    <div style={{ height: 600, width: '100%' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <DataGrid
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={totalRows}
        loading={loading}
        // disableSelectionOnClick
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            color: '#002060', // Set text color
            fontSize: '14px', // Optional: Adjust font size
            fontWeight: 'bold' 
             // Optional: Make the text bold
          },
          '& .MuiDataGrid-cell': {
            // padding: '4px',
            color:'#383937'
             // Optional: Adjust cell padding
          },
        }}
      />
    </div>
  );
};

export default ScreenerDataTable;

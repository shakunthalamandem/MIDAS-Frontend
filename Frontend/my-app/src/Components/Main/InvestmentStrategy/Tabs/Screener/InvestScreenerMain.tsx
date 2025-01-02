import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DataGrid, GridColDef } from '@mui/x-data-grid';

interface InvestScreenerMainProps {
  appliedValues: any;
}

const columns: GridColDef[] = [
  { field: 'ticker', headerName: 'Ticker', width: 150 },
  { field: 'dealType', headerName: 'Deal Type', width: 150 },
  { field: 't1_return', headerName: 'T1 Return', width: 130 },
  { field: 't1m_returns', headerName: 'T1M Returns', width: 130 },
  { field: 'deal_value', headerName: 'Deal Value', width: 150 },
  { field: 'sponsor', headerName: 'Sponsor', width: 180 },
  { field: 'deal_captain', headerName: 'Deal Captain', width: 180 },
  { field: 'allocation_percent_of_dealsize', headerName: 'Alloc % of Deal Size', width: 180 },
  { field: 'allocation_percent_of_ioi', headerName: 'Alloc % of IOI', width: 180 },
  { field: 'hold_period', headerName: 'Hold Period', width: 130 },
  { field: 'primary', headerName: 'Primary', width: 130 },
  { field: 'sector', headerName: 'Sector', width: 150 },
  { field: 'market_cap', headerName: 'Market Cap', width: 130 },
  { field: 'target_price', headerName: 'Target Price', width: 150 },
  { field: 'volume', headerName: 'Volume', width: 130 },
  { field: 'industries', headerName: 'Industries', width: 150 },
  { field: 'pe', headerName: 'PE', width: 130 },
  { field: 'pb', headerName: 'PB', width: 130 },
  { field: 'ev_sales', headerName: 'EV/Sales', width: 130 },
  { field: 'ev_ebitda', headerName: 'EV/EBITDA', width: 150 },
  { field: 'div_yield', headerName: 'Dividend Yield', width: 150 },
  { field: 'sales_growth_3y_cagr', headerName: 'Sales Growth 3Y CAGR', width: 200 },
  { field: 'eps_growth_3y_cagr', headerName: 'EPS Growth 3Y CAGR', width: 200 },
  { field: 'roe', headerName: 'ROE', width: 130 },
  { field: 'roce', headerName: 'ROCE', width: 130 },
  { field: 'net_debt_ebitda', headerName: 'Net Debt/EBITDA', width: 180 },
  { field: 'debt_equity', headerName: 'Debt/Equity', width: 150 },
  { field: '52_week_high', headerName: '52 Week High', width: 150 },
  { field: '52_week_low', headerName: '52 Week Low', width: 150 },
  { field: 'dma_20', headerName: 'DMA 20', width: 130 },
  { field: 'dma_50', headerName: 'DMA 50', width: 130 },
  { field: 'dma_200', headerName: 'DMA 200', width: 150 },
  { field: 'rsi_14d', headerName: 'RSI 14D', width: 130 },
  { field: 'mtd', headerName: 'MTD', width: 100 },
  { field: 'qtd', headerName: 'QTD', width: 100 },
  { field: 'ytd', headerName: 'YTD', width: 100 },
  { field: '1m', headerName: '1M', width: 100 },
  { field: '3m', headerName: '3M', width: 100 },
  { field: '6m', headerName: '6M', width: 100 },
  { field: '1y', headerName: '1Y', width: 100 },
  { field: 'beta', headerName: 'Beta', width: 130 },
  { field: 'volatility', headerName: 'Volatility', width: 150 },
];
const InvestScreenerMain: React.FC<InvestScreenerMainProps> = ({ appliedValues }) => {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const transformAppliedValues = (values: any) => {
      return {
        ...values.Fundamentals,
        ...values.MonasheeSpecific,
        ...values.Technicals,
      };
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const transformedValues = transformAppliedValues(appliedValues);
        const response = await axios.post(
          "http://192.168.1.59:9000/api/investment_screener/",
          transformedValues
        );

        // Validate that response.data is an array
        const data = Array.isArray(response.data) ? response.data : [];
        setRows(data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setRows([]); // Reset rows on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [appliedValues]);

  return (
    <Box sx={{ height: 500, width: "100%" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Screener Results
      </Typography>
      <DataGrid
        rows={rows.map((row, index) => ({ id: index, ...row }))}
        columns={columns}
        loading={loading}
        // pageSize={10}
        // rowsPerPageOptions={[10, 20, 50]}
        // disableSelectionOnClick
      />
    </Box>
  );
};

export default InvestScreenerMain;

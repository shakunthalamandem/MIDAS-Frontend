import React, { useState } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Box, TextField, Typography } from "@mui/material";

interface InvestScreenerMainProps {
  rows: any[];
  loading: boolean;
  totalRows: number;
}

const columns: GridColDef[] = [
  {
    field: "ticker",
    headerName: "Ticker",
    headerAlign: "center",
    width: 120,
    renderCell: (params) => (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
        }}
      >
        <Link
          to={`/technical/${params.value}`}
          style={{ color: "#1E88E5", textDecoration: "none" }}
          target="_blank"
        >
          {params.value}
        </Link>
      </div>
    ),
  },
  { field: "deal_type", headerName: "Deal Type", width: 100 },
  { field: "pricing_date", headerName: "Date", width: 100 },
  { field: "t1d_returns", headerName: "T1 Return", width: 100 },
  { field: "t1m_returns", headerName: "T1M Returns", width: 100 },
  { field: "deal_size", headerName: "Deal Size", width: 130 },
  { field: "sponsor", headerName: "Sponsor", width: 80 },
  { field: "deal_captain", headerName: "Deal Captain", width: 100 },
  {
    field: "allocation_deal_size",
    headerName: "Alloc % of Deal Size",
    width: 100,
  },
  { field: "allocation_ioi", headerName: "Alloc % of IOI", width: 100 },
  { field: "average_hold_period", headerName: "Hold Period", width: 100 },
  { field: "percentage_primary", headerName: "Primary %", width: 100 },
  { field: "gics_sector_from_bloomberg", headerName: "Sector", width: 140 },
  { field: "market_cap", headerName: "Market Cap", width: 130 },
  { field: "analyst_target_price", headerName: "Target Price", width: 100 },
  { field: "volume", headerName: "Volume", width: 100 },
  { field: "industry", headerName: "Industries", width: 150 },
  { field: "price_to_earnings", headerName: "PE", width: 80 },
  { field: "price_to_book", headerName: "PB", width: 80 },
  { field: "ev_sales", headerName: "EV/Sales", width: 80 },
  { field: "ev_ebitda", headerName: "EV/EBITDA", width: 80 },
  { field: "div_yield", headerName: "Dividend Yield", width: 80 },
  {
    field: "sales_growth_3y_cagr",
    headerName: "Sales Growth 3Y CAGR",
    width: 100,
  },
  // { field: "eps_growth_3y_cagr", headerName: "EPS Growth 3Y CAGR", width: 100 },
  { field: "roe", headerName: "ROE", width: 100 },
  { field: "roce", headerName: "ROCE", width: 100 },
  { field: "net_debt_ebitda", headerName: "Net Debt/EBITDA", width: 100 },
  { field: "debt_equity", headerName: "Debt/Equity", width: 100 },
  { field: "52_week_high", headerName: "52 Week High", width: 100 },
  { field: "52_week_low", headerName: "52 Week Low", width: 100 },
  { field: "dma_20", headerName: "DMA 20", width: 100 },
  { field: "dma_50", headerName: "DMA 50", width: 100 },
  { field: "dma_200", headerName: "DMA 200", width: 100 },
  { field: "rsi_14d", headerName: "RSI 14D", width: 100 },
  { field: "mtd", headerName: "MTD", width: 100 },
  { field: "qtd", headerName: "QTD", width: 100 },
  { field: "ytd", headerName: "YTD", width: 100 },
  { field: "1m", headerName: "1 Months", width: 100 },
  { field: "3m", headerName: "3 Months", width: 100 },
  { field: "6m", headerName: "6 Months", width: 100 },
  { field: "1y", headerName: "1 Year", width: 100 },
  { field: "beta", headerName: "Beta", width: 100 },
  { field: "volatility", headerName: "Volatility", width: 100 },
];

const InvestScreenerMain: React.FC<InvestScreenerMainProps> = ({
  rows,
  loading,
  totalRows,
}) => {
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 100,
  });

  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredRows = rows.filter((row) =>
    row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box mb={10} sx={{ height: 600, width: "100%" }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography
          align="left"
          style={{ fontWeight: "bold", color: "#fd0303", marginBottom: "15px" }}
        >
          {" "}
          Total no of deals:{" "}
          <span style={{ color: "#004b33" }}>{filteredRows.length}</span>
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search Ticker"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: 300 }}
        />
      </Box>

      <DataGrid
        rows={filteredRows.map((row, index) => ({ id: index, ...row }))}
        columns={columns}
        rowCount={filteredRows.length}
        loading={loading}
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        rowHeight={40}
        hideFooter
        sx={{
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: "transparent",
            fontWeight: "bold",
            color: "#002060",
          },
          "& .MuiDataGrid-columnHeaderTitle": {
            fontWeight: "bold",
            fontSize: "12px",
          },
          "& .MuiDataGrid-cell": {
            color: "#000000",
            fontSize: "12px",
            padding: "4px",
          },
          "& .MuiDataGrid-row:nth-of-type(odd)": {
            backgroundColor: "#F5F5F5",
          },
        }}
      />
    </Box>
  );
};

export default InvestScreenerMain;

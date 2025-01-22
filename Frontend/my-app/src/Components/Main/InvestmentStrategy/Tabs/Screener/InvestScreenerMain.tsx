import React, { useState, useMemo } from "react";
import { DataGrid, GridColDef, GridPaginationModel } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import { Box, TextField, Typography } from "@mui/material";
import { all } from "axios";

interface InvestScreenerMainProps {
  rows: any[];
  loading: boolean;
  totalRows: number;
}

const cleanDealSize = (dealSize: string) => {
  if (!dealSize) return 0;
  return parseFloat(dealSize.replace(/[^\d.-]/g, ""));
};

const preprocessRows = (rows: any[]) =>
  rows.map((row, index) => ({
    id: index,
    ...row,
    deal_size_raw: cleanDealSize(row.deal_size),
    deal_size: row.deal_size ? formatDealSize(row.deal_size) : "",
    t1d_returns: row.t1d_returns ? `${(row.t1d_returns).toFixed(2)}%` : "",
    t1m_returns: row.t1m_returns ? `${(row.t1m_returns).toFixed(2)}%` : "",
    beta: row.beta ? `${(row.beta).toFixed(2)}%` : "",
    roe: row.roe ? `${(row.roe).toFixed(2)}%` : "",
    roce: row.roce ? `${(row.roce).toFixed(2)}%` : "",
    net_debt_ebitda: row.net_debt_ebitda ? `${row.net_debt_ebitda.toFixed(2)}%` : "",
    debt_equity: row.debt_equity ? `${row.debt_equity.toFixed(2)}%` : "",
    div_yield: row.div_yield ? `${row.div_yield.toFixed(2)}%` : "",
    allocation_ioi: row.allocation_ioi ? `${row.allocation_ioi.toFixed(2)}%` : "",
    allocation_deal_size: row.allocation_deal_size ? `${row.allocation_deal_size.toFixed(2)}%` : "",
    percentage_primary: row.percentage_primary ? `${row.percentage_primary.toFixed(2)}%` : "",







  }));

  const formatDealSize = (dealSize: string) => {
    const cleanedValue = cleanDealSize(dealSize); // Clean the value as per your logic
    return "$" + cleanedValue.toLocaleString("en-US"); // Format number with commas (e.g., 234,423,423)
  };

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
  {
    field: "t1m_returns",
    headerName: "T1M Returns",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "t1d_returns",
    headerName: "T1 Return (%)",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "deal_size",
    headerName: "Deal Size ($)",
    width: 130,
    renderCell: (params) => params.value,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "allocation_ioi",
    headerName: "Alloc % of IOI",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },

  {
    field: "allocation_deal_size",
    headerName: "Alloc % of Deal Size",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },


  { field: "sponsor", headerName: "Sponsor", width: 80 },
  { field: "deal_captain", headerName: "Deal Captain", width: 100 },

  {
    field: "average_hold_period", headerName: "Hold Period", width: 100, renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed() : 0; // Format to 2 decimal places
    },
  },
  {
    field: "market_cap", headerName: "Market Cap", width: 130, renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? "$" + value.toLocaleString("en-US") : ""
    },
  },

  { field: "gics_sector_from_bloomberg", headerName: "Sector", width: 140 },
  {
    field: "price", headerName: "Price", width: 100, renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? "$" + value.toFixed(2) : ""; // Format to 2 decimal places
    },
  },

  { field: "industry", headerName: "Industries", width: 150 },

  { field: "analyst_target_price", headerName: "Target Price", width: 100 },
  {
    field: "price_to_earnings", headerName: "PE", width: 80
    , renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : ""; // Format to 2 decimal places
    },
  },
  {
    field: "price_to_book", headerName: "PB", width: 80, renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : ""; // Format to 2 decimal places
    },
  },


  {
    field: "percentage_primary",
    headerName: "Primary (%)",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },

  {
    field: "ev_sales", headerName: "EV/Sales", width: 80, renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : ""; // Format to 2 decimal places
    },
  },
  {
    field: "ev_ebitda", headerName: "EV/EBITDA", width: 80, renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : ""; // Format to 2 decimal places
    },
  },
  {
    field: "div_yield",
    headerName: "Dividend Yield",
    width: 80,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "sales_growth_3y_cagr",
    headerName: "Sales Growth 3Y CAGR",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : 0; // Format to 2 decimal places
    },
  },
  {
    field: "roe",
    headerName: "ROE",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "roce",
    headerName: "ROCE",
    width: 100,
    renderCell: (params) => `${params.value}`,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "net_debt_ebitda",
    headerName: "Net Debt/EBITDA",
    width: 100,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "debt_equity",
    headerName: "Debt/Equity",
    width: 100,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "dma_20",
    headerName: "DMA 20",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US")}`
        : "0";
    },
  },
  {
    field: "dma_50",
    headerName: "DMA 50",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "dma_200",
    headerName: "DMA 200",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "rsi_14d",
    headerName: "RSI 14D",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "mtd",
    headerName: "MTD",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },

  {
    field: "qtd",
    headerName: "QTD",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "ytd",
    headerName: "YTD",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "1m",
    headerName: "1 Month",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "3m",
    headerName: "3 Months",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "6m",
    headerName: "6 Months",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "1y",
    headerName: "1 Year",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value
        ? `${value < 0 ? "-$" : "$"}${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : "0";
    },
  },
  {
    field: "beta",
    headerName: "Beta",
    width: 100,
    sortComparator: (v1, v2) => cleanDealSize(v1) - cleanDealSize(v2),
  },
  {
    field: "volatility",
    headerName: "Volatility",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : "0"; // Format to 2 decimal places
    },
  },
  {
    field: "52_week_high",
    headerName: "52 Week High",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : 0; // Format to 2 decimal places
    },
  },
  {
    field: "52_week_low",
    headerName: "52 Week Low",
    width: 100,
    renderCell: (params) => {
      const value = parseFloat(params.value);
      return value ? value.toFixed(2) : 0; // Format to 2 decimal places
    },
  },
  {
    field: "volume",
    headerName: "Volume",
    width: 100,
    renderCell: (params) => {
      const value = Number(params.value); // Ensure the value is treated as a number
      if (isNaN(value)) {
        return ""; // Handle non-numeric values gracefully
      }
      return value.toLocaleString("en-US",);
    },
  },

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

  // Memoize the filteredRows calculation
  const filteredRows = useMemo(() => {
    return preprocessRows(rows).filter((row) =>
      row.ticker?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);
  
  return (
    <Box mb={10} sx={{ height: 600, width: "100%" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography
          align="left"
          style={{ fontWeight: "bold", color: "#fd0303", marginBottom: "15px" }}
        >
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
        rows={filteredRows}
        columns={columns}
        rowCount={filteredRows.length}
        loading={loading}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[10, 25, 50, 100]}
        rowHeight={40}
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
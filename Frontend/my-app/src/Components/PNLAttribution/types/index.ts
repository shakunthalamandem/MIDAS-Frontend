
import { GridColDef } from "@mui/x-data-grid";

export interface StrategyData {
  custom_group1?: string;
  custom_group2?: string;
  broad_region?: string;
  total: number;
}

export interface PnlTablesData {
  [key: string]: {
    top_5_strategies: StrategyData[];
    bottom_5_strategies: StrategyData[];
  };
}


export interface Deal {
  first_trade_date: string;
  client_symbol: string;
  custom_group_2: string;
  fo_type: string;
  deal_size: number;
  issue_offer_price: number;
  discount_from_announcement_price: number;
  allocated_shares: number;
  allocation_deal_size_percentage: number;
  am_buy_shares: number;
  average_am_px: number;
  last_price_t1: number;
  t1d_open: number;
  t1d_high: number;
  t1d_low: number;
  t1d_return_from_bloomberg: number;
  daily_long_exposure: number;
  pnl: number;
  subscription_bid_shares: number;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const numberFormatter1 = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 0,
});

export const formatNumber = (value: number): string => {
  const absValue = Math.abs(value);
  if (absValue >= 1e9) return `${(absValue / 1e9).toFixed(0)}B`;
  if (absValue >= 1e6) return `${(absValue / 1e6).toFixed(0)}M`;
  if (absValue >= 1e3) return `${(absValue / 1e3).toFixed(0)}K`;
  return absValue.toString();
};

export const dealGridColumns: GridColDef[] = [
  { field: "first_trade_date", headerName: "TradeDt", flex: 1 },
  { field: "client_symbol", headerName: "Ticker", flex: 1 },
  { field: "custom_group_2", headerName: "Sector", flex: 1 },
  { field: "fo_type", headerName: "Deal Type", flex: 1 ,  renderCell: (params) => params.value != null ? params.value : "-"
},

  {
    field: "deal_size",
    headerName: "Deal Size",
    flex: 1,
    valueFormatter: (params) => formatNumber(params),
  },
  {
    field: "issue_offer_price",
    headerName: "Issue Price",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  {
    field: "discount_from_announcement_price",
    headerName: "% Discount",
    flex: 1,
    valueFormatter: (params) => `${numberFormatter.format(params)}%`,
  },
  {
    field: "subscription_bid_shares",
    headerName: "IOI",
    flex: 1,
    valueFormatter: (params) => numberFormatter1.format(params),
  },
  {
    field: "allocated_shares",
    headerName: "Allocated Shares",
    flex: 1,
    valueFormatter: (params) => numberFormatter.format(params),
  },
  {
    field: "allocation_deal_size_percentage",
    headerName: "Allocation % of deal size",
    flex: 1,
    valueFormatter: (params) => `${numberFormatter.format(params)}%`,
  },
  {
    field: "am_buy_shares",
    headerName: "AM Shares",
    flex: 1,
    valueFormatter: (params) => numberFormatter.format(params),
  },
  {
    field: "average_am_px",
    headerName: "Avg AM Cost Price",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  {
    field: "last_price_t1",
    headerName: "T-1 Close",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  {
    field: "t1d_open",
    headerName: "T+1 Open",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  {
    field: "t1d_high",
    headerName: "T+1 High",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  {
    field: "t1d_low",
    headerName: "T+1 Low",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  {
    field: "last_price_t1",
    headerName: "T+1 Close",
    flex: 1,
    valueFormatter: (params) => currencyFormatter.format(params),
  },
  // {
  //   field: "daily_long_exposure",
  //   headerName: "Exposure as % of LMV",
  //   flex: 1,
  //   valueFormatter: (params) => formatNumber(params),
  // },
  {
    field: "pnl",
    headerName: "P&L",
    flex: 1,
    valueFormatter: (params) => `${numberFormatter1.format(params)}`,
  },
];

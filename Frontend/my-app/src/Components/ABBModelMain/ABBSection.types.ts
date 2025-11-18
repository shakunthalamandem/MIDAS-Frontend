export interface ABBFactsetRecord {
  requestId: string;
  share_price: number | null;
  market_cap: number | null;
  shares_outstanding: number | null;
  currency: string | null;
  percent_free_float: number | null;
  vwap: number | null;
  three_m_adtv_shares: number | null;
  three_m_adtv_local_value: number | null;
  '52_week_high': number | null;
  '52_week_low': number | null;
  // company_description: string | null;
  beta_benchmark: number | null;
  '3m_volatility': number | null;
  rsi_30d: number | null;
  rsi_14d: number | null;
  macd_9d: number | null;
  '10dma': number | null;
  percent_from_52week_high: number | null;
  one_day_performance: number | null;
  fcf_yield_ltm: number | null;
  fcf_dividend_yield: number | null;
  enterprise_value: number | null;
  default_currency: string | null;
  '20_day_volatility': number | null;
  '30_day_volatility': number | null;
  '60_day_volatility': number | null;
  free_float: number | null;
  institutional_percentage: number | null;
  benchmark: string | null;
  benchmark_name: string | null;
  date: string | null;
}

export interface ABBFactsetResponse {
  ticker: string;
  trade_date: string;
  count: number;
  data: ABBFactsetRecord[];
}

export interface ABBSectionProps {
  title: string;
  description: string;
  highlights?: string[];
  factsetData?: ABBFactsetResponse | null;
  loading?: boolean;
  error?: string | null;
}

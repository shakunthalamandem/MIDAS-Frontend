export interface HeadlineRisks {
  aum: number;
  gross_market_value: number;
  gross_market_value_pct: number;
  delta_adj_net_mv: number;
  delta_adj_net_mv_pct: number;
  beta_adj_net_mv: number;
  beta_adj_net_mv_pct: number;
  one_yr_1pct_var: number;
  one_yr_1pct_var_pct: number;
}

export interface HeadlinePnl {
  dtd_pnl: number;
  dtd_pnl_pct: number;
  wtd_pnl: number;
  wtd_pnl_pct: number;
  mtd_pnl: number;
  mtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
}

export interface IndexesComparison {
  one_month_beta_sp: number;
  three_month_beta_sp: number;
  one_month_vol: number;
  one_month_sp_vol: number;
  three_month_vol: number;
  three_month_sp_vol: number;
  ytd_vol: number;
  ytd_sp_vol: number;
  drawdown: number;
  sp_drawdown: number;
}

export interface DashboardData {
  date: string;
  fund: string;
  headline_risks: HeadlineRisks;
  headline_pnl: HeadlinePnl;
  indexes_comparison: IndexesComparison;
}

export interface ChartDataPoint {
  date: string;
  daily_pnl: number;
  cumulative_pnl: number;
}

export interface IndexComparisonChartPoint {
  date: string;
  one_month_beta_sp: number;
  three_month_beta_sp: number;
  one_month_vol: number;
  one_month_sp_vol: number;
  three_month_vol: number;
  three_month_sp_vol: number;
  ytd_vol: number;
  ytd_sp_vol: number;
  drawdown: number;
  sp_drawdown: number;
}

export interface PortfolioResponse {
  max_position_date: string | null;
  portfolios: string[];
}

export interface AttributionItem {
  name: string;
  dtd_pnl: number;
  dtd_pnl_pct: number;
  mtd_pnl: number;
  mtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
  net_exp: number;
  net_exp_pct: number;
  beta_adj_net: number;
  beta_adj_net_pct: number;
}

export type AttributionGroupBy =
  | "analyst"
  | "sector"
  | "industry"
  | "holding_period"
  | "issuer";

export interface TickerItem {
  ticker: string;
  issuer: string;
  analyst: string;
  sector: string;
  industry: string;
  holding_period: string;
  days_hld: number | null;
  dtd_pnl: number;
  dtd_pnl_pct: number;
  mtd_pnl: number;
  mtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
  net_exp: number;
  net_exp_pct: number;
  beta_adj_net: number;
  beta_adj_net_pct: number;
}

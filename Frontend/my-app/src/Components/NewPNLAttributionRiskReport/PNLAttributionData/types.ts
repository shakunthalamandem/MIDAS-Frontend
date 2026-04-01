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
  one_month_beta_russell: number;
  one_month_volatility_1_sp: number;
  six_month_volatility_1_sp: number;
  ytd_volatility_sp: number;
  drawdown_1_sp: number;
}

export interface DashboardData {
  message?: string;
  data_available?: boolean;
  date: string;
  fund: string;
  headline_risks: HeadlineRisks;
  headline_pnl: HeadlinePnl;
  indexes_comparison: IndexesComparison;
}

export interface ChartDataPoint {
  date: string;
  daily_pnl?: number;
  cumulative_pnl?: number;
}

export interface IndexComparisonChartPoint {
  date: string;
  one_month_beta_sp: number;
  one_month_beta_russell: number;
  one_month_volatility_1_sp: number;
  six_month_volatility_1_sp: number;
  ytd_volatility_sp: number;
  drawdown_1_sp: number;
}

export interface PortfolioResponse {
  max_position_date: string | null;
  portfolios: string[];
}

export interface AttributionItem {
  name: string;
  dtd_pnl: number;
  dtd_pnl_pct: number;
  wtd_pnl: number;
  wtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
  net_exp: number;
  net_exp_pct: number;
  beta_adj_net: number;
  beta_adj_net_pct: number;
}

export interface TopBottomPnlTicker {
  ticker: string;
  issuer: string;
  pnl: number;
}

export interface TopBottomMetricTicker {
  ticker: string;
  issuer: string;
  value: number;
}

export interface MetricChartDataPoint {
  date: string;
  value: number;
}

export interface HeadlineMetricValues {
  dtd_value: number;
  dtd_pct: number;
  wtd_value: number;
  wtd_pct: number;
  mtd_value: number;
  mtd_pct: number;
  ytd_value: number;
  ytd_pct: number;
}

export type DashboardCategory =
  | "pnl"
  | "gross_market_value"
  | "delta_adj_net_mv"
  | "beta_adj_net_mv";

export interface TopBottomPnlData {
  date: string;
  fund: string[];
  top_10: TopBottomPnlTicker[];
  bottom_10: TopBottomPnlTicker[];
}

export type AttributionGroupBy =
  | "analyst"
  | "sector"
  | "industry"
  | "holding_period"
  | "issuer";

export interface AttributionAreaDataPoint {
  date: string;
  value: number;
  value_pct: number;
}

export interface AttributionAreaSeries {
  name: string;
  data: AttributionAreaDataPoint[];
}

export interface AttributionAreaChartResponse {
  date: string;
  fund: string[];
  group_by: AttributionGroupBy;
  ytd_pnl: AttributionAreaSeries[];
  net_exp: AttributionAreaSeries[];
  beta_adj_net: AttributionAreaSeries[];
}

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
  wtd_pnl: number;
  wtd_pnl_pct: number;
  ytd_pnl: number;
  ytd_pnl_pct: number;
  net_exp: number;
  net_exp_pct: number;
  beta_adj_net: number;
  beta_adj_net_pct: number;
}

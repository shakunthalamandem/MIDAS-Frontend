// types.ts
export interface DealRecord {
  ticker: string;
  issuer_name: string;
  deal_type: string;
  fo_type: string;
  trade_date: string;
  region: string;
  sector: string;
  deal_size: number | string;
  issue_price: number | string;
  sponsor: string;
  primary_percentage: number | string;
  lead_bank: string;
  discount_from_announcement_price: number | string;
  allocation_as_percentage_of_deal_size: number | string;
  allocation_as_percentage_of_ioi: number | string;
  previous_day_close_price: number | string;
  revenue: number | string;
  revenue_growth: number | string;
  net_profit_margin: number | string;


  // existing predictions
  t1d_pred: string;
  t1d_confidence: number | string;
  t1d_actual_return: number | string;

  t1d_openprice_pred: string;
  t1d_openprice_confidence: number | string;
  t1d_openprice_actual_return: number | string;

  t1w_pred: string;
  t1w_confidence: number | string;
  t1w_actual_return: number | string;

  t1m_pred: string;
  t1m_confidence: number | string;
  t1m_actual_return: number | string;

  // new fields from backend (you said you added 4)
  fs_1w_sentiment: string;
  fs_1m_sentiment: string;
  fs_expected_volatility: number | string;
  fs_confidence_level: number | string;

  one_week_sentiment: string;
  one_month_sentiment: string;
  sentiment_summary: string | { one_week?: string; one_month?: string } | null;
}

export type DealTypeFilter = "IPO" | "FO";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  key: keyof DealRecord | null;
  direction: SortDirection;
}

export interface TickerSelectionPayload {
  ticker: string;
  trade_date: string;
}

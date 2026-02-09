export interface DealInformation {
  ticker?: string;
  pricing_date?: string;
  issue_price?: number;
  deal_size?: number;
  industry?: string;
  shares_offered?: number;
  number_of_shares_outstanding?: number;
  greenshoe?: number;
  bookrunners?: string;
}

export interface TradingDetails {
  current_share_price?: number;
  current_market_cap?: number;
  float_as_percent_shares_outstanding?: number;
  short_interest_as_percent_float?: number;
  volume_30day_average?: number;
  mean_target_price?: number;
  concensus_recomendations?: string;
  percentage_of_52_week_high?: number;
}

export interface SharePricePerformance {
  _1_year_total_return?: number;
  _3_year_total_return?: number;
  ytd_return?: number;
  _6_month_return?: number;
  _3_month_return?: number;
  _1_month_return?: number;
}

export interface ValuationWriteup {
  future_outlook?: string;
  company_overview?: string;
  recent_developments?: string;
}

export interface BusinessDetails {
  strengths?: string;
  weakness?: string;
  management?: string;
  business_highlights?: string;
}

export interface FinancialHighlights {
  total_revenue_current_year?: number;
  total_revenue_previous_year?: number;
  total_revenue_yoy_change?: number;
  gross_profit_current_year?: number;
  gross_profit_previous_year?: number;
  gross_profit_yoy_change?: number;
  operating_income_current_year?: number;
  operating_income_previous_year?: number;
  operating_income_yoy_change?: number;
  net_income_current_year?: number;
  net_income_previous_year?: number;
  net_income_yoy_change?: number;
}

export interface FOWriteUpApiResponse {
  deal_information: DealInformation;
  trading_details: TradingDetails;
  share_price_performance: SharePricePerformance;
  valuation_writeup: ValuationWriteup;
  key_risks: string;
  investment_highlights: string;
  business_details: BusinessDetails;
  financial_highlights: FinancialHighlights;
}

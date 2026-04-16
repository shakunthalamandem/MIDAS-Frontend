const apiUrl = process.env.REACT_APP_API_URL;

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface DealUnifiedRow {
  id: number;
  ticker: string | null;
  pricing_date: string | null;
  issuer_name: string | null;
  region: string | null;
  deal_type: string | null;
  fo_type: string | null;
  ipo_type: string | null;
  sector: string | null;
  deal_captain: string | null;
  lead_bank: string | null;
  deal_size: number | null;
  deal_status: string | null;
  sponsor: string | null;
  primary_percentage: number | null;
  issue_price: number | null;
  discount_from_announcement_price: number | null;
  ioi_amount: number | null;
  ioi_as_percentage_of_deal_size: number | null;
  allocation_amount: number | null;
  allocation_as_percentage_of_deal_size: number | null;
  allocation_as_percentage_of_ioi: number | null;
  launch_date: string | null;
  trade_date: string | null;
  market_cap: number | null;
  _52_week_high: number | null;
  percentage_below_52_week_high: number | null;
  percentage_change_last_7_days: number | null;
  ltm_fcf_yield: number | null;
  ltm_dividend_yield: number | null;
  shares_outstanding: number | null;
  percentage_of_free_float: number | null;
  short_interest: number | null;
  short_interest_percentage_of_deal: number | null;
  _3_month_adtv: number | null;
  _3_month_adtv_shares: number | null;
  beta_snp_500: number | null;
  _3_month_volatility: number | null;
  rsi_14d: number | null;
  rsi_30d: number | null;
  dmi_14d: number | null;
  macd_9d: number | null;
  dma_50: number | null;
  dma_100: number | null;
  times_covered: string | null;
  long_only_allocation_percentage: number | null;
  hedge_allocation_percentage: number | null;
  allocation_concentration_percentage: number | null;
  institutional_allocation_percentage: number | null;
  retail_allocation_percentage: number | null;
  deal_color: string | null;
  gdp_growth: string | null;
  inflation_rate: string | null;
  treasury_rates: string | null;
  t1d_pred: string | null;
  t1d_confidence: number | null;
  t1d_actual_return: number | null;
  t1d_version: string | null;
  t1d_openprice_pred: string | null;
  t1d_openprice_confidence: number | null;
  t1d_open_return: number | null;
  t1d_openprice_actual_return: number | null;
  t1d_openprice_version: string | null;
  t1w_pred: string | null;
  t1w_confidence: number | null;
  t1w_actual_return: number | null;
  t1w_version: string | null;
  t1m_pred: string | null;
  t1m_confidence: number | null;
  t1m_actual_return: number | null;
  t1m_version: string | null;
  revenue: number | null;
  revenue_growth: number | null;
  net_profit_margin: string | null;
  issue_to_previous_day_close: number | null;
  previous_day_close_price: number | null;
  t1d_open_price: number | null;
  t1d_close_price: number | null;
  t1d_low_price: number | null;
  t1d_high_price: number | null;
  t1d_vwap_price: number | null;
  pricing_range_min: number | null;
  pricing_range_max: number | null;
  flag_for_writeup: string | null;
  exchange: string | null;
  expected_listing_date: string | null;
  deal_id: string | null;
  form_editors: string[] | null;
  deal_color_rating: number | null;
  deal_writeup_rating: number | null;
  pricing_date_status: string | null;
  ioi_as_percentage_of_deal_size_status: number | null;
  potential_am_quantity: number | null;
  ioi_dollar_value: number | null;
  fs_ticker: string | null;
  unique_deal_id: string | null;
  sentiment: string | null;
  socialmedia_retail_sentiment: string | null;
  one_week_sentiment: string | null;
  one_month_sentiment: string | null;
  sentiment_summary: string | null;
  sentiment_pdf: string | null;
  few_shot_review: string | null;
  form_owner: string | null;
  form_owner_email: string | null;
  new_form_editors: string[] | null;
  peer_tickers: string[] | null;
  t1d_overall_rating: string | null;
  t1w_overall_rating: string | null;
  t1m_overall_rating: string | null;
  valuation_summary: string | null;
  am_strategy_recommendation: string | null;
  writeup_finalverdict_summary: string | null;
  writeup_ratings: Record<string, unknown> | null;
  writeup_overall_rating: number | null;
  multiple_deal_status: string | null;
  created_at: string;
  updated_at: string;
  [key: string]: unknown;
}

export interface DealsDataListResponse {
  count: number;
  page: number;
  page_size: number;
  results: DealUnifiedRow[];
}

export async function fetchDealsData(
  page = 1,
  pageSize = 50,
  search = ""
): Promise<DealsDataListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    page_size: String(pageSize),
  });
  if (search) params.set("search", search);

  const res = await fetch(`${apiUrl}/api/deals_data/?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch deals data");
  return res.json();
}

export async function fetchDealById(id: number): Promise<DealUnifiedRow> {
  const res = await fetch(`${apiUrl}/api/deals_data/${id}/`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch deal");
  return res.json();
}

export async function createDeal(
  data: Partial<DealUnifiedRow>
): Promise<DealUnifiedRow> {
  const res = await fetch(`${apiUrl}/api/deals_data/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function updateDeal(
  id: number,
  data: Partial<DealUnifiedRow>
): Promise<DealUnifiedRow> {
  const res = await fetch(`${apiUrl}/api/deals_data/${id}/`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(JSON.stringify(err));
  }
  return res.json();
}

export async function deleteDeal(id: number): Promise<void> {
  const res = await fetch(`${apiUrl}/api/deals_data/${id}/?confirm=true`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Delete failed");
  }
}

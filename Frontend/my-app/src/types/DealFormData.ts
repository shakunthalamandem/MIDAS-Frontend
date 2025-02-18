export interface DealFormData {
  company_details: {
    deal_captain: string;
    international_team: string[];
    ticker: string;
    company_name: string;
    description: {
      country: string;
      sector: string;
      industry: string;
    };
    vendor_issuer: string[];
  };
  participation: {
    allocation: {
      amount_usd: number;
      shares: number;
      deal_percentage: number;
      fill_percentage: number;
      days: number;
    };
    b_d_bank: string;
    final_indication: {
      amount_usd: number;
      shares: number;
      deal_percentage: number;
      days: number;
    };
    deal_size: {
      amount_usd: number;
      shares: number;
      company_percentage: number;
      days: number;
    };
    price_local: {
      value: number;
      discount_percentage: number;
      last_close: number;
    };
    initial_range: string;
    deal_colour: string;
    allocation_layout: {
      institutional: number;
      retail: number;
      long_only: number;
      hedge_funds: number;
      local: number;
      international: number;
    };
    allocation_concentration: {
      top_10_percentage: number;
    };
    aftermarket: {
      order: boolean;
      strategy: string;
      target_price_local: {
        value: number;
        percentage_above_issue: number;
      };
      stop_price_local: {
        value: number;
        percentage_below_issue: number;
      };
    };
  };
  background: {
    syndicate: string[];
    pe_vendor: string;
    index_fund_participation: string[];
    recent_earnings_estimate_revision: string;
    recent_positive_news: string;
    vix_elevated: string;
    restrictions: string;
    lock_up: string;
    "%_of_free_float_current_float": {
      percentage_free_float: number;
      pre_deal_free_float_percentage: number;
    };
    short_interest: {
      shares: string;
      dollar_amount: string;
      percentage_of_deal: string;
    };
    shares_outstanding_pre_deal: number;
    market_cap_pre_deal: {
      usd: number;
      chf: number;
    };
    launch_date: string;
    trade_date: string;
    settlement_date: string;
    next_results_date: string;
    club_deal: string;
  };
  performance_statistics: {
    percent_change_on_day: string;
    percent_change_last_7_days: string;
    "52_week_high": number;
    percent_below_52_week_high: string;
    sector_stats_l30d_performance: string;
    sector_stats_correlation: number;
    "3m_adtv_eu_line": {
      usd: string;
      shares: string;
    };
    "3m_adtv_local_line": {
      usd: string;
      shares: string;
    };
    beta_smi: number;
    beta_sx5e: number;
    "1_sigma_block_trading_days_l12m": string;
    "3m_volatility": number;
    rsi_14d: number;
    rsi_30d: number;
    dmi_14d: number;
    macd_9d: number;
    stock_relative_to_ma: {
      "10d": string;
      "20d": string;
      "50d": string;
      "100d": string;
      "200d": string;
    };
  };
  aftermarket_analysis: {
    safety_and_liquidity_check_max_size: string;
    shares_left_to_go_to_expected_allocation: number;
    current_price: string;
    percent_change_from_offer: string;
  };
  monashee_deal_activity: {
    conviction: string;
    monashee_wallcrossing_size_shares: number;
    monashee_wallcrossing_discount_percent: number;
    wallcrossing_invitation_bank: string;
    monashee_reverse_size_shares: number;
    monashee_reverse_discount_percent: number;
    alloc_expected: {
      shares: number;
      deal_percentage: number;
      fill_percentage: number;
      amount_usd: number;
    };
  };
  technical_sentiment_analysis: {
    discount_analysis_v1_percent: number;
    discount_analysis_v2_percent: number;
    demand_analysis_usd: number;
    ltm_fcf_yield: number;
    ltm_dividend_yield: number;
    deal_rating_v2: number;
    block_seasoned: string;
    timing_expected: string;
    clean_up: string;
    primary: string;
    good_register: string;
    positive_liquidity_event: string;
    bank_analyst_coverage: string;
    developed_market: string;
    deal_wallcrossed: string;
    wallcrossing_coverage_percent: number;
    launched_with_reference_to_market: string;
    coverage_estimate_x: number;
    coverage_speed_mins: number;
    lo_allocation_percent: number;
    outsized_anchor: string;
    upsized: string;
    price_vs_v1_model_minus_percent: number;
    price_vs_v1_model_divide_percent: number;
    price_vs_v2_model_minus_percent: number;
    price_vs_v2_model_divide_percent: number;
  };
  historical_transactions: {
    announcement_and_trade_date: string;
    price_discount: number;
    type: string;
    deal_size: {
      usd: number;
      percentage_of_co: number;
      shares_m: string;
    };
    bookrunners: string[];
    primary_secondary: string;
    monashee_demand_alloc_hold_period: string;
    lock_up_date: string;
    performance: {
      open: string;
      close: string;
      "1W": string;
      "1M": string;
    };
    sellers: string[];
  }[];
}

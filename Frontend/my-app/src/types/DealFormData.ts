// src/types/DealFormData.ts

export interface DealFormData {
    deal_captain: string;
    team: string;
    participants: string[];
    ticker: string;
    company: {
      name: string;
      description: string;
    };
    vendor_issuer: string;
    participation: {
      allocation: {
        value: string;
        shares: number;
        percentage_of_deal: string;
        fill: string;
        days: string;
      };
      bd_bank: string;
      final_indication: {
        value: string;
        shares: number;
        percentage_of_deal: string;
        days: string;
      };
      deal_size: {
        value: string;
        shares: number;
        percentage_of_company: string;
        days: string;
      };
      price_local: string;
      discount_to_last_close: string;
      last_close_price: string;
      initial_range: string;
      deal_colour: string;
    };
    use_of_proceeds: string;
    allocation_layout: {
      institutional: string;
      retail: string;
      long_only: string;
      hedge_funds: string;
      local: string;
      international: string;
    };
    allocation_concentration: string;
    aftermarket: {
      order: string;
      strategy: string;
      target_local: string;
      stop_local: string;
    };
    background: {
      syndicate: string[];
      pe_vendor: string;
      index_fund_participation: string;
      recent_earnings_estimate_revision: string;
      recent_positive_news: string;
      vix_elevated: string;
      restrictions: string;
      lock_up: string;
      free_float_percentage: string;
      current_float_percentage: string;
      short_interest: {
        shares: string;
        value: string;
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
      change_on_day: string;
      last_7_days: string;
      "52_week_high": string;
      percentage_below_high: string;
      sector_stats: {
        l30d_performance: string;
        correlation: string;
      };
      "3m_advt_eu": {
        usd: number;
        shares: number;
      };
      "3m_advt_local": {
        usd: number;
        shares: number;
      };
      beta: {
        smi: string;
        sx5e: string;
      };
      volatility_3m: string;
      rsi: {
        "14d": string;
        "30d": string;
      };
      dmi_14d: string;
      macd_9d: string;
      stock_relative_to_ma: string;
    };
    aftermarket_analysis: {
      safety_liquidity_check: string;
      max_size: string;
      shares_left_to_allocation: number;
      current_price: string;
      percentage_change_from_offer: string;
    };
    monashee_deal_activity: {
      conviction: string;
      wallcrossing: {
        size: number;
        discount: string;
        invitation_bank: string;
      };
      reverse: {
        size: number;
        discount: string;
      };
      expected_allocation: {
        shares: number;
        percentage_of_deal: string;
        fill: string;
        value: string;
      };
    };
    technical_sentiment_analysis: {
      discount_analysis: {
        v1: string;
        v2: string;
      };
      demand_analysis: string;
      ltm_fcf_yield: string;
      ltm_dividend_yield: string;
      deal_rating_v2: string;
      block_seasoned: string;
      timing_expected: string;
      clean_up: string;
      primary: string;
      good_register: string;
      positive_liquidity_event: string;
      bank_analyst_coverage: string;
      developed_market: string;
      deal_wallcrossed: string;
      wallcrossing_coverage: string;
      launched_with_market_reference: string;
      coverage_estimate: string;
      coverage_speed: string;
      lo_allocation_percentage: string;
      outsized_anchor: string;
      upsized: string;
      price_comparison: {
        v1_minus: string;
        v1_divide: string;
        v2_minus: string;
        v2_divide: string;
      };
    };
    historical_transactions: Array<{
      announcement_trade_date: string;
      price_discount: string;
      type: string;
      deal_size: {
        usd: string;
        percentage_of_company: string;
        shares: string;
      };
      bookrunners: string[];
      primary_secondary: string;
      monashee_demand_alloc_hold_period: string;
      lock_up_date: string;
      performance: {
        open: string;
        close: string;
        "1w": string;
        "1m": string;
      };
      sellers: string[];
    }>;
  }
  
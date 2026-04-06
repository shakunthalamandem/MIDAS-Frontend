export interface DealData {
  ticker: string;
  issuer_name?: string;
  pricing_date?: string;
  sentiment?: any;
  sentiment_summary?: any;
  ml_results?: any;
  deal_status?: string;
  trade_date?: string;
  unsupervised_summary?: any;
  [key: string]: any;
}

export interface SummaryData {
  upcoming_deals: {
    count: number;
    data: DealData[];
  };
  current_portfolio_deals: {
    count: number;
    data: DealData[];
  };
  recently_traded_deals: {
    count: number;
    data: DealData[];
  };
}

export type CardType = 'upcoming' | 'portfolio' | 'recent';

export interface SignalBoardItem {
  ticker: string;
  issuer_name: string;
  deal_type: string | null;
  deal_status: string | null;
  sector: string | null;
  pricing_date: string | null;
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  insight: string;
  reasoning: string[];
  signal_date: string;
  generated_at: string | null;
}

export interface SignalBoardResponse {
  upcoming_count: number;
  trading_count: number;
  signal_changes: number;
  active_signals: number;
  buy_count: number;
  sell_count: number;
  hold_count: number;
  signals: SignalBoardItem[];
}

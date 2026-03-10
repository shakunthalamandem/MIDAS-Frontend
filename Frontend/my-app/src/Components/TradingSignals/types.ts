export interface FewShotFinalOutlook {
  one_week_sentiment: string;
  one_month_sentiment: string;
  expected_volatility: string;
  confidence_level: string;
}

export interface SentimentSummary {
  one_week?: string;
  one_month?: string;
  // Handle legacy nested format
  sentiment_summary?: {
    one_week?: string;
    one_month?: string;
  };
}

export interface TradingSignalIntelligence {
  ticker: string;
  issuer_name: string;
  deal_type: string;
  trade_date: string;
  fs_ticker: string;
  issue_price: number | string | null;
  sector: string;
  region: string;

  // ML Predictions
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

  // Sentiment
  one_week_sentiment: string;
  one_month_sentiment: string;
  sentiment_summary: SentimentSummary | null;

  // Few-shot
  few_shot_executive_summary: string;
  few_shot_final_outlook: FewShotFinalOutlook;
}

export interface SourceStatus {
  mlModel: boolean;
  aiModel: boolean;
  aiSentiment: boolean;
}

export interface TradingSignalData {
  signal: "BUY" | "SELL" | "HOLD";
  confidence: number;
  insight: string;
  reasoning: string[];
  signal_date: string;
  generated_at: string | null;
}

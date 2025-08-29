


export interface DealWriteUpData {
  id?: number | string;
  ticker: string;
  pricing_date: string;
  deal_type: string;
  average_sector_return?: number | null;
  monashee_score?: number | null;
  valuation?: string;
  differentiated_summary?: string;
  deal_writeup_rating?: number;
}

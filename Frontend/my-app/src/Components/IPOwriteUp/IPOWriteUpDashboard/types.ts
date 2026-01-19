export interface IpoData {
  ticker: string;
  company_name: string;
  sector: string | null;
  region: string | null;
  pricing_date: string | null;
  pricing_range_min: number | null;
  pricing_range_max: number | null;
  exchange: string | null;
  deal_size: number | null;
}

export type FilterType = "upcoming" | "all";

export interface WriteupRatings {
  "deal-info"?: number
  "business-overview"?: number
  "business_overview"?: number
  "key-metrics"?: number
  "key_metrics"?: number
  "financial-highlights"?: number
  "financial_highlights"?: number
  "comps"?: number
  "valuation-analysis"?: number
  "valuation_analysis"?: number
  "red-flag"?: number
  "red_flag"?: number
  "ai_indication"?: number
  "ai-indication"?: number
}



export interface BasicDealDetails {
  deal_id: string
  unique_deal_id?: string
  ticker: string
  pricing_date?: string
  region: string
  writeup_ratings?: WriteupRatings
  deal_type: 'IPO' | 'FO'
  company_name?: string
  issuer_name?: string
  exchange?: string
}



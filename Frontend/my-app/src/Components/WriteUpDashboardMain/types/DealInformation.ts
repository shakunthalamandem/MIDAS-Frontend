export interface BasicDealDetails {
  deal_id: number
  ticker: string
  pricing_date?: string
  region: string
  deal_type: 'IPO' | 'FO'
}



export interface TickerOption {
  ticker: string;
  pricing_date: string;
}

export interface SelectedOption extends TickerOption {
  create?: boolean;
}

export interface FormData {
  deal_information: Record<string, any>;
  deal_allocations: Record<string, any>;
  market_data: Record<string, any>;
  technical_market_data: Record<string, any>;
  deal_color: Record<string, any>;
}

export interface FormSectionProps {
  data: Record<string, any>;
  editable: boolean;
  onChange: (data: Record<string, any>) => void;
}
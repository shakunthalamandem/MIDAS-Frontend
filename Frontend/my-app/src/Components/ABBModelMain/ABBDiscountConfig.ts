export interface DiscountFormValues {
  ticker: string;
  tradeDate: string;
  seasoned: string;
  timing: string;
  cleanUp: string;
  primary: string;
  emergingMkt: string;
  blockDealShares: string;
  blockDealPercentageOfMarketCap: string;
  blockDealValueLocal: string;
  blockDealValueDollar: string;
}

export const discountFields: Array<{
  key: keyof Omit<DiscountFormValues, 'ticker' | 'tradeDate'>;
  label: string;
}> = [
  { key: 'seasoned', label: 'Seasoned' },
  { key: 'timing', label: 'Timing' },
  { key: 'cleanUp', label: 'Clean Up' },
  { key: 'primary', label: 'Primary' },
  { key: 'emergingMkt', label: 'Emerging mkt' },
];

export const blockDealFields: Array<{
  key: keyof DiscountFormValues;
  label: string;
}> = [
  { key: 'blockDealShares', label: 'Block Deal Shares' },
  { key: 'blockDealPercentageOfMarketCap', label: 'Block Deal % of Mkt Cap' },
  { key: 'blockDealValueLocal', label: 'Block Deal Local Value' },
  { key: 'blockDealValueDollar', label: 'Block Deal Dollar Value' },
];

export const yesNoOptions = ['Yes', 'No'] as const;

export const formFieldBase = {
  background: 'transparent',
  borderRadius: 0,
  '& .MuiInput-root': {
    fontSize: '0.95rem',
    '&:before': {
      borderBottomColor: 'rgba(2,32,96,0.25)',
    },
    '&:after': {
      borderBottomColor: 'rgba(0,90,255,0.95)',
    },
  },
  '& .MuiInput-root.Mui-focused:after': {
    borderBottomColor: 'rgba(0,90,255,0.95)',
  },
};

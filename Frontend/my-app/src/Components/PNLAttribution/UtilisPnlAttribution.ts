export interface FundData {
  asset_type: string;
  [month: string]: number | string;
}

export interface AssetTypeData {
  [fundName: string]: FundData;
}

export interface ApiResponse {
  [assetType: string]: AssetTypeData;
}

 

  export const formatNumber = (value: number | string) => {
  if (typeof value !== "number") return value; 

  const absValue = Math.abs(value);  
  let formatted: string;

  if (absValue >= 1e9) formatted = `$${(absValue / 1e9).toFixed(1)}B`;
  else if (absValue >= 1e6) formatted = `$${(absValue / 1e6).toFixed(1)}M`;
  else if (absValue >= 1e3) formatted = `$${(absValue / 1e3).toFixed(1)}K`;
  else formatted = `$${absValue.toFixed(2)}`;

  if (value < 0) {
    return `$ -${formatted.slice(2)}`;
  }

  return formatted;  
};

export interface StrategyData {
  custom_group1?: string;
  custom_group2?: string;
  broad_region?: string;
  total: number;
}

export interface PnlTablesData {
  [key: string]: {
    top_5_strategies: StrategyData[];
    bottom_5_strategies: StrategyData[];
  };
}

// MDRDailyPortfolioTypes.ts

export interface MDRDailyPortfolioRow {
  id: string;
  ticker: string;
  dealType: string;
  dealCaptain: string;
  daysHeld: number;
  currentShares: number;
  currentExposure: number;
  maxPercent: number | null;
  grossPercent: number | null;
  excessReturnPercent: number | null;
  dtdPnl: number;
  cumulativeGrossPnl: number;
  cumulativeNetPnl: number;
  issuePrice: number;
  avgInPrice: number;
  avgExitPrice: number | null;
  currentPrice: number | null;
  ultimateStop: number | null;
  targetPrice: number | null;
  firstTradeDate: string;
}

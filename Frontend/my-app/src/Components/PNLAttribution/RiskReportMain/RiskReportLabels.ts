// src/constants/RiskReportLabels.ts

export const RISK_REPORT_LABELS: Record<string, string> = {
  // Section 1
  LMV: "LMV",
  Net_of_Hedge_PnL: "Net of Hedge P&L",
  Net_of_Hedge_PnL_Percent: "Net of Hedge P&L (%)",
  SP_Total_Return_Percent: "S&P Total Return (%)",
  MSCI_Return_Percent: "MSCI Return (%)",
  BetaAdj_NetExp_LMV_Percent: "BetaAdj.NetExp./LMV (%)",
  OneYr_1Percent_VaR_Percent_of_LMV: "1Yr 1% VaR (% of LMV)",

  // Section 2
  MTD_Net_of_Hedge_PnL: "MTD Net of Hedge P&L",
  MTD_Net_of_Hedge_PnL_Percent: "MTD Net of Hedge P&L (%)",
  YTD_Net_of_Hedge_PnL: "YTD Net of Hedge P&L",
  YTD_Net_of_Hedge_PnL_Percent: "YTD Net of Hedge P&L (%)",
  ITD_Net_of_Hedge_PnL: "ITD Net of Hedge P&L",
  ITD_Return_on_LMV_Percent: "ITD Return on LMV (%)",
  ITD_LMV_Daily_Avg: "ITD LMV Daily Avg",

  // Section 3
  Trailing_1M_Beta_wrt_SPXT: "Trailing 1M Beta w.r.t SPXT",
  Trailing_3M_Beta_wrt_SPXT: "Trailing 3M Beta w.r.t SPXT",
  YTD_Beta_wrt_SPXT: "YTD Beta w.r.t SPXT",
  ITD_Beta_wrt_SPXT: "ITD Beta w.r.t SPXT",
  Trailing_1M_Beta_wrt_MSCI: "Trailing 1M Beta w.r.t MSCI",
  Trailing_3M_Beta_wrt_MSCI: "Trailing 3M Beta w.r.t MSCI",
  YTD_Beta_wrt_MSCI: "YTD Beta w.r.t MSCI",
  ITD_Beta_wrt_MSCI: "ITD Beta w.r.t MSCI",
  YTD_SPXT_Volatility: "YTD SPXT Volatility",
  ITD_SPXT_Volatility: "ITD SPXT Volatility",

  // Section 4
  YTD_Volatility: "YTD Volatility",
  ITD_Volatility: "ITD Volatility",
  MTD_Daily_LMV_Avg: "MTD Daily LMV Avg",
  YTD_LMV_Daily_Avg: "YTD LMV Daily Avg",
  ITD_SPXT_Return_Percent: "ITD SPXT Return (%)",
  ITD_Annualized_Returns: "ITD Annualized Returns",
};

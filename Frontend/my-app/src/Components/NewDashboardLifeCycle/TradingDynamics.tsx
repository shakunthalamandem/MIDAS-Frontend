import React, { useMemo } from "react";
import { Box, Grid } from "@mui/material";
import AIMLDealDetails from "./AIMLDealDetails";
import DealPricesChart from "../AIMLResults/DealPricesChart";
import TradingViewWidget from "../Main/InvestmentStrategy/Tradingview/TradingViewWidget";
import TrendlyneQVTWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneQVTWidget";
import TrendlyneWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneWidget";
import TrendlyneTechnicalWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneTechnicalWidget";
import TrendlyneChecklistWidget from "../Main/InvestmentStrategy/Tradingview/TrendlyneChecklistWidget";

interface TradingDynamicsProps {
  ticker: string;
  trade_date?: string;
}

const WIDGET_CLASS =
  "flex-1 overflow-x-auto bg-white border border-blue-200 shadow-md rounded-xl p-6 h-[580px]";

const TradingDynamics: React.FC<TradingDynamicsProps> = ({
  ticker,
  trade_date,
}) => {
  const widgetTicker = useMemo(
    () => (ticker || "").replace(/\s*US\b/i, "").trim() || ticker,
    [ticker]
  );

  return (
    <Box>
      <AIMLDealDetails ticker={ticker} />

      <Box sx={{ mt: 3 }}>
        <TradingViewWidget ticker={ticker} />
      </Box>

      <Box sx={{ mt: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TrendlyneQVTWidget
              companyCode={widgetTicker}
              companyName={widgetTicker}
              className={WIDGET_CLASS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TrendlyneWidget
              companyCode={widgetTicker}
              companyName={widgetTicker}
              className={WIDGET_CLASS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TrendlyneTechnicalWidget
              companyCode={widgetTicker}
              className={WIDGET_CLASS}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TrendlyneChecklistWidget
              companyCode={widgetTicker}
              companyName={widgetTicker}
              className={WIDGET_CLASS}
            />
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 3 }}>
        <DealPricesChart ticker={ticker} trade_date={trade_date} />
      </Box>
    </Box>
  );
};

export default TradingDynamics;

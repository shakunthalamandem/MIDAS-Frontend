import React, { useState } from "react";
import TickerDropdown from "../Tradingview/TickerDropdown";
import TradingViewWidget from "../Tradingview/TradingViewWidget";
import { Box, Container, Typography, Grid } from "@mui/material";
import MacdCharts from "./MacdCharts";
import RsiMain from "./RsiMain";
import TradingViewData from "../Tradingview/TradingViewData";
import CompanyDetails from "./CompanyDetails";
import VolumeChart from "./VolumeChart";
import VolatilityChart from "./VolatilityChart";

const TechnicalMain = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [ticker, setTicker] = useState<string>("");

  // Handle ticker selection
  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setTicker(ticker);
  };

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
        <Typography variant="h4" style={{ color: "#002060", fontWeight: "bold" }}>
          Technical Analysis
        </Typography>
        <TickerDropdown onSelectTicker={handleTickerSelect} />

        {ticker && <TradingViewData ticker={ticker} />}
        {selectedTicker && <CompanyDetails ticker={selectedTicker} />}


        {/* TradingView Widget */}
        {selectedTicker && <TradingViewWidget ticker={selectedTicker} />}

        {/* MACD Chart */}
        {selectedTicker && <MacdCharts ticker={selectedTicker} />}

        {/* Display RSI and Volume side by side */}
        {selectedTicker && (
          <Grid container spacing={2} sx={{ marginTop: 3 }}>
            <Grid item xs={12} sm={6}>
              <RsiMain ticker={selectedTicker} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <VolumeChart ticker={selectedTicker} />
            </Grid>
          </Grid>
        )}

        {/* Company Details */}
        {selectedTicker && <VolatilityChart ticker={selectedTicker} />}
      </Box>
    </Container>
  );
};

export default TechnicalMain;

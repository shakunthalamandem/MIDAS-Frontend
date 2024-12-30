import React, { useState } from "react";
import TickerDropdown from "../Tradingview/TickerDropdown";
import TradingViewWidget from "../Tradingview/TradingViewWidget";
import { Box, Container, Typography } from "@mui/material";
import MacdCharts from "./MacdCharts";
import RsiMain from "./RsiMain";
import TradingViewData from "../Tradingview/TradingViewData";
import CompanyDetails from "./CompanyDetails";

const TechnicalMain = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>("");
  const [ticker, setTicker] = useState<string>("");


  // Handle ticker selection
  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker);
    setTicker(ticker);

  };

  return (
    <>
      <Container maxWidth="lg" sx={{ paddingY: 4 }}>
        <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
          <Typography
            variant="h4"
            style={{ color: "#002060", fontWeight: "bold" }}
          >
            Technical Analysis
          </Typography>
          <TickerDropdown onSelectTicker={handleTickerSelect} />
          {ticker && <TradingViewData ticker={ticker} />}

          {/* <TradingViewWidget /> */}
          {selectedTicker && <TradingViewWidget ticker={selectedTicker} />}

          {selectedTicker && <MacdCharts ticker={selectedTicker} />}
          {selectedTicker && <RsiMain ticker={selectedTicker} />}
          {selectedTicker && <CompanyDetails ticker={selectedTicker} />}




        </Box>
      </Container>
    </>
  );
};

export default TechnicalMain;

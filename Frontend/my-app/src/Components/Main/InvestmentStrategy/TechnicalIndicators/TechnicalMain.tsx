import React, { useState } from "react";
import TickerDropdown from "../Tradingview/TickerDropdown";
import TradingViewWidget from "../Tradingview/TradingViewWidget";
import { Box, Container, Typography } from "@mui/material";
import MacdCharts from "./MacdCharts";

const TechnicalMain = () => {
  const [selectedTicker, setSelectedTicker] = useState<string>("");

  // Handle ticker selection
  const handleTickerSelect = (ticker: string) => {
    setSelectedTicker(ticker);
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
          <TradingViewWidget />
          {selectedTicker && <MacdCharts ticker={selectedTicker} />}
        </Box>
      </Container>
    </>
  );
};

export default TechnicalMain;

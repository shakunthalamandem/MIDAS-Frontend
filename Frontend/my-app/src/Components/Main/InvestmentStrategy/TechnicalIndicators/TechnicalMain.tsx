import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TickerDropdown from "../Tradingview/TickerDropdown";
import TradingViewWidget from "../Tradingview/TradingViewWidget";
import { Box, Container, Typography, Grid } from "@mui/material";
import MacdCharts from "./MacdCharts";
import RsiMain from "./RsiMain";
import TradingViewData from "../Tradingview/TradingViewData";
import CompanyDetails from "./CompanyDetails";
import VolumeChart from "./VolumeChart";
import VolatilityChart from "./VolatilityChart";
import FundamentalMetricsCard from "../Tabs/FundamentalMetricsCard";

const TechnicalMain = () => {
  const { ticker } = useParams();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(ticker || "");

  useEffect(() => {
    if (ticker) {
      setSelectedTicker(ticker);
    }
  }, [ticker]);

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
        {/* Header section with title and dropdown */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h4" style={{ color: "#002060", fontWeight: "bold" }}>
            Technical Analysis
          </Typography>
          {selectedTicker && <TickerDropdown onSelectTicker={setSelectedTicker} />}
        </Box>

        {selectedTicker && (
          <>
            {/* TradingViewData and CompanyDetails side by side */}
            <Grid container spacing={2} sx={{ marginTop: 3 }}>
              <Grid item xs={12} md={6}>
                <TradingViewData ticker={selectedTicker} />
              </Grid>
              <Grid item xs={12} md={6}>
                <CompanyDetails ticker={selectedTicker} />
              </Grid>
            </Grid>

            <TradingViewWidget ticker={selectedTicker} />
            <FundamentalMetricsCard ticker={selectedTicker} />
            <MacdCharts ticker={selectedTicker} />

            {/* RSI and Volume side by side */}
            <Grid container spacing={2} sx={{ marginTop: 3 }}>
              <Grid item xs={12} sm={6}>
                <RsiMain ticker={selectedTicker} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VolumeChart ticker={selectedTicker} />
              </Grid>
            </Grid>

            <VolatilityChart ticker={selectedTicker} />
          </>
        )}
      </Box>
    </Container>
  );
};

export default TechnicalMain;

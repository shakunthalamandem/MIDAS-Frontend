import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // Import useParams from react-router-dom
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
  const { ticker } = useParams(); // Get ticker from URL parameters
  const [selectedTicker, setSelectedTicker] = useState<string | null>(ticker || ""); // Initialize selectedTicker with the URL parameter or empty string

  useEffect(() => {
    if (ticker) {
      setSelectedTicker(ticker); // Update the selectedTicker if the URL ticker changes
    }
  }, [ticker]); // Effect runs whenever the ticker parameter changes

  return (
    <Container maxWidth="lg" sx={{ paddingY: 4 }}>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
        <Typography variant="h4" style={{ color: "#002060", fontWeight: "bold" }}>
          Technical Analysis
        </Typography>
        {/* Display ticker dropdown only if no ticker is selected */}
        {!selectedTicker && <TickerDropdown onSelectTicker={setSelectedTicker} />}

        {selectedTicker && (
          <>
            <TradingViewData ticker={selectedTicker} />
            <TradingViewWidget ticker={selectedTicker} />

            <FundamentalMetricsCard ticker={selectedTicker} />
            <MacdCharts ticker={selectedTicker} />

            {/* Display RSI and Volume side by side */}
            <Grid container spacing={2} sx={{ marginTop: 3 }}>
              <Grid item xs={12} sm={6}>
                <RsiMain ticker={selectedTicker} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <VolumeChart ticker={selectedTicker} />
              </Grid>
            </Grid>

            <VolatilityChart ticker={selectedTicker} />
            <CompanyDetails ticker={selectedTicker} />

          </>
        )}
      </Box>
    </Container>
  );
};

export default TechnicalMain;

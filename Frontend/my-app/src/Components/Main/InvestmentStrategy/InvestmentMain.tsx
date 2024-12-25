import React, { useState, useCallback } from "react";
import { Typography, Box } from "@mui/material";
import TabsMain from "./Tabs/TabsMain";
import TickerDropdown from "./Tradingview/TickerDropdown";
import ScreenerJsonData from "./Tabs/ScreenerJsonData";
import TradingViewWidget from "./Tradingview/TradingViewWidget";

const InvestmentMain: React.FC = () => {
  const [filtersData, setFiltersData] = useState<any>(null); // State for storing fetched data
  const [loading, setLoading] = useState<boolean>(true); // Loading state for better UI feedback

  // Memoize the callback to avoid unnecessary re-renders
  const handleDataLoaded = useCallback((data: any) => {
    setFiltersData(data); // Update state when data is fetched
    setLoading(false); // Stop loading when data is received
  }, []);

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          backgroundColor: "#002060",
          padding: 2,
          textAlign: "center",
          marginBottom: 2,
          animation: "fadeInScale 2s ease-out",
          "@keyframes fadeInScale": {
            "0%": { opacity: 0, transform: "scale(0.8)" },
            "100%": { opacity: 1, transform: "scale(1)" },
          },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#FFFFFF",
            fontSize: { xs: "2rem", sm: "2.5rem" },
          }}
        >
          Investment Strategies
        </Typography>
      </Box>

      {/* Fetch Data */}
      <ScreenerJsonData onDataLoaded={handleDataLoaded} />

      {/* Show TabsMain if data is available, else loading */}
      {loading ? (
        <Typography variant="h6" color="textSecondary" align="center">
          Loading filters...
        </Typography>
      ) : (
        <TabsMain filtersData={filtersData} />
      )}

      {/* Additional Components */}
      <Box sx={{ marginTop: 4 }}>
        <TickerDropdown />
      </Box>
      <Box sx={{ marginTop: 4 }}>
        <TradingViewWidget />
      </Box>
    </>
  );
};

export default InvestmentMain;

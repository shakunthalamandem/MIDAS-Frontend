import React, { useState, useCallback } from "react";
import { Typography, Box } from "@mui/material";
import TabsMain from "./Tabs/TabsMain";
import ScreenerJsonData from "./Tabs/ScreenerJsonData";


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
   
          <Typography
        variant="h3"
        sx={{
          fontWeight: "bold",
          color: "#FFFFFF",
          fontSize: { xs: "2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "5vh",
          textAlign: "center",
          marginBottom: "10px",
          animation: "fadeInScale 2s ease-out",
          "@keyframes fadeInScale": {
            "0%": { opacity: 0, transform: "scale(0.8)" },
            "100%": { opacity: 1, transform: "scale(1)" },
          },
        }}
      >
          </Typography>

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
        {/* <TickerDropdown /> */}
      </Box>
      <Box sx={{ marginTop: 4 }}>
        {/* <TradingViewWidget /> */}
        
      </Box>
    </>
  );
};

export default InvestmentMain;

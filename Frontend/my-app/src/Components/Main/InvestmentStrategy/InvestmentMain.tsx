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
          fontWeight: 500, // Semi-bold for better balance
          color: "#FFFFFF", // White text
          fontSize: { xs: "1rem", sm: "1.2rem" }, // Adaptive font size for different screen sizes
          backgroundColor: "#002060", // Navy background
          display: "flex",
          alignItems: "center", // Vertically center the text
          justifyContent: "center", // Horizontally center the text
          height: "4vh", // Adjust height for a larger appearance
          padding: "8px 16px", // Add padding for better spacing
          borderRadius: "8px", // Rounded edges for a modern look
          textAlign: "center", // Ensure the text remains centered
          marginBottom: "20px", // Margin for spacing below the component
          "@keyframes fadeInScale": {
            "0%": { opacity: 0, transform: "scale(0.8)" },
            "100%": { opacity: 1, transform: "scale(1)" },
          },
        }}
      >
         Last Three years Moanshee participated  Deal Information for PRIME Investment Strategies
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

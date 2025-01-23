import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import SkewTableMain from "../../MonasheeGraphs/SkewTableMain";
import ScreenerMain from "../../MonasheeGraphs/ScreenerTable/ScreenerMain";
import MarketFilters from "../../MonasheeCapitalMarkets/MarketFilters";
import GlobalDealSearch from "../../MonasheeGraphs/DealSearch";

const CapitalMarkets: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500, // Semi-bold for better balance
          color: "#FFFFFF", // White text
          fontSize: { xs: "1rem", sm: "1.2rem" }, // Adaptive font size for different screen sizes
          backgroundColor: "#002060", // Navy background
          display: "flex",
          alignItems: "center", // Vertically center the text
          justifyContent: "center", // Horizontally center the text
          height: "4vh", // Adjust height for a slimmer appearance
          padding: "8px 16px", // Add padding for better spacing
          borderRadius: "8px", // Rounded edges for a modern look
          textAlign: "center", // Ensure the text remains centered
          marginBottom: "10px", // Margin for spacing below the component

          // Add subtle shadow for depth
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",

          // Add a smooth fade-in animation
          animation: "fadeIn 1.5s ease-in-out",

          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to Capital Markets! Explore deals and uncover statistics from the global market with ease.
      </Typography>
        <Tabs
          value={value}
          onChange={handleChange}
          centered
          TabIndicatorProps={{
            style: {
              display: "none", // This removes the default underline (bottom line)
            },
          }}
          sx={{
            "& .MuiTab-root": {
              borderRadius: "8px",
              padding: "6px 16px", // Reduced padding to reduce the height of the tabs
              fontSize: "0.9rem", // Smaller font size
              fontWeight: "bold",
              transition: "background-color 0.3s ease, transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
                background: "rgba(0, 0, 0, 0.08)",
                color: "#000000",
              },
            },
            height: "40px", // You can also set a fixed height for the tabs
          }}
        >
            <Tab
            label="Deal Search"
            sx={{
              backgroundColor: value === 0 ? "#9C27B0" : "#f5f5f5",
              color: value === 0 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#9C27B0",
                color: "#fff",
              },
            }}
          />
               <Tab
            label="Deal Stats"
            sx={{
              backgroundColor: value === 1 ? "#9C27B0" : "#f5f5f5",
              color: value === 1 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#9C27B0",
                color: "#fff",
              },
            }}
          />
{/*           
          <Tab
            label="Deal Count"
            sx={{
              backgroundColor: value === 2 ? "#FF5722" : "#f5f5f5",
              color: value === 2 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#FF5722",
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Deal Volume"
            sx={{
              backgroundColor: value === 3 ? "#4CAF50" : "#f5f5f5",
              color: value === 3 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#4CAF50",
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Opportunity Value Excess"
            sx={{
              backgroundColor: value === 4 ? "#3F51B5" : "#f5f5f5",
              color: value === 4 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#3F51B5",
                color: "#fff",
              },
            }}
          /> */}
  
          <Tab
            label="Skew Table"
            sx={{
              backgroundColor: value === 2 ? "#9C27B0" : "#f5f5f5",
              color: value === 2 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#9C27B0",
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Deal Filter"
            sx={{
              backgroundColor: value === 3 ? "#FF9800" : "#f5f5f5",
              color: value === 3 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#FF9800",
                color: "#fff",
              },
            }}
          />
       
        </Tabs>
        {value === 0 && <GlobalDealSearch />}
        {value === 1 && <MarketFilters />}
        {/* {value === 2 && <DealGraph />}
        {value === 3 && <DealVolume />}
        {value === 4 && <OpportunityMain />} */}
        {value === 2 && <SkewTableMain />}
        {value === 3 && <ScreenerMain />}

      </Box>
    </>
  );
};

export default CapitalMarkets;

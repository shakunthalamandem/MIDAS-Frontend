import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import DealGraph from "../../MonasheeGraphs/DealGraph";
import DealVolume from "../../MonasheeGraphs/DealVolume";
import OpportunityMain from "../../MonasheeGraphs/OpportunityMain";
import OpportunityAbsBasis from "../../MonasheeGraphs/OpportunityAbsBasis";
import SkewTableMain from "../../MonasheeGraphs/SkewTableMain";
import ScreenerMain from "../../MonasheeGraphs/ScreenerTable/ScreenerMain";
import DealSearch from "../../MonasheeGraphs/DealSearch";

const CapitalMarkets: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
      <Typography
  variant="h3"
  sx={{
    fontWeight: "bold",
    color: "#FFFFFF", // Text color is now white
    fontSize: { xs: "2rem" },
    backgroundColor: "#002060", // Matching navbar color for the background
    display: "flex",
    alignItems: "center", // Vertically center the text
    justifyContent: "center", // Horizontally center the text
    height: "5vh", // Full viewport height
    textAlign: "center", // Ensure text is centered
    marginBottom: '10px', // Remove any default margins

    // Add animation
    animation: "fadeInScale 2s ease-out",

    "@keyframes fadeInScale": {
      "0%": { opacity: 0, transform: "scale(0.8)" },
      "100%": { opacity: 1, transform: "scale(1)" },
    },
  }}
>
  Capital Markets
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
            label="Deal Count"
            sx={{
              backgroundColor: value === 1 ? "#FF5722" : "#f5f5f5",
              color: value === 1 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#FF5722",
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Deal Volume"
            sx={{
              backgroundColor: value === 2 ? "#4CAF50" : "#f5f5f5",
              color: value === 2 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#4CAF50",
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Opportunity Value Excess"
            sx={{
              backgroundColor: value === 3 ? "#3F51B5" : "#f5f5f5",
              color: value === 3 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#3F51B5",
                color: "#fff",
              },
            }}
          />
  
          <Tab
            label="Skew Table"
            sx={{
              backgroundColor: value === 4 ? "#9C27B0" : "#f5f5f5",
              color: value === 4 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#9C27B0",
                color: "#fff",
              },
            }}
          />
          <Tab
            label="Deal Filter"
            sx={{
              backgroundColor: value === 5 ? "#FF9800" : "#f5f5f5",
              color: value === 5 ? "#fff" : "#777",
              "&.Mui-selected": {
                backgroundColor: "#FF9800",
                color: "#fff",
              },
            }}
          />
        </Tabs>
        {value === 0 && <DealSearch />}
        {value === 1 && <DealGraph />}
        {value === 2 && <DealVolume />}
        {value === 3 && <OpportunityMain />}
        {value === 4 && <SkewTableMain />}
        {value === 5 && <ScreenerMain />}
      </Box>
    </>
  );
};

export default CapitalMarkets;

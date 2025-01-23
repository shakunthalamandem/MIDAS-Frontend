import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import MDDScreener from "../../MonasheeDeals/MddGraphs/MDDScreener";
import AllocationCaptureReturn from "../../MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import FOllowOnDiscount from "../../MonasheeDeals/MddGraphs/FOllowOnDiscount";
import MDDDealSearch from "../../MonasheeDeals/MddGraphs/MDDDealSearch";
import DealStats from "../../MonasheeDeals/MddGraphs/DealStats";

const MonasheeDeals: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
      {/* Heading */}
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
    height: "4vh", // Adjust height for a larger appearance
    padding: "8px 16px", // Add padding for better spacing
    borderRadius: "8px", // Rounded edges for a modern look
    textAlign: "center", // Ensure the text remains centered
    marginBottom: "20px", // Margin for spacing below the component

    // Add subtle shadow for depth
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",

    // Add a smooth fade-in animation
    animation: "fadeIn 2s ease-out",

    "@keyframes fadeIn": {
      "0%": { opacity: 0, transform: "translateY(-10px)" },
      "100%": { opacity: 1, transform: "translateY(0)" },
    },
  }}
>
  Welcome to Monashee Participated Deals Dashboard! Explore valuable insights into the deals you've actively participated in across the global market.
</Typography>


      {/* Tabs */}
      <Tabs
        value={value}
        onChange={handleChange}
        centered
        TabIndicatorProps={{
          style: { display: "none" },
        }}
        sx={{
          display: "flex",
          justifyContent: "center",
          margin: "10px 0",
          "& .MuiTab-root": {
            backgroundColor: "#E3E6F0", // Neutral background for unselected tabs
            color: "#002060", // Dark blue text for contrast
            borderRadius: "12px",
            padding: "10px 20px",
            fontSize: "0.9rem",
            fontWeight: "600",
            margin: "0 5px",
            textTransform: "none", // Avoid all caps
            transition: "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
            "&:hover": {
              backgroundColor: "#DCE6F0", // Slightly lighter shade on hover
              transform: "translateY(-2px)",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#FF8C00", // Vibrant orange for selected tab
            color: "#ffffff !important", // White text for selected tab
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // Stronger shadow for selected tab
          },
        }}
      >
        <Tab label="Deal Search" />
        <Tab label="DealStats"/>
        <Tab label="Allocation Capture" />
        <Tab label="Follow-On Discount" />
        <Tab label="Screener" />
      </Tabs>

      {/* Tab Content */}
      {value === 0 && <MDDDealSearch />}
      {value === 1 && <DealStats />}
      {value === 2 && <AllocationCaptureReturn />}
      {value === 3 && <FOllowOnDiscount />}
      {value === 4 && <MDDScreener />}
      
    </Box>
  );
};

export default MonasheeDeals;

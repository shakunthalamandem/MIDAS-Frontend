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
            color: "#ffffff", // White text for selected tab
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // Stronger shadow for selected tab
            transform: "translateY(-2px)", // Lifted effect
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

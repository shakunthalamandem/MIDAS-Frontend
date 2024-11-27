import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import DealAllocation from "../../MonasheeDeals/MddGraphs/DealAllocation";
import DealMDDIOI from "../../MonasheeDeals/MddGraphs/DealMDDIOI";
import AvgDealSize from "../../MonasheeDeals/MddGraphs/AvgDealSize";
import MDDScreener from "../../MonasheeDeals/MddGraphs/MDDScreener";
import AllocationCaptureReturn from "../../MonasheeDeals/MddGraphs/AllocationCaptureReturn";
import FOllowOnDiscount from "../../MonasheeDeals/MddGraphs/FOllowOnDiscount";
import DealCount from "../../MonasheeDeals/MddGraphs/DealCount";
import DealVolumeMDD from "../../MonasheeDeals/MddGraphs/DealVolumeMDD";

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
        Monashee Deals
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
          "& .MuiTab-root": {
            borderRadius: "8px",
            padding: "6px 16px",
            fontSize: "0.8rem", // Adjusted for shorter labels
            fontWeight: "bold",
            transition: "background-color 0.3s ease, transform 0.3s ease",
            "&:hover": {
              transform: "scale(1.05)",
              background: "rgba(0, 0, 0, 0.08)",
              color: "#000000",
            },
          },
          height: "40px",
        }}
      >
        <Tab
          label="Deals"
          sx={{
            backgroundColor: value === 0 ? "#FF5722" : "#f5f5f5",
            color: value === 0 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#FF5722",
              color: "#fff",
            },
          }}
        />
        <Tab
          label="Volume"
          sx={{
            backgroundColor: value === 1 ? "#4CAF50" : "#f5f5f5",
            color: value === 1 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#4CAF50",
              color: "#fff",
            },
          }}
        />
        <Tab
          label="Avg Size"
          sx={{
            backgroundColor: value === 2 ? "#3F51B5" : "#f5f5f5",
            color: value === 2 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#3F51B5",
              color: "#fff",
            },
          }}
        />
        <Tab
          label="Allocation % DealSize"
          sx={{
            backgroundColor: value === 3 ? "#00BCD4" : "#f5f5f5",
            color: value === 3 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#00BCD4",
              color: "#fff",
            },
          }}
        />
        <Tab
          label="Allocation % IOI"
          sx={{
            backgroundColor: value === 4 ? "#9C27B0" : "#f5f5f5",
            color: value === 4 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#9C27B0",
              color: "#fff",
            },
          }}
        />
        {/* <Tab
          label="Allocation Capture"
          sx={{
            backgroundColor: value === 5 ? "#FF9800" : "#f5f5f5",
            color: value === 5 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#FF9800",
              color: "#fff",
            },
          }}
        /> */}
        <Tab
          label="FOllow On Discount"
          sx={{
            backgroundColor: value === 6 ? "#8BC34A" : "#f5f5f5",
            color: value === 6 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#8BC34A",
              color: "#fff",
            },
          }}
        />
        <Tab
          label="Screener"
          sx={{
            backgroundColor: value === 7 ? "#9E9E9E" : "#f5f5f5",
            color: value === 7 ? "#fff" : "#777",
            "&.Mui-selected": {
              backgroundColor: "#9E9E9E",
              color: "#fff",
            },
          }}
        />
      </Tabs>

      {/* Tab Content */}
      {value === 0 && <DealCount />}
      {value === 1 && <DealVolumeMDD />}
      {value === 2 && <AvgDealSize />}
      {value === 3 &&  <DealAllocation />}
      {value === 4 &&  <DealMDDIOI />}
      {value === 5 && <AllocationCaptureReturn />}
      {value === 6 && <FOllowOnDiscount />}
      {value === 7 && <MDDScreener />}
    </Box>
  );
};

export default MonasheeDeals;

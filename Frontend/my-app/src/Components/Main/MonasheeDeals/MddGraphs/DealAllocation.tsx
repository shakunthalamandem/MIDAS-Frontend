import React from "react";
import MddMain from "../MDDSettings/MddMain";
import { Typography, Box } from "@mui/material";

const DealAllocation = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh" // Ensures full-page centering
      textAlign="center"
    >
      <Typography 
        variant="h4" 
        sx={{ fontWeight: "bold", color: "#002060" }}
      >
        Deal Allocation
      </Typography>
      <MddMain apiName="mdd_allocation_percentage" />
    </Box>
  );
};

export default DealAllocation;

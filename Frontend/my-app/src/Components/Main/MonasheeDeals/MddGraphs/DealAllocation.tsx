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
      marginTop={10}
      textAlign="center"
    >
      <Typography 
        variant="h5" 
        sx={{ fontWeight: "bold", color: "#002060" }}
      >
        Allocation % of Deal Size      </Typography>
      <MddMain apiName="mdd_allocation_percentage" />
    </Box>
  );
};

export default DealAllocation;

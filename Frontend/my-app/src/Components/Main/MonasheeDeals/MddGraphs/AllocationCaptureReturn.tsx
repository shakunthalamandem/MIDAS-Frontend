import React from "react";
import MddMain from "../MDDSettings/MddMain";
import { Typography, Box } from "@mui/material";
const AllocationCaptureReturn = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
      sx={{ width: "100%", overflow: "hidden", position: "relative" }}
    >
        
      <MddMain apiName="gap_analysis" />
    </Box>
  );
};
export default AllocationCaptureReturn;
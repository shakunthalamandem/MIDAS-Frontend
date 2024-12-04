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
      marginTop={15}
      textAlign="center"
    >
      <Typography 
        variant="h4" 
        sx={{ fontWeight: "bold", color: "#002060" }}
      >
        Allocation Graph
      </Typography>
      <MddMain apiName="allocation_capture" />
    </Box>
  );
};

export default AllocationCaptureReturn;

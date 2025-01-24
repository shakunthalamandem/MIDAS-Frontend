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
    >
      <MddMain apiName="allocation_capture" />
    </Box>
  );
};

export default AllocationCaptureReturn;

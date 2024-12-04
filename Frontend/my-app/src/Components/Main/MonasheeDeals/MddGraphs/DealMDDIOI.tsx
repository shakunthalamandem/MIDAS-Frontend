import React from "react";
import MddMain from "../MDDSettings/MddMain";
import { Typography, Box } from "@mui/material";

const DealMDDIOI = () => {
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
        Deal MDD IOI
      </Typography>
      <MddMain apiName="mdd_allocation_ioi" />
    </Box>
  );
};

export default DealMDDIOI;

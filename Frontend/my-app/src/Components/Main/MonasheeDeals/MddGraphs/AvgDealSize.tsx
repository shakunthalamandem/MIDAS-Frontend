import React from "react";
import MddMain from "../MDDSettings/MddMain";
import { Typography, Box } from "@mui/material";

const AvgDealSize = () => {
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
        variant="h5" 
        sx={{ fontWeight: "bold", color: "#002060" }}
      >
        Average Deal Size
      </Typography>
      <MddMain apiName="avg_deal_size" />
    </Box>
  );
};

export default AvgDealSize;

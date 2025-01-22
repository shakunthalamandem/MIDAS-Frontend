import React from "react";
import MddMain from "../MDDSettings/MddMain";
import { Typography, Box } from "@mui/material";

const DealStats = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      marginTop={10}
      textAlign="center"
    >

      <MddMain apiName="mdd_deals_graph" />
    </Box>
  );
};

export default DealStats;

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
      textAlign="center"
      bgcolor={'#f4f6fa'}
    >

      <MddMain apiName="mdd_deals_graph" />
    </Box>
  );
};

export default DealStats;

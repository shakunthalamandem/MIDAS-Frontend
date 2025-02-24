import React from "react";
import MddMain from "../MDDSettings/MddMain";
import {  Box } from "@mui/material";

const ByBankTable = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
    >

      <MddMain apiName="by_bank" />
    </Box>
  );
};

export default ByBankTable;

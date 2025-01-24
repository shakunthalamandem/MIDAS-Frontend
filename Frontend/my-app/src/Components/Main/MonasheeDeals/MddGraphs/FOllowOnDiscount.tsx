import React from "react";
import MddMain from "../MDDSettings/MddMain";
import {  Box } from "@mui/material";

const FollowOnDiscount = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      textAlign="center"
    >

      <MddMain apiName="fo_discount" />
    </Box>
  );
};

export default FollowOnDiscount;

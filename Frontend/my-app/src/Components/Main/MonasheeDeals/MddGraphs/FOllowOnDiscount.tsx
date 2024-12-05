import React from "react";
import MddMain from "../MDDSettings/MddMain";
import { Typography, Box } from "@mui/material";

const FollowOnDiscount = () => {
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
        Follow-On Discount
      </Typography>
      <MddMain apiName="fodiscount" />
    </Box>
  );
};

export default FollowOnDiscount;

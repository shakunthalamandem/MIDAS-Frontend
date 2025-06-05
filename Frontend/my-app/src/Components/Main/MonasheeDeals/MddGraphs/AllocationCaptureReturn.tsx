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
       <Typography
              alignItems={"center"}
              sx={{
                color: "#002060",
                fontSize: "0.8rem",
                marginBottom: 2,
                textAlign: "justify",
                padding: "10px",
                alignContent: "center",
              }}
            >
              As for the below GAP Analysis, we have assumed that 0.5% IPO
              Allocation, 1% for FO Allocation, and 0.5% AM for both IPOs and
              FOs. There is a Position limit of $30M. Also note that, for each
              year deals issued in that year are considered, and the EXIT date
              for actual PnL could be in future years. For Model, the EXIT date
              is always T+1Month. This analysis includes SPACs and PIPEs.
            </Typography>
        
      <MddMain apiName="gap_analysis" />
    </Box>
  );
};
export default AllocationCaptureReturn;
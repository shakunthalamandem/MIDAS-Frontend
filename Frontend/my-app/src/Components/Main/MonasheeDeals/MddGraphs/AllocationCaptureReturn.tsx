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
    variant="body2"
    sx={{
      "& .marquee": {
        display: "inline-block",
        whiteSpace: "nowrap",
        animation: "marquee 40s linear infinite",
        color: "#666666",
        fontWeight: "bold",
        fontStyle: "italic",
        paddingLeft: "10px",
        paddingR: "50px",
        paddingRight: "10px",
      },
      "@keyframes marquee": {
        "0%": { transform: "translateX(100%)" },
        "100%": { transform: "translateX(-100%)" },
      },
      "& .marquee:hover": {
        animationPlayState: "paused",
      },
    }}
  >
    <span className="marquee">
    As for the below GAP Analysis, we have assumed that 0.5% IPO Allocation, 1% for FO Allocation, and 0.5% AM for both IPOs and FOs. Also note that, for each year deals issued in that year are considered, and the EXIT date for actual PnL could be in future years. For Model, the EXIT date is always T+1Month. This analysis includes SPACs and PIPEs. 
    </span>
  </Typography>
      <MddMain apiName="gap_analysis" />
    </Box>
  );
};
export default AllocationCaptureReturn;
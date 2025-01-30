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
      sx={{ width: "80%", overflow: "hidden", position: "relative" }} 
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
            marginLeft: "10px",
            marginRight: "10px",
            position: "absolute", 
            left: "100%", 
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
          Back-test Assumptions: Allocation @ 0.5% of Deal Size for IPOs and @
          1.0% of deal size for FOs, AM @ 1% of Deal Size for both IPOs and FOs.
          Position Limit of $50M, Daily Stop Loss of 10%; 60%-100% Hedge based
          on region specific futures/ETFs.
        </span>
      </Typography>
      <MddMain apiName="allocation_capture" />
    </Box>
  );
};

export default AllocationCaptureReturn;

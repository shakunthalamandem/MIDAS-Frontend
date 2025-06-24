import React from "react";
import { Box, Typography } from "@mui/material";
import AssestTypePnlAttribution from "./AssestTypePnlAttribution";
import PnLSummary from "./PnLSummary";
import PnlAttributionTable from "./PnlAttributionTable";
import RegionWisePnlAttribution from "./RegionWisePnlAttribution";

const PnlAttributionMain = () => {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>


      {/* Components section */}
      <>
        <PnLSummary />
        <PnlAttributionTable />
        <RegionWisePnlAttribution />
      </>
    </Box>
  );
};

export default PnlAttributionMain;

import React from "react";
import { Box } from "@mui/material";
import PnLSummary from "./PnLSummary";
import FundLevelPNLTable from "./FundLevelPNLTable";
import RegionWisePnlAttribution from "./RegionWisePnlAttribution";
import DetailedFundTable from "./DetailedFundTable";

const PnlAttributionMain = () => {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>


      {/* Components section */}
      <>
        <PnLSummary />
        <FundLevelPNLTable />
        <RegionWisePnlAttribution />
        <DetailedFundTable />
      </>
    </Box>
  );
};

export default PnlAttributionMain;

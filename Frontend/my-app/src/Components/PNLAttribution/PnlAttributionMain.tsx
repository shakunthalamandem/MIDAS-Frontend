import React from "react";
import { Routes, Route, useMatch } from "react-router-dom";
import AssestTypePnlAttribution from "./AssestTypePnlAttribution";
import PnLSummary from "./PnLSummary";
import DeatiledRegionPnlAttribution from "./DeatiledRegionPnlAttribution";

const PnlAttributionMain = () => {
 

  return (
    <>
      <AssestTypePnlAttribution />
      <PnLSummary />
    </>
  );
};

export default PnlAttributionMain;

import React from "react";
import HySectorBasedTable from "../HySkewTables/HySectorBasedTable";
import HyYearlyBasedTable from "../HySkewTables/HyYearlyBasedTable";
import HyRatingBasedTable from "../HySkewTables/HyRatingBasedTable";
import SectorBasedTable from "../../Main/MonasheeGraphs/SkewTables/SectorBasedTable";
import YearlyBasedTable from "../../Main/MonasheeGraphs/SkewTables/YearlyBasedTable";

const HYSkewTableMain = () => {
  return (
    <>
      <HySectorBasedTable />

      <HyYearlyBasedTable />
      <HyRatingBasedTable />
    </>
  );
};

export default HYSkewTableMain;

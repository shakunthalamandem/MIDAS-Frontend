// src/components/IPODashboardMain/IPODealsS1DealData.tsx
import React from "react";
import IPODealSummarySection from "./IPODealSummarySection";
import IPOValuationSection from "./IPOValuationSection";
import IPOComparablesAndAISection from "./IPOComparablesAndAISection";

export interface SelectedData {
  ticker_name?: string;
  company_name?: string;
  exchange?: string;
  valuation?: string[];
  valuation_image_url?: string;
}

interface IPODealsS1DealDataProps {
  selectedData: SelectedData;
}

const IPODealsS1DealData: React.FC<IPODealsS1DealDataProps> = ({
  selectedData,
}) => {
  return (
    <>
      {/* 1. Fair value / interest / thresholds + strategy */}
      <IPODealSummarySection selectedData={selectedData} />

      {/* 2. Valuation info (bullets + image) */}
      <IPOValuationSection selectedData={selectedData} />

      {/* 3. Comparables table + AI suggestions */}
      <IPOComparablesAndAISection selectedData={selectedData} />
    </>
  );
};

export default IPODealsS1DealData;

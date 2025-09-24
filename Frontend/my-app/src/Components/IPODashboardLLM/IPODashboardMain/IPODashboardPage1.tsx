// components/IPODashboardPage1.tsx
import React from "react";
import IPODashboardHeader from "../IPODashboardHeader";

interface TickerOption {
  ticker_name: string;
  pricing_date: string;
}

interface Props {
  ipoData: any;
  allIpoTickers: TickerOption[];
  selectedTicker: string;
  searchText: string;
  setSelectedTicker: (ticker: string | null) => void;
  setSearchText: (text: string) => void;
  setIpoData: (data: any) => void;
  handleExportPDF: () => void;
  pdfLoading: boolean;
}

const IPODashboardPage1: React.FC<Props> = ({
  ipoData,
  allIpoTickers,
  selectedTicker,
  searchText,
  setSelectedTicker,
  setSearchText,
  setIpoData,
  handleExportPDF,
  pdfLoading,
}) => {
  return (
    <div
      id="ipo-dashboard-page1"
      data-pdf-page="1"
      style={{ background: "#fff" }} // keeps capture clean
    >
      <IPODashboardHeader
        ipoData={ipoData}
        allIpoTickers={allIpoTickers}
        selectedTicker={selectedTicker}
        searchText={searchText}
        setSelectedTicker={setSelectedTicker}
        setSearchText={setSearchText}
        setIpoData={setIpoData}
        onExportPDF={handleExportPDF}
        pdfLoading={pdfLoading}
      />
    </div>
  );
};

export default IPODashboardPage1;

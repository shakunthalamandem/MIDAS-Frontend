// components/IPODashboardPage1.tsx
import React from "react";
import IPODashboardHeader from "../IPODashboardHeader";
interface Props {
  ipoData: any;
  allIpoTickers: string[];
  selectedTicker: string;
  searchText: string;
  setSelectedTicker: (ticker: string | null) => void;

  setSearchText: (text: string) => void;
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
  handleExportPDF,
  pdfLoading,
}) => {
  return (
    <div id="ipo-dashboard-page1">
      <IPODashboardHeader
        ipoData={ipoData}
        allIpoTickers={allIpoTickers}
        selectedTicker={selectedTicker}
        searchText={searchText}
        setSelectedTicker={setSelectedTicker}
        setSearchText={setSearchText}
        onExportPDF={handleExportPDF}
        pdfLoading={pdfLoading}
      />
   

    </div>
  );
};

export default IPODashboardPage1;

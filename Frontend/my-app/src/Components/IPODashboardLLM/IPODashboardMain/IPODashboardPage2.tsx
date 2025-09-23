import React, { useState } from "react";
import IPODashboardCardRatings from "../IPODashboardCardRatings";
import IPODifferenciateSummary from "../IPODifferenciateSummary";

interface Props {
  ipoData: any;
  selectedTicker: string;
  setIpoData: (data: any) => void;
}

const IPODashboardPage2: React.FC<Props> = ({
  ipoData,
  selectedTicker,
  setIpoData,
}) => {
  const [loading, setLoading] = useState(true);

  const selectedData = {
    ticker_name: selectedTicker,
  };

  return (
    <div id="ipo-dashboard-page2">
      <IPODifferenciateSummary selectedData={selectedData} />

      <IPODashboardCardRatings
        ipodata={ipoData}
        selectedTicker={selectedTicker}
        setIpoData={setIpoData}
      />
    </div>
  );
};

export default IPODashboardPage2;

import React, { useEffect, useState } from "react";
import IPODashboardCardRatings from "../IPODashboardCardRatings";
import IPODifferenciateSummary from "../IPODifferenciateSummary";

interface Props {
  ipoData: any;
  selectedTicker: string;
  setIpoData: (data: any) => void;
  onPageReady?: () => void;
}

const IPODashboardPage2: React.FC<Props> = ({
  ipoData,
  selectedTicker,
  setIpoData,
  onPageReady,
}) => {
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [ratingsLoaded, setRatingsLoaded] = useState(false);

  const selectedData = {
    ticker_name: selectedTicker,
  };

  useEffect(() => {
    setSummaryLoaded(false);
    setRatingsLoaded(false);
  }, [selectedTicker]);

  useEffect(() => {
    if (summaryLoaded && ratingsLoaded) {
      onPageReady?.();
    }
  }, [summaryLoaded, ratingsLoaded, onPageReady]);

  return (
    <div id="ipo-dashboard-page4">
      <IPODifferenciateSummary
        selectedData={selectedData}
        onLoaded={() => setSummaryLoaded(true)}
      />

      <IPODashboardCardRatings
        ipodata={ipoData}
        selectedTicker={selectedTicker}
        setIpoData={setIpoData}
        onLoaded={() => setRatingsLoaded(true)}
      />
    </div>
  );
};

export default IPODashboardPage2;

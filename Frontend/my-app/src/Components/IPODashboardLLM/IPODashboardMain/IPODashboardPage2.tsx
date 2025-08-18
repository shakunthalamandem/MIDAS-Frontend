import React, { useRef, useEffect, useState } from "react";
import IPODashboardCardRatings from "../IPODashboardCardRatings";

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
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Measure max height for each row
    const heights: number[] = [];
    let tempHeights: number[] = [];

    cardRefs.current.forEach((card, i) => {
      if (card) {
        tempHeights.push(card.offsetHeight);
      }
      if ((i + 1) % 2 === 0 || i === cardRefs.current.length - 1) {
        heights.push(Math.max(...tempHeights));
        tempHeights = [];
      }
    });

    setRowHeights(heights);
  }, [ipoData]);



  return (
    <div id="ipo-dashboard-page2">
      <IPODashboardCardRatings
        ipodata={ipoData}
        selectedTicker={selectedTicker}
        setIpoData={setIpoData}
      />

    </div>
  );
};

export default IPODashboardPage2;
 
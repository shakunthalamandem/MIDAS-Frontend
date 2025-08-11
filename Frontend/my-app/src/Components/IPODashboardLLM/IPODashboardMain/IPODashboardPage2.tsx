import React, { useRef, useEffect, useState } from "react";
import { Container, Grid } from "@mui/material";
import IPODashboardCardRatings from "../IPODashboardCardRatings";
import { cardSections } from "../UtilsIPODashboard";

interface Props {
  ipoData: any;
  selectedTicker: string;
  setIpoData: (data: any) => void;
  renderEditableCard: (
    section: any,
    index: number,
    minHeight?: number,
    isExpanded?: boolean,
    onToggle?: () => void
  ) => React.ReactNode;
}

const IPODashboardPage2: React.FC<Props> = ({
  ipoData,
  selectedTicker,
  setIpoData,
  renderEditableCard,
}) => {
  const [rowHeights, setRowHeights] = useState<number[]>([]);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
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

  const toggleRow = (rowIndex: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  return (
    <div id="ipo-dashboard-page2">
      <IPODashboardCardRatings
        ipodata={ipoData}
        selectedTicker={selectedTicker}
        setIpoData={setIpoData}
      />
      <Container maxWidth="xl" sx={{ mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cardSections.slice(0, 2).map((section, index) => {
            const rowIndex = Math.floor(index / 2);
            return (
              <Grid
                item
                xs={12}
                md={6}
                key={section.key}
                sx={{ display: "flex" }}
                ref={(el) => (cardRefs.current[index] = el)}
              >
                {renderEditableCard(
                  section,
                  index,
                  rowHeights[rowIndex],
                  expandedRows[rowIndex] || false,
                  () => toggleRow(rowIndex) // shared toggle
                )}
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </div>
  );
};

export default IPODashboardPage2;
 
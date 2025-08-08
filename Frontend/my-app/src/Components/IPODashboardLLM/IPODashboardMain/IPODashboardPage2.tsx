// components/IPODashboardPage2.tsx
import React from "react";
import { Container, Grid } from "@mui/material";
import IPODashboardCardRatings from "../IPODashboardCardRatings";
import { cardSections } from "../UtilsIPODashboard";


interface Props {
  ipoData: any;
  selectedTicker: string;
  setIpoData: (data: any) => void;
  renderEditableCard: (section: any, index: number) => React.ReactNode;
}

const IPODashboardPage2: React.FC<Props> = ({
  ipoData,
  selectedTicker,
  setIpoData,
  renderEditableCard,
}) => {
  return (
    <div id="ipo-dashboard-page2">
      <IPODashboardCardRatings
        ipodata={ipoData}
        selectedTicker={selectedTicker}
        setIpoData={setIpoData}
      />
      <Container maxWidth="xl" sx={{ mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {cardSections.slice(0, 2).map((section, index) => (
            <Grid item xs={12} md={6} key={section.key}>
              {renderEditableCard(section, index)}
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default IPODashboardPage2;

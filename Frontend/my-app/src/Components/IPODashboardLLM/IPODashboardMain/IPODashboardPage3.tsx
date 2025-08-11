// components/IPODashboardPage3.tsx
import React from "react";
import { Container, Grid } from "@mui/material";
import { cardSections } from "../UtilsIPODashboard";

interface Props {
  renderEditableCard: (section: any, index: number) => React.ReactNode;
}

const IPODashboardPage3: React.FC<Props> = ({ renderEditableCard }) => {
  return (
    <div id="ipo-dashboard-page3">
      <Container maxWidth="xl" sx={{ mb: 3 }}>
        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
            alignItems: "stretch", // ✅ Make all items in each row equal height
          }}
        >
          {cardSections.slice(2, 6).map((section, index) => (
            <Grid
              item
              xs={12}
              md={6}
              key={section.key}
              sx={{ display: "flex" }} // ✅ Allow child Accordion to stretch
            >
              {renderEditableCard(section, index + 2)}
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default IPODashboardPage3;

import React from "react";
import { Card, Container, Grid } from "@mui/material";
import { cardSections } from "../UtilsIPODashboard";

interface Props {
  renderEditableCard: (section: any, index: number) => React.ReactNode;
}

const IPODashboardPage3: React.FC<Props> = ({ renderEditableCard }) => {
  const sectionIndexMap = new Map(cardSections.map((section, idx) => [section.key, idx]));
  const getSectionIndex = (section: { key: string }) => sectionIndexMap.get(section.key) ?? 0;

  const businessOverview = cardSections.find((section) => section.key === "business_overview");
  const strengths = cardSections.find((section) => section.key === "strengths");
  const gridSections = cardSections.filter((section) =>
    [
      "key_highlights",
      "concerns",
      "principal_stockholders_preipo",
      "key_management_personnel",
    ].includes(section.key)
  );

  return (
    <div id="ipo-dashboard-page3">
      <Container maxWidth="xl" sx={{ mb: 3 }}>
        <Card elevation={0} sx={{ mb: 3, mt: 3, ml: 3, mr: 3 }}>
          {businessOverview ? (
            <Grid
              container
              spacing={2}
              sx={{
                mb: 3,
                alignItems: "stretch",
              }}
            >
              <Grid item xs={12} sx={{ display: "flex" }}>
                {renderEditableCard(businessOverview, getSectionIndex(businessOverview) + 2)}
              </Grid>
            </Grid>
          ) : null}

          <Grid
            container
            spacing={2}
            sx={{
              mb: 3,
              alignItems: "stretch",
            }}
          >
            {gridSections.map((section) => (
              <Grid
                item
                xs={12}
                md={6}
                key={section.key}
                sx={{ display: "flex" }}
              >
                {renderEditableCard(section, getSectionIndex(section) + 2)}
              </Grid>
            ))}
          </Grid>

          {strengths ? (
            <Grid
              container
              spacing={2}
              sx={{
                mb: 3,
                alignItems: "stretch",
              }}
            >
              <Grid item xs={12} sx={{ display: "flex" }}>
                {renderEditableCard(strengths, getSectionIndex(strengths) + 2)}
              </Grid>
            </Grid>
          ) : null}
        </Card>
      </Container>
    </div>
  );
};

export default IPODashboardPage3;

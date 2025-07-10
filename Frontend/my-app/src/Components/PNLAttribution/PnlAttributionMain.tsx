import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Button,
  Container,
  Fade,
} from "@mui/material";

import PnLSummary from "./PnLSummary";
import FundLevelPNLTable from "./FundLevelPNLTable";
import RegionWisePnlAttribution from "./RegionWisePnlAttribution";
import DetailedFundTable from "./DetailedFundTable";
import { Padding } from "@mui/icons-material";

type ViewOption = "byAsset" | "byFund" | "byRegion";

const tabConfig: {
  label: string;
  value: ViewOption;
  color: string;
}[] = [
  { label: "By Asset", value: "byAsset", color: "#00340a" },
  { label: "By Fund", value: "byFund", color: "#004297" },
  { label: "By Region", value: "byRegion", color: "#770060" },
];

const PnlAttributionMain: React.FC = () => {
  const [selectedView, setSelectedView] = useState<ViewOption>("byAsset");

  const renderContent = () => {
    switch (selectedView) {
      case "byAsset":
        return (
          <Fade in>
            <Box>
              <PnLSummary />
              <FundLevelPNLTable />
            </Box>
          </Fade>
        );
      case "byFund":
        return (
          <Fade in>
            <Box>
              <DetailedFundTable />
            </Box>
          </Fade>
        );
      case "byRegion":
        return (
          <Fade in>
            <Box>
              <RegionWisePnlAttribution />
            </Box>
          </Fade>
        );
      default:
        return null;
    }
  };

  return (
    <Container>
      {/* Top card with gradient and button-like tabs */}
      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: 2,
          background: "linear-gradient(to right, rgb(147, 192, 228), rgb(236, 229, 163))",
        }}
      >
<CardContent sx={{ p: 0}}>
          <Box
            display="flex"
            justifyContent="center"
            gap={2}
            flexWrap="wrap"
            height={20.5}
          >
            {tabConfig.map((tab) => (
              <Button
                key={tab.value}
                onClick={() => setSelectedView(tab.value)}
                variant={selectedView === tab.value ? "contained" : "outlined"}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: 14,
                  px: 4,
                  borderRadius: 5,
                  margin:0.5,
                  color: selectedView === tab.value ? "#fff" : tab.color,
                  backgroundColor: selectedView === tab.value ? tab.color : "transparent",
                  borderColor: tab.color,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: tab.color,
                    color: "#fff",
                  },
                }}
              >
                {tab.label}
              </Button>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Content card with gradient */}
      <Card
        sx={{
          boxShadow: 4,
          borderRadius: 2,
          mb:4,
          transition: "0.5s ease",
          background: "linear-gradient(to bottom, rgb(253, 238, 238), rgb(231, 255, 251))",
        }}
      >
        <CardContent>{renderContent()}</CardContent>
      </Card>
    </Container>
  );
};

export default PnlAttributionMain;

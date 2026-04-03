import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import PortfolioIntegratedDataTable from "./PortfolioIntegratedDataTable";
import PortfolioFODataTable from "./PortfolioFODataTable";

type TabType = "ipo" | "fo";

const PortfolioSummaryTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("ipo");

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ mt:2,mb: 2, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700}>
          US Current Portfolio Summary
        </Typography>
      </Box>

      {/* Tab Buttons */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: "center" }}>
        <Button
          variant={activeTab === "ipo" ? "contained" : "outlined"}
          onClick={() => handleTabChange("ipo")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            px: 3,
            py: 1,
          }}
        >
          IPO
        </Button>
        <Button
          variant={activeTab === "fo" ? "contained" : "outlined"}
          onClick={() => handleTabChange("fo")}
          sx={{
            textTransform: "none",
            fontWeight: 600,
            borderRadius: "8px",
            px: 3,
            py: 1,
          }}
        >
          FO
        </Button>
      </Box>

      {/* Tab Content */}
      <Box>
        {activeTab === "ipo" && <PortfolioIntegratedDataTable />}
        {activeTab === "fo" && <PortfolioFODataTable />}
      </Box>
    </Box>
  );
};

export default PortfolioSummaryTabs;

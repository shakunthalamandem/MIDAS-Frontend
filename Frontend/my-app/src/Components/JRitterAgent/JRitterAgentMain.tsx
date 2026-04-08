import React, { useState } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import PasteJsonTab from "./PasteJsonTab";
import SavedScoresTab from "./SavedScoresTab";

const JRitterAgentMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleSaveSuccess = () => {
    setRefreshKey((k) => k + 1);
    setActiveTab(1);
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      <Box
        sx={{
          background: "linear-gradient(135deg, #0a1628 0%, #1a2d4a 100%)",
          px: 4,
          py: 2.5,
        }}
      >
        <Typography
          variant="h5"
          sx={{ color: "#fff", fontWeight: 700, letterSpacing: "0.5px" }}
        >
          Ritter IPO Agent
        </Typography>
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mt: 0.5 }}>
          Paste Claude-generated Ritter IPO JSON scorecards and view saved analyses
        </Typography>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: "divider", backgroundColor: "#fff" }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            px: 4,
            "& .MuiTab-root": {
              fontWeight: 600,
              fontSize: "0.85rem",
              textTransform: "none",
              minHeight: 48,
              color: "#666",
            },
            "& .Mui-selected": {
              color: "#005166 !important",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#005166",
              height: 3,
            },
          }}
        >
          <Tab label="Paste New JSON" />
          <Tab label="Saved Scores" />
        </Tabs>
      </Box>

      <Box sx={{ p: 3 }}>
        {activeTab === 0 && <PasteJsonTab onSaveSuccess={handleSaveSuccess} />}
        {activeTab === 1 && <SavedScoresTab key={refreshKey} />}
      </Box>
    </Box>
  );
};

export default JRitterAgentMain;

import React, { useState } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import SentimentAnalysis from "./SentimentAnalysis";
import FOSentimentAnalysisDumpDaily from "./FOSentimentAnalysisDumpDaily";

const SentimentAnalysisTabs: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f4f6f9" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          borderBottom: 1,
          borderColor: "divider",
          backgroundColor: "#fff",
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          centered
          sx={{
            "& .MuiTab-root": {
              fontWeight: 600,
              color: "#6b7280",
              textTransform: "none",
              fontSize: "1rem",
              px: 4,
              py: 1.5,
              minHeight: 48,
              "&.Mui-selected": {
                color: "#002060",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#002060",
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab label="IPO Sentiment" />
          <Tab label="FO Sentiment" />
        </Tabs>
      </Box>

      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {tab === 0 && <SentimentAnalysis />}
        {tab === 1 && <FOSentimentAnalysisDumpDaily />}
      </Box>
    </Box>
  );
};

export default SentimentAnalysisTabs;

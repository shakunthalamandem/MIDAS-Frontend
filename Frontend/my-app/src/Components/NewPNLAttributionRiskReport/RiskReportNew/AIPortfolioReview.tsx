import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import PortfolioReportDocumentMain from "./PortfolioReportDocumentMain";

const tabConfig = [
  { key: "portfolioReview", label: "US Portfolio CIO AI Review" },
  { key: "stockRanking", label: "Portfolio AI Stock Ranking" },
  { key: "individualReview", label: "Inidividual Stock CIO AI REview" },
];

const AIPortfolioReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabConfig[0].key);

  const renderPlaceholder = (label: string) => (
    <Box
      sx={{
        mt: 4,
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        px: 2,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600, textAlign: "center" }}>
        {label} — coming soon
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
        We will add this view shortly.
      </Typography>
    </Box>
  );

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        // background: "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #111827 100%)",
        px: { xs: 1, sm: 3, md: 4 },
        py: 3,
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          backgroundColor: "#fff",
          borderRadius: 3,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            backgroundColor: "#e2e8f0",
            borderRadius: 999,
            p: 1,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          {tabConfig.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                sx={{
                  borderRadius: "999px",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  px: 3.5,
                  py: 1,
                  color: isActive ? "#fff" : "#0f172a",
                  background: isActive
                    ? "linear-gradient(135deg, #0b1b3b, #1e3a8a)"
                    : "#fff",
                  border: isActive ? "1px solid #0b1b3b" : "1px solid #cbd5f5",
                  boxShadow: isActive
                    ? "0 8px 20px rgba(15, 23, 42, 0.35)"
                    : "none",
                  minWidth: 160,
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      {activeTab === tabConfig[0].key ? (
        <Box sx={{ mt: 2 }}>
          <PortfolioReportDocumentMain />
        </Box>
      ) : (
        renderPlaceholder(tabConfig.find((tab) => tab.key === activeTab)?.label ?? "")
      )}
    </Box>
  );
};

export default AIPortfolioReview;

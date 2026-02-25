import React, { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import PortfolioReportDocumentMain from "./PortfolioReportDocumentMain";
import AIRankingMain from "./AIRanking/AIRankingMain";

const tabConfig = [
  { key: "portfolioReview", label: "US Portfolio CIO AI Review" },
  { key: "stockRanking", label: "Portfolio AI Stock Ranking" },
  { key: "individualReview", label: "Inidividual Stock CIO AI Review" },
];

const AIPortfolioReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabConfig[0].key);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

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
        {label} - coming soon
      </Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", textAlign: "center" }}>
        We will add this view shortly.
      </Typography>
    </Box>
  );

  const renderContent = () => {
    if (activeTab === "portfolioReview") {
      return <PortfolioReportDocumentMain />;
    }

    if (activeTab === "stockRanking") {
      return (
        <Box sx={{ mt: 2 }}>
          <AIRankingMain />
        </Box>
      );
    }

    const tabLabel = tabConfig.find((tab) => tab.key === activeTab)?.label ?? "";
    return renderPlaceholder(tabLabel);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1, sm: 3, md: 4 },
        py: 3,
        background: "linear-gradient(135deg, #0b1223 0%, #0f172a 40%, #1f2937 100%)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.35)",
          backgroundColor: "#e2e8f0",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            borderRadius: 999,
            p: 1,
            display: "flex",
            gap: 1,
            flexWrap: "wrap",
            justifyContent: "center",
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
                  color: isActive ? "#fff" : "#0b1223",
                  background: isActive ? "linear-gradient(135deg, #111e3a, #1d4ed8)" : "#fff",
                  border: isActive ? "1px solid #0b1223" : "1px solid #cbd5f5",
                  boxShadow: isActive ? "0 8px 20px rgba(15, 23, 42, 0.35)" : "none",
                  minWidth: 180,
                }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Box>
      </Box>

      <Box
        sx={{
          mt: 3,
          maxWidth: 1260,
          mx: "auto",
          bgcolor: "#fff",
          borderRadius: 3,
          boxShadow: "0 24px 60px rgba(15, 23, 42, 0.25)",
          px: { xs: 2, md: 4 },
          py: { xs: 3, md: 4 },
        }}
      >
        {renderContent()}
      </Box>
    </Box>
  );
};

export default AIPortfolioReview;

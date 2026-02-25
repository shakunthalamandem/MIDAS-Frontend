import React, { useState } from "react";
import { Box, Button } from "@mui/material";
import PortfolioReportDocumentMain from "./PortfolioReportDocumentMain";
import AIRankingMain from "./AIRanking/AIRankingMain";

const tabConfig = [
  { key: "portfolioReview", label: "US Portfolio CIO AI Review" },
  { key: "stockRanking", label: "Portfolio AI Stock Ranking" },
];

const AIPortfolioReview: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabConfig[0].key);

  const handleTabChange = (newValue: string) => {
    setActiveTab(newValue);
  };

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

    return null;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        px: { xs: 1, sm: 3, md: 4 },
        py: 3,
        background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
      }}
    >
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          borderRadius: 3,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
          backgroundColor: "#fff",
          border: "1px solid #e2e8f0",
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
                  fontWeight: 600,
                  fontSize: 13,
                  px: 3.5,
                  py: 1,
                  color: isActive ? "#fff" : "#475569",
                  background: isActive
                    ? "linear-gradient(135deg, #2563eb, #3b82f6)"
                    : "#f8fafc",
                  border: isActive ? "1px solid #2563eb" : "1px solid #e2e8f0",
                  boxShadow: isActive
                    ? "0 2px 8px rgba(37, 99, 235, 0.25)"
                    : "none",
                  minWidth: 180,
                  "&:hover": {
                    background: isActive
                      ? "linear-gradient(135deg, #1d4ed8, #2563eb)"
                      : "#f1f5f9",
                  },
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
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
          border: "1px solid #e2e8f0",
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

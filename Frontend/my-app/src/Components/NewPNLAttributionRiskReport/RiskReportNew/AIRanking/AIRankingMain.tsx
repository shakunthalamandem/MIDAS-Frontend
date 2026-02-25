import React, { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { ExecutiveSummary } from "./ExecutiveSummary";
import { RankingTable } from "./RankingTable";
import { StockDetail } from "./StockDetail";
import { portfolioData } from "./portfolioData";

const AIRankingMain: React.FC = () => {
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const selectedStock = selectedTicker
    ? portfolioData.stocks.find((s) => s.ticker === selectedTicker) || null
    : null;

  return (
    <Box sx={{ width: "100%" }}>
      {/* <Typography variant="h5" fontWeight={700} mb={2}>
        AI Portfolio Sentinel
      </Typography> */}
      <Stack spacing={3}>
        <ExecutiveSummary
          summary={portfolioData.executive_summary}
          actionSummary={portfolioData.portfolio_action_summary}
          metadata={portfolioData.report_metadata}
        />
        <RankingTable
          rows={portfolioData.ranking_table}
          selectedTicker={selectedTicker}
          onSelectTicker={(t) => setSelectedTicker(selectedTicker === t ? null : t)}
        />
        {selectedStock && (
          <StockDetail stock={selectedStock} onClose={() => setSelectedTicker(null)} />
        )}
      </Stack>
    </Box>
  );
};

export default AIRankingMain;

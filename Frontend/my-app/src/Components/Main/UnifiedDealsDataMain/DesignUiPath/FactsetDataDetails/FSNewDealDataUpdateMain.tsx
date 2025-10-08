import React, { useState } from "react";
import { Box, Typography } from "@mui/material";
import FSCompetitorSearch from "./FSCompetitorSearch";
import FSSelectedCompetitors from "./FSSelectedCompetitors";

const FSNewDealDataUpdateMain: React.FC = () => {
  const [selectedCompetitors, setSelectedCompetitors] = useState<string[]>([]);

  const handleAddCompetitor = (ticker: string) => {
    if (!selectedCompetitors.includes(ticker)) {
      setSelectedCompetitors((prev) => [...prev, ticker]);
    }
  };

  const handleRemoveCompetitor = (ticker: string) => {
    setSelectedCompetitors((prev) => prev.filter((t) => t !== ticker));
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="flex-start"
      p={4}
      minHeight="80vh"
      bgcolor="#f5f5f5"
    >
      <Typography variant="h5" gutterBottom>
        Add Competitor Tickers
      </Typography>

      <FSCompetitorSearch onSelect={handleAddCompetitor} />

      <FSSelectedCompetitors
        competitors={selectedCompetitors}
        onRemove={handleRemoveCompetitor}
      />
    </Box>
  );
};

export default FSNewDealDataUpdateMain;

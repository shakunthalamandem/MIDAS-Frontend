import React from "react";
import { Box, Typography, Paper, Chip } from "@mui/material";

interface FSSelectedCompetitorsProps {
  competitors: string[];
  onRemove: (ticker: string) => void;
}

const FSSelectedCompetitors: React.FC<FSSelectedCompetitorsProps> = ({
  competitors,
  onRemove,
}) => {
  return (
    <Paper sx={{ width: 400, p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Selected Competitors
      </Typography>
      {competitors.length === 0 ? (
        <Typography>No competitors added yet.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {competitors.map((ticker) => (
            <Chip
              key={ticker}
              label={ticker}
              onDelete={() => onRemove(ticker)}
              color="primary"
            />
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default FSSelectedCompetitors;

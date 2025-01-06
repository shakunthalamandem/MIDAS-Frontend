import React from "react";
import { Box, Paper, Typography } from "@mui/material";

interface SelectedTickerProps {
    ticker: string;
  }
  
  const SelectedTicker: React.FC<SelectedTickerProps> = ({ ticker }) => {
    return (
      <Box sx={{ marginTop: 4, padding: 2 }}>
        <Paper elevation={3} style={{ padding: "10px" }}>
          <Typography variant="h6">Selected Ticker</Typography>
          <Typography variant="body1">
            <strong>Ticker:</strong> {ticker}
          </Typography>
        </Paper>
      </Box>
    );
  };
  

export default SelectedTicker;

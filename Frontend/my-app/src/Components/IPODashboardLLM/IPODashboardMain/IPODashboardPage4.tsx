// components/IPODashboardPage4.tsx
import React from "react";
import { Container, Grid, Box, Typography, Button } from "@mui/material";
import IPOAITickersMain from "../Hooks/IPOAITickersMain";
import IPODashboardMainTable from "../IPODashboardMainTable";
import FinancialForecastTable from "../IPOFinancialTableMain";
import { cardStyle } from "../UtilsIPODashboard";


interface Props {
  selectedTicker: string;
  ipoData: any;
  showAIComparison: boolean;
  handleAIComparisonClick: () => void;
}

const IPODashboardPage4: React.FC<Props> = ({
  selectedTicker,
  ipoData,
  showAIComparison,
  handleAIComparisonClick,
}) => {
  return (
    <div id="ipo-dashboard-page4">
      <Container maxWidth="xl" sx={{ mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
              <FinancialForecastTable defaultTicker={selectedTicker} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ backgroundColor: "#f4f5f7", p: 2 }}>
              <Button
                variant="contained"
                color="secondary"
                onClick={handleAIComparisonClick}
                sx={{ mb: 2 }}
              >
                AI Comparison
              </Button>
              <Typography variant="body1" gutterBottom color="#02517e">
                AI Suggested Comparable Tickers
              </Typography>
              {showAIComparison && <IPOAITickersMain selectedData={ipoData} />}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ ...cardStyle, p: 2, backgroundColor: "#f4f5f7" }}>
              <IPODashboardMainTable ticker={selectedTicker} />
            </Box>
            <Typography
              sx={{ fontStyle: "italic", fontSize: "0.875rem", color: "gray" }}
            >
              Source: Factset
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default IPODashboardPage4;

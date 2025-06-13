import React from "react";
import { Grid, Box, Paper, Typography } from "@mui/material";
import EquityDashboard from "./Equity/EquityDashboard";
import InsightsMain from "./InsightsAi/InsightsMain";
import MDDDashboardMain from "./MonasheeMDD/MDDDashboardMain";

const LandingPageMain: React.FC = () => {
  return (
    <>
      <Box display="flex">
        <Box sx={{ width: "85%", p: 2, overflowY: "auto" }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: "#a3b5e7" }}>
              <EquityDashboard />
            </Paper>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: "#ecf6bb" }}>
              <MDDDashboardMain />
            </Paper>
          </Box>
        </Box>

        {/* Right side: 15% */}
        <Box
          sx={{ width: "15%", p: 2, backgroundColor: "#810c4a", mt: 2, mb: 2 }}
        >
          <InsightsMain />
        </Box>
      </Box>
    </>
  );
};

export default LandingPageMain;

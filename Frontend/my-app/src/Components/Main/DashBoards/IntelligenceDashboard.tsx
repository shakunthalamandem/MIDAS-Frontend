import React from "react";
import UpcomingIpoTable from "./Equity/UpcomingIpoTable";
import { Grid, Box, Paper, Typography } from "@mui/material";
import FoPredictionCards from "./Equity/FoPredictionCards";

const IntelligenceDashboard: React.FC = () => {
  return (
    <>
      <Box display="flex" width="100%">
        <Box display="flex" flexDirection="column" gap={2} width="100%">
          <Paper elevation={3} sx={{ p: 2, backgroundColor: "#e8f4fc" }}>
            <Typography
              variant="h5"
              sx={{
                color: "#002060",
                textAlign: "left",
                marginBottom: "12px",
                fontWeight: 600,
              }}
            >
              Equity Deal Intelligence
            </Typography>

            <Typography
              variant="body1"
              sx={{
                color: "#000000",
                marginBottom: "20px",
                lineHeight: 1.6,
              }}
            >
              Gain Information insights into upcoming IPOs and recent follow-on
              deals. This dashboard highlights market activity from the past
              month along with predictions powered by advanced AI models to
              support data-driven investment decisions.
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                  <UpcomingIpoTable />
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 2, height: "100%" }}>
                  <FoPredictionCards />
                </Paper>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default IntelligenceDashboard;

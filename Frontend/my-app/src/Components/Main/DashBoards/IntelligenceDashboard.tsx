import React from "react";
import UpcomingIpoTable from "./Equity/UpcomingIpoTable";
import AiDashboard from "./Equity/AiDashboard";
import { Grid, Box, Paper, Typography, Container } from "@mui/material";

const IntelligenceDashboard: React.FC = () => {
  return (
    <>
      <Box display="flex">
        {/* <Box sx={{ width: "70%", p: 2, overflowY: "auto" }}> */}
        <Container sx={{ width: "85%", p: 2, overflowY: "auto" }}>
          <Box display="flex" flexDirection="column" gap={2}>
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
                Gain real-time insights into upcoming IPOs and recent follow-on
                deals. This dashboard highlights market activity from the past
                month along with predictions powered by advanced AI models to
                support data-driven investment decisions.
              </Typography>

              <Grid item xs={12}>
                <UpcomingIpoTable />
                <AiDashboard />
              </Grid>
            </Paper>
          </Box>
        </Container>
        {/* </Box> */}
      </Box>
    </>
  );
};

export default IntelligenceDashboard;

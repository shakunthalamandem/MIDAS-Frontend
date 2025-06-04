import React from "react";
import UpcomingIpoTable from "./Equity/UpcomingIpoTable";
import AiDashboard from "./Equity/AiDashboard";
import { Grid, Box, Paper, Typography } from "@mui/material";

const IntelligenceDashboard: React.FC = () => {
  return (
    <>
      <Box display="flex">
        <Box sx={{ width: "70%", p: 2, overflowY: "auto" }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Paper elevation={3} sx={{ p: 2, backgroundColor: "#e8f4fc" }}>
              <Typography
                variant="h5"
                sx={{
                  color: "#002060",
                  textAlign: "left",
                  marginBottom: "20px",
                }}
              >
                Intelligence Dashboard
              </Typography>
              <Grid item xs={12}>
                <UpcomingIpoTable />
                <AiDashboard />
              </Grid>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default IntelligenceDashboard;

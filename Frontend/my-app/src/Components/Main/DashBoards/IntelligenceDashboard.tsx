import React from "react";
import UpcomingIpoTable from "./Equity/UpcomingIpoTable";
import FoPredictionCards from "./Equity/FoPredictionCards";
import MddIpoOpportunityChart from "./Equity/MddIpoOpportunityChart";
import MddFoDealsOpportunityChart from "./Equity/MddFoDealsOpportunityChart";
import { Grid, Box, Paper, Typography } from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

const IntelligenceDashboard: React.FC = () => {
  return (
    <Box display="flex" width="100%" p={2} bgcolor="#f5f9fc">
      <Box display="flex" flexDirection="column" gap={4} width="100%">

        {/* First Section: Equity Intelligence */}
        <MotionPaper
          elevation={3}
          sx={{
            p: 3,
            background: "linear-gradient(to right, #e3f2fd, #ffffff)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            borderRadius: 4,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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
            Gain insights into upcoming IPOs and recent follow-on deals. This
            dashboard highlights market activity from the past month, along with
            AI-powered predictions to support data-driven investment decisions.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <UpcomingIpoTable />
            </Grid>
            <Grid item xs={12} md={6}>
              <FoPredictionCards />
            </Grid>
          </Grid>
        </MotionPaper>

        {/* Second Section: Charts */}
        <MotionPaper
          elevation={3}
          sx={{
            p: 3,
            background: "linear-gradient(to right, #f3e5f5, #ffffff)",
            boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            borderRadius: 4,
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <MddIpoOpportunityChart />
            </Grid>
            <Grid item xs={12} md={6}>
              <MddFoDealsOpportunityChart />
            </Grid>
          </Grid>
        </MotionPaper>
      </Box>
    </Box>
  );
};

export default IntelligenceDashboard;

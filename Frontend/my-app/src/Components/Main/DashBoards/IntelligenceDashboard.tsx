import React, { useState } from "react";
import UpcomingIpoTable from "./Equity/UpcomingIpoTable";
import FoPredictionCards from "./Equity/FoPredictionCards";
import MddIpoOpportunityChart from "./Equity/MddIpoOpportunityChart";
import MddFoDealsOpportunityChart from "./Equity/MddFoDealsOpportunityChart";
import {
  Grid,
  Box,
  Paper,
  Typography,
  Button,
  Stack,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

const IntelligenceDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"IPO" | "FO">("IPO");

  return (
    <Box display="flex" width="100%" pt={2} bgcolor="#f5f9fc">
      <Box display="flex" flexDirection="column" gap={4} width="100%">

        <Box display="flex" justifyContent="center">
          <Stack direction="row" spacing={2}>
            <Button
              onClick={() => setSelectedTab("IPO")}
              variant={selectedTab === "IPO" ? "contained" : "outlined"}
              color="primary"
            >
              IPO
            </Button>
            <Button
              onClick={() => setSelectedTab("FO")}
              variant={selectedTab === "FO" ? "contained" : "outlined"}
              color="primary"
            >
              FO
            </Button>
          </Stack>
        </Box>

        {/* IPO Section */}
        {selectedTab === "IPO" && (
          <>
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
              <Typography variant="h5" sx={{ color: "#002060", mb: 2, fontWeight: 600 }}>
                IPO Deal Intelligence
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                Gain insights into upcoming IPOs. This dashboard highlights recent IPO activity
                and opportunities to help drive investment decisions.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <UpcomingIpoTable />
                </Grid>
              </Grid>
            </MotionPaper>

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
                <Grid item xs={12}>
                  <MddIpoOpportunityChart />
                </Grid>
              </Grid>
            </MotionPaper>
          </>
        )}

        {selectedTab === "FO" && (
          <>
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
              <Typography variant="h5" sx={{ color: "#002060", mb: 2, fontWeight: 600 }}>
                FO Deal Intelligence
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6 }}>
                Explore recent follow-on market activity with predictive insights and analytics to support smarter investment strategies.
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FoPredictionCards />
                </Grid>
              </Grid>
            </MotionPaper>

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
                <Grid item xs={12}>
                  <MddFoDealsOpportunityChart />
                </Grid>
              </Grid>
            </MotionPaper>
          </>
        )}
      </Box>
    </Box>
  );
};

export default IntelligenceDashboard;

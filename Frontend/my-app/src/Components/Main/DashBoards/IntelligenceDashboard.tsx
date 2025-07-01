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
  Stack,
  Container,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

const IntelligenceDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"IPO" | "FO">("IPO");

  // Independent state for each tab
  const [selectedIpoYears, setSelectedIpoYears] = useState<number[]>([2025]);
  const [selectedFoYears, setSelectedFoYears] = useState<number[]>([2025]);

 const handleIpoYearToggle = (year: number) => {
  setSelectedIpoYears((prev) => {
    if (prev.includes(year)) {
      return prev.length === 1 ? prev : prev.filter((y) => y !== year);
    } else {
      return [...prev, year];
    }
  });
};

const handleFoYearToggle = (year: number) => {
  setSelectedFoYears((prev) => {
    if (prev.includes(year)) {
      return prev.length === 1 ? prev : prev.filter((y) => y !== year);
    } else {
      return [...prev, year];
    }
  });
};

  return (
    <>
      <Container maxWidth="xl">
        <Box display="flex" width="100%" pt={2}>
          <Box display="flex" flexDirection="column" gap={4} width="100%">

            {/* Toggle Buttons */}
            <Box display="flex" justifyContent="center">
              <Stack direction="row" spacing={2}>
                <Paper
                  elevation={selectedTab === "IPO" ? 4 : 1}
                  sx={{
                    px: 3,
                    py: 1,
                    cursor: "pointer",
                    backgroundColor: selectedTab === "IPO" ? "#1565c0" : "#e3f2fd",
                    color: selectedTab === "IPO" ? "#fff" : "#000",
                  }}
                  onClick={() => setSelectedTab("IPO")}
                >
                  IPO
                </Paper>
                <Paper
                  elevation={selectedTab === "FO" ? 4 : 1}
                  sx={{
                    px: 3,
                    py: 1,
                    cursor: "pointer",
                    backgroundColor: selectedTab === "FO" ? "#1565c0" : "#e3f2fd",
                    color: selectedTab === "FO" ? "#fff" : "#000",
                  }}
                  onClick={() => setSelectedTab("FO")}
                >
                  FO
                </Paper>
              </Stack>
            </Box>

            {/* IPO SECTION */}
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
                  <Typography
                    variant="h5"
                    sx={{ color: "#002060", mb: 2, fontWeight: 600 }}
                    align="center"
                  >
                    IPO Deal Intelligence
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
                    mb: 2,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >

                  <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  pt={2}
                  pb={4}
                  gap={2}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select Year(s):
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedIpoYears.includes(2024)}
                        onChange={() => handleIpoYearToggle(2024)}
                      />
                    }
                    label="2024"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedIpoYears.includes(2025)}
                        onChange={() => handleIpoYearToggle(2025)}
                      />
                    }
                    label="2025"
                  />
                </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <MddIpoOpportunityChart
                        selectedYears={selectedIpoYears}
                        selectedTab={selectedTab}
                      />
                    </Grid>
                  </Grid>
                </MotionPaper>
              </>
            )}

            {/* FO SECTION */}
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
                  <Typography
                    variant="h5"
                    sx={{ color: "#002060", mb: 2, fontWeight: 600 }}
                    align="center"
                  >
                    FO Deal Intelligence
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
                    mb: 2,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  pt={2}
                  pb={4}
                  gap={2}
                >
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select Year(s):
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFoYears.includes(2024)}
                        onChange={() => handleFoYearToggle(2024)}
                      />
                    }
                    label="2024"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedFoYears.includes(2025)}
                        onChange={() => handleFoYearToggle(2025)}
                      />
                    }
                    label="2025"
                  />
                </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <MddFoDealsOpportunityChart 
                      selectedYears={selectedFoYears}
                        selectedTab={selectedTab}
                        />
                    </Grid>
                  </Grid>
                </MotionPaper>
              </>
            )}
          </Box>
        </Box>
      </Container>
    </>
  );
};

export default IntelligenceDashboard;

import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  Grid,
  Box,
  Paper,
  Typography,
  Stack,

} from "@mui/material";
import { motion } from "framer-motion";


import WriteUpIPODashbaord from "./WriteUpIPODashbaord";
import RecentWriteUpMain from "./RecentWriteUpMain";

const MotionPaper = motion(Paper);

const WriteupDashboardMain: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"IPO" | "FO">("IPO");









  return (
    <Box width={1800} sx={{ mx: "auto" }}>
      <Box display="flex" width="100%" pt={2}>
        <Box display="flex" flexDirection="column" gap={4} width="100%">
          {/* Toggle Tabs */}
          <Box display="flex" justifyContent="center">
            <Stack direction="row" spacing={2}>
            
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
                  borderRadius: 4,
                }}
              >
                <Typography
                  variant="h5"
                  align="center"
                  sx={{ color: "#002060", fontWeight: 600, mb: 3 }}
                >
                  IPO Market Insights
                </Typography>
                <Typography
                  variant="subtitle1"
                  align="center"
                  sx={{ color: "#002060", fontWeight: 400, mb: 3 }}
                >
                  Stay updated with the latest IPO trends and insights. Analyze recent trends and prepare for upcoming opportunities in the IPO landscape. 
                </Typography>

                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <WriteUpIPODashbaord />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <RecentWriteUpMain />
                  </Grid>
                </Grid>

              </MotionPaper>

            
              
            </>
          )}


        </Box>
      </Box>
    </Box>
  );
};

export default WriteupDashboardMain;

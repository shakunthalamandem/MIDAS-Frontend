import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
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
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import { motion } from "framer-motion";

const MotionPaper = motion(Paper);

const IntelligenceDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"IPO" | "FO">("IPO");
  const [selectedIpoYears, setSelectedIpoYears] = useState<number[]>([2025]);
  const [selectedFoYears, setSelectedFoYears] = useState<number[]>([2025]);

  const handleIpoYearToggle = (year: number) => {
    setSelectedIpoYears((prev) =>
      prev.includes(year) ? (prev.length === 1 ? prev : prev.filter((y) => y !== year)) : [...prev, year]
    );
  };

  const handleFoYearToggle = (year: number) => {
    setSelectedFoYears((prev) =>
      prev.includes(year) ? (prev.length === 1 ? prev : prev.filter((y) => y !== year)) : [...prev, year]
    );
  };

  const handleExportIpoPDF = async () => {
    const input = document.getElementById("ipo-table-section") || document.querySelector('[data-testid="upcoming-ipo-table"]') as HTMLElement;
    if (!input) return;

    const pdfWidth = 1122;
    const pdfHeight = 793;
    const margin = 40; 

  
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    
    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;
    const aspectRatio = canvas.width / canvas.height;

    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
    }

    const x = margin + (availableWidth - imgWidth) / 2;
    const y = margin + (availableHeight - imgHeight) / 2;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(
      canvas,
      "PNG",
      x,
      y,
      imgWidth,
      imgHeight
    );

    pdf.save(`IPO_Table_Region_Wise for Year(s) ${selectedIpoYears}.pdf`);
  };

  
  const handleExportFoPDF = async () => {
    const input = document.getElementById("fo-table-section");
    if (!input) return;

    
    const pdfWidth = 1122;
    const pdfHeight = 793;
    const margin = 40; 

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });

    const availableWidth = pdfWidth - margin * 2;
    const availableHeight = pdfHeight - margin * 2;
    const aspectRatio = canvas.width / canvas.height;

    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;

    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
    }

    const x = margin + (availableWidth - imgWidth) / 2;
    const y = margin + (availableHeight - imgHeight) / 2;

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [pdfWidth, pdfHeight],
    });

    pdf.addImage(
      canvas,
      "PNG",
      x,
      y,
      imgWidth,
      imgHeight
    );

    pdf.save(`FO_Table_Region_Wise for Year(s) ${selectedFoYears}.pdf`);
  };

  return (
    <Box width={1800} sx={{ mx: "auto" }}>
      <Box display="flex" width="100%" pt={2}>
        <Box display="flex" flexDirection="column" gap={4} width="100%">
          {/* Toggle Tabs */}
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
                  borderRadius: 4,
                }}
              >
                <Typography variant="h5" align="center" sx={{ color: "#002060", fontWeight: 600 }}>
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
                  borderRadius: 4,
                  mb: 2,
                }}
              >
                <Box display="flex" justifyContent="center" alignItems="center" pt={2} pb={4} gap={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select Year(s):
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={selectedIpoYears.includes(2024)} onChange={() => handleIpoYearToggle(2024)} />}
                    label="2024"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={selectedIpoYears.includes(2025)} onChange={() => handleIpoYearToggle(2025)} />}
                    label="2025"
                  />
                  <Button
                    variant="contained"
                    onClick={handleExportIpoPDF}
                    sx={{
                      backgroundColor: "#002060",
                      color: "#ffffff",
                      textTransform: "none",
                      px: 3,
                      py: 1,
                      minWidth: "130px",
                    }}
                  >
                    Export to pdf
                  </Button>
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
                  borderRadius: 4,
                }}
              >
                <Typography variant="h5" align="center" sx={{ color: "#002060", fontWeight: 600 }}>
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
                  borderRadius: 4,
                  mb: 2,
                }}
              >
                <Box display="flex" justifyContent="center" alignItems="center" pt={2} pb={4} gap={2}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Select Year(s):
                  </Typography>
                  <FormControlLabel
                    control={<Checkbox checked={selectedFoYears.includes(2024)} onChange={() => handleFoYearToggle(2024)} />}
                    label="2024"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={selectedFoYears.includes(2025)} onChange={() => handleFoYearToggle(2025)} />}
                    label="2025"
                  />
                  <Button
                    variant="contained"
                    onClick={handleExportFoPDF}
                    sx={{
                      backgroundColor: "#002060",
                      color: "#ffffff",
                      textTransform: "none",
                      px: 3,
                      py: 1,
                      minWidth: "130px",
                    }}
                  >
                    Export to pdf
                  </Button>
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
    </Box>
  );
};

export default IntelligenceDashboard;

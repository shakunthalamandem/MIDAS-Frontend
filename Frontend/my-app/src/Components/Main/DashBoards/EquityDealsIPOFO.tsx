import React, { useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import UpcomingIpoTable from "./Equity/UpcomingIpoTable";
import FoPredictionCards from "./Equity/FoPredictionCards";
import MddIpoOpportunityChart from "./Equity/MddIpoOpportunityChart";
import MddFoDealsOpportunityChart from "./Equity/MddFoDealsOpportunityChart";
import RecentIpoTable from "./Equity/RecentIpoTable";
import {
  Box,
  Paper,
  Typography,
  Stack,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";

// Motion Wrapper
const MotionPaper = motion(Paper);

// Years for selection
const yearOptions = [2024, 2025];
const EquityDealsIPOFO: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<"IPO" | "FO">("IPO");
  const [selectedIpoYears, setSelectedIpoYears] = useState<number[]>([
    2024, 2025,
  ]);
  const [selectedFoYears, setSelectedFoYears] = useState<number[]>([
    2024, 2025,
  ]);

  const handleYearToggle = (year: number, isIPO: boolean) => {
    const setSelectedYears = isIPO ? setSelectedIpoYears : setSelectedFoYears;
    const selectedYears = isIPO ? selectedIpoYears : selectedFoYears;

    setSelectedYears((prev) =>
      prev.includes(year)
        ? prev.length === 1
          ? prev
          : prev.filter((y) => y !== year)
        : [...prev, year]
    );
  };

  const handleExportPDF = async (
    sectionId: string,
    years: number[],
    filePrefix: string
  ) => {
    const input = document.getElementById(sectionId);
    if (!input) return;

    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
    });
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1122, 793],
    });

    const margin = 40;
    const availableWidth = 1122 - margin * 2;
    const availableHeight = 793 - margin * 2;
    const aspectRatio = canvas.width / canvas.height;

    let imgWidth = availableWidth;
    let imgHeight = imgWidth / aspectRatio;
    if (imgHeight > availableHeight) {
      imgHeight = availableHeight;
      imgWidth = imgHeight * aspectRatio;
    }

    const x = margin + (availableWidth - imgWidth) / 2;
    const y = margin + (availableHeight - imgHeight) / 2;

    pdf.addImage(canvas, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(`${filePrefix}_Region_Wise_${years.join("_")}.pdf`);
  };

  const renderHeader = (years: number[], isIPO: boolean) => (
    <Box
      display="flex"
      justifyContent="flex-end"
      alignItems="center"
      flexWrap="wrap"
      gap={2}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
        Year(s):
      </Typography>
      {[2024, 2025].map((year) => (
        <FormControlLabel
          key={year}
          control={
            <Checkbox
              checked={years.includes(year)}
              onChange={() => handleYearToggle(year, isIPO)}
            />
          }
          label={year.toString()}
        />
      ))}
      <Button
        variant="contained"
        onClick={() =>
          handleExportPDF(
            isIPO ? "ipo-table-section" : "fo-table-section",
            years,
            isIPO ? "IPO_Table" : "FO_Table"
          )
        }
        sx={{
          backgroundColor: "#002060",
          color: "#fff",
          textTransform: "none",
          px: 2.5,
          py: 1,
        }}
      >
        Export to PDF
      </Button>
    </Box>
  );

  return (
    <Box maxWidth="1800px" mx="auto" px={2} py={3}>
      {/* Toggle Tabs */}
      <Box display="flex" justifyContent="center" mb={3}>
        <Stack direction="row" spacing={2}>
          {["IPO", "FO"].map((label) => (
            <Paper
              key={label}
              elevation={selectedTab === label ? 4 : 1}
              onClick={() => setSelectedTab(label as "IPO" | "FO")}
              sx={{
                px: 3,
                py: 1,
                cursor: "pointer",
                backgroundColor: selectedTab === label ? "#1565c0" : "#e3f2fd",
                color: selectedTab === label ? "#fff" : "#000",
              }}
            >
              {label}
            </Paper>
          ))}
        </Stack>
      </Box>

      {selectedTab === "IPO" && (
        <>
          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#002060", fontWeight: 400, mb: 2 }}
              textAlign="center"
            >
              Stay updated with the latest IPO trends and insights. Analyze
              recent trends and prepare for upcoming opportunities in the IPO
              landscape.
            </Typography>
            <Grid container spacing={3} id="ipo-table-section">
              <Grid item xs={12} md={6}>
                {/* <UpcomingIpoTable /> */}
              </Grid>
              <Grid item xs={12} md={6}>
                <RecentIpoTable />
              </Grid>
            </Grid>
          </MotionPaper>

          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {renderHeader(selectedIpoYears, true)}
            <MddIpoOpportunityChart
              selectedYears={selectedIpoYears}
              selectedTab="IPO"
            />
          </MotionPaper>
        </>
      )}

      {selectedTab === "FO" && (
        <>
          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
            <Typography
              variant="subtitle1"
              sx={{ color: "#002060", fontWeight: 400, mb: 2 }}
              textAlign="center"
            >
              Stay informed with data-driven FO deal insights and predictions.
            </Typography>
            <FoPredictionCards />
          </MotionPaper>

          <MotionPaper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
            {renderHeader(selectedFoYears, false)}
            <MddFoDealsOpportunityChart
              selectedYears={selectedFoYears}
              selectedTab="FO"
            />
          </MotionPaper>
        </>
      )}
    </Box>
  );
};

export default EquityDealsIPOFO;

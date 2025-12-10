import React, { useState } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { MDRDailyPortfolioContainer } from "./MDRDailyPortfolioContainer";
import MDRCummulativeRegionChartMain from "./MDRCharts/MDRCummulativeRegionChartMain";
import MDRRegionWiseTablesDataMain from "./MDRRegionWiseTables/MDRRegionWiseTablesDataMain";
import MDRRegionWiseTopTables from "./MDRCharts/MDRRegionWiseTopTables";
import MDRDailyReportPDFExporter from "./MDRDailyReportPDFExporter";
import MDRFundPerfomanceMain from "./MDRRegionWiseTables/MDRFundPerfomanceMain";

const MDRMainTableS3Data = () => {
  const [pdfMode, setPdfMode] = useState(false);

  const pdfButton = (
    <MDRDailyReportPDFExporter
      targetId="mdr-pdf-root"
      headerTitle="Monashee Daily Portfolio Report"
      fileName="Monashee_Daily_Portfolio_Report.pdf"
      onTogglePdfMode={setPdfMode}
    />
  );

  return (
    <>
      <Box>
        {/* Header */}
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "#FFFFFF",
            fontSize: { xs: "1rem", sm: "1.2rem" },
            backgroundColor: "#002060",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "4vh",
            padding: "8px 16px",
            borderRadius: "8px",
            textAlign: "center",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            animation: "fadeIn 1.5s ease-in-out",
            "@keyframes fadeIn": {
              "0%": { opacity: 0 },
              "100%": { opacity: 1 },
            },
          }}
        >
          Welcome to Monashee Daily Report
        </Typography>

        {/* PDF Content */}
        <Box
          id="mdr-pdf-root"
          sx={{ display: "flex", flexDirection: "column", gap: 3 }}
        >
          <Box className="mdr-pdf-section">
            <MDRDailyPortfolioContainer
              pdfMode={pdfMode}
              actionsSlot={pdfButton}
            />
          </Box>
          <Box className="mdr-pdf-section" data-pdf-break-before="true">
            <MDRCummulativeRegionChartMain />
          </Box>
          <Box className="mdr-pdf-section">
            <MDRRegionWiseTablesDataMain />
          </Box>
          <Box className="mdr-pdf-section">
            <MDRFundPerfomanceMain />
          </Box>
          <Box className="mdr-pdf-section">
            <MDRRegionWiseTopTables />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default MDRMainTableS3Data;

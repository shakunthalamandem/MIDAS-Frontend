import React, { useState } from "react";
import { Container, Typography, Paper, Box, Grid, Select, MenuItem, Button } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import PNLLmvDataTablesMain from "./PNLLmvDataTablesMain";
import DailyNetOfHedgeChart from "./DailyNetOfHedgeChart";
import DtdTopBottomMainPNL from "./DtdTopBottomMainPNL";
import PNLAttributionMarketCap from "./PNLAttributionMarketCap";
import PNLFundReturnsChartsDifference from "./PNLFundReturnsChartsDifference";
import PNLHistoricalChart from "./PNLHistoricalChart";
import PNLRegionWiseTableFundDeatils from "./PNLRegionWiseTableFundDeatils";
import PNLSectorWiseFundDetails from "./PNLSectorWiseFundDetails";

interface PNLRiskReportMainProps {
  fund?: string;
}

const PNLRiskReportMain: React.FC<PNLRiskReportMainProps> = ({ fund }) => {
  const fundOptions = ["BEMAP2", "FMAP", "Mission Pure Alpha LP", "Monashee Pure Alpha SPV I LP", "MPAM"];
  const [selectedFund, setSelectedFund] = useState(fund || "FMAP");

  const today = new Date();
  const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate()
  ).padStart(2, "0")}/${today.getFullYear()}`;

  const handleExportPDF = async () => {
    const input = document.getElementById("pdf-export-area");
    if (!input) return;

    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`PNL_Risk_Report_${selectedFund}.pdf`);
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
      {/* Header with Fund Selector */}
      <Paper
        elevation={8}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: "#f9f9f9",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          mb: 4,
        }}
      >
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={600} color="#002060">
              PNL Risk Report - {selectedFund}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Summary as of {formattedDate}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box display="flex" justifyContent={{ xs: "flex-start", md: "flex-end" }} gap={2} mt={{ xs: 2, md: 0 }}>
              <Select
                value={selectedFund}
                onChange={(e) => setSelectedFund(e.target.value)}
                size="small"
                sx={{
                  minWidth: 200,
                  backgroundColor: "white",
                  borderRadius: 1,
                  "& fieldset": { borderColor: "#002060" },
                  "&:hover fieldset": { borderColor: "#002060" },
                }}
              >
                {fundOptions.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </Select>

              <Button
                variant="contained"
                onClick={handleExportPDF}
                sx={{ backgroundColor: "#002060", color: "#fff", textTransform: "none", px: 3 }}
              >
                Export PDF
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Exportable Content */}
      <Box id="pdf-export-area">
        {/* LMV / P&L Tables */}
        <PNLLmvDataTablesMain fund={selectedFund} />

        {/* Charts Section */}
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={6}>
            <DailyNetOfHedgeChart fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <DtdTopBottomMainPNL fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PNLAttributionMarketCap fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PNLFundReturnsChartsDifference fund={selectedFund} />
          </Grid>
           <Grid item xs={12} md={6}>
            <PNLRegionWiseTableFundDeatils fund={selectedFund} />
          </Grid>
           <Grid item xs={12} md={6}>
            <PNLSectorWiseFundDetails fund={selectedFund} />
          </Grid>
          <Grid item xs={12}>
            <PNLHistoricalChart fund={selectedFund} />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PNLRiskReportMain;

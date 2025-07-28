import React, { useState } from "react";
import {
  Box,
  Select,
  MenuItem,
  Typography,
  Grid,
  Button,
} from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import DealTypeFundMain from "./DealTypeFundMain";
import Top10ExposureChart from "./Top10ExposureChart";
import BottomStocksPNLMain from "./BottomStocksPNLMain";
import MostAgedStocksTable from "./MostAgedStocksTable";
import PortfolioDataTableMain from "./PortfolioDataTableMain";
import PnlAndDaysHeldGraph from "./PnlAndDaysHeldGraph";
import ExposureDtdMtdChartMain from "./ExposureDtdMtdChartMain";
import ExposureByDealTypeChart from "./ExposureByDealTypeChart";
import ExposureDtdMtdBySectorChart from "./ExposureDtdMtdBySectorChart";
import RegionWiseChartPnl from "./RegionWiseChartPnl";
import FundSummaryTable from "./FundSummaryTable";

const AttributionFundMainTab = () => {
  const [selectedFund, setSelectedFund] = useState("FMAP");
  const [maxTradeDate, setMaxTradeDate] = useState<string | null>(null);

  const fundOptions = ["BEMAP2", "FMAP", "Mission Pure Alpha LP", "Monashee Pure Alpha SPV I LP", "MPAM"];

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "short" });
    const year = date.getFullYear();
    const getOrdinal = (n: number) => {
      const s = ["th", "st", "nd", "rd"];
      const v = n % 100;
      return s[(v - 20) % 10] || s[v] || s[0];
    };
    return `${day}${getOrdinal(day)} ${month} ${year}`;
  };

  const handleExportIpoPDF = async () => {
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

    pdf.save(`Fund_Attribution_${selectedFund}.pdf`);
  };

  return (
    <Box
      sx={{
        p: 4,
        background: "#f5f7fa",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header Row: Title & Selector with Button */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <Grid item xs={12} md={6}>
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
            textAlign="center"
          >
            <Typography
              variant="h5"
              sx={{
                background: "linear-gradient(to right, rgba(8, 85, 70, 1), #9e3f00ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 600,
              }}
            >
              {selectedFund} Performance & Attribution Dashboard
            </Typography>
            {maxTradeDate && (
              <Typography variant="body1" sx={{ fontWeight: 500, color: "#991200ff" }}>
                (Data as of: {formatDate(maxTradeDate)})
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2}>
            <Select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              size="small"
              sx={{
                minWidth: 250,
                backgroundColor: "white",
                borderRadius: 1,
                boxShadow: 1,
                "& .MuiSelect-select": {
                  padding: "8px 12px",
                },
                "& fieldset": {
                  borderColor: "#002060",
                },
                "&:hover fieldset": {
                  borderColor: "#002060",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#002060",
                },
              }}
            >
              {fundOptions.map((fund) => (
                <MenuItem key={fund} value={fund}>
                  {fund}
                </MenuItem>
              ))}
            </Select>

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
              Export to PDF
            </Button>
          </Box>
        </Grid>
      </Grid>

      {/* Main Exportable Content */}
      <Box id="pdf-export-area">
        <DealTypeFundMain fund={selectedFund} onMaxTradeDateChange={setMaxTradeDate} />
        <RegionWiseChartPnl fund={selectedFund} />
        <FundSummaryTable fund={selectedFund} />

        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} md={6}>
            <Top10ExposureChart fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <PortfolioDataTableMain fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <MostAgedStocksTable fund={selectedFund} />
          </Grid>
          <Grid item xs={12} md={6}>
            <BottomStocksPNLMain fund={selectedFund} />
          </Grid>
        </Grid>

        <PnlAndDaysHeldGraph fund={selectedFund} />
        <ExposureDtdMtdChartMain fund={selectedFund} />
        <ExposureByDealTypeChart fund={selectedFund} />
        <ExposureDtdMtdBySectorChart fund={selectedFund} />
      </Box>
    </Box>
  );
};

export default AttributionFundMainTab;

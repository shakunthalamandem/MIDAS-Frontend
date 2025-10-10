import React, { useState } from "react";
import { Container, Typography, Paper, Box, Grid, Select, MenuItem } from "@mui/material";

import PNLLmvDataTablesMain from "./PNLLmvDataTablesMain";
import DailyNetOfHedgeChart from "./DailyNetOfHedgeChart";
import DtdTopBottomMainPNL from "./DtdTopBottomMainPNL";
import PNLAttributionMarketCap from "./PNLAttributionMarketCap";
import PNLFundReturnsChartsDifference from "./RiskReportPNLPortfolioTable";
import PNLHistoricalChart from "./RiskReportIndexPortfolioTable";
import PNLSectorWiseFundDetails from "./PNLSectorWiseFundDetails";
import RiskPDFExporter from "./RiskPDFExporter";
import RiskReportDailyPnlvsVarChart from "./RiskReportDailyPnlvsVarChart";
interface PNLRiskReportMainProps {
  fund?: string;
}

const PNLRiskReportMain: React.FC<PNLRiskReportMainProps> = ({ fund }) => {
  const fundOptions = ["BEMAP2", "FMAP", "Mission Pure Alpha LP", "Monashee Pure Alpha SPV I LP", "MPAM"];
  const [selectedFund, setSelectedFund] = useState(fund || "FMAP");

  const today = new Date();
  const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(today.getDate()).padStart(2, "0")}/${today.getFullYear()}`;

  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
      {/* Header with Fund Selector */}
      <Paper elevation={8} sx={{ p: 3, borderRadius: 3, backgroundColor: "#f9f9f9", boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)", mb: 4 }}>
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

              {/* <RiskPDFExporter exportId="pdf-export-area" fileName={`PNL_Risk_Report_${selectedFund}.pdf`} /> */}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Exportable Content */}
      <Box id="pdf-export-area">
        <Box className="pdf-section">
          <PNLLmvDataTablesMain fund={selectedFund} />
        </Box>



        <Grid container spacing={3} mt={2}>

          <Grid item xs={12}>
            <Box className="pdf-section">
              <PNLAttributionMarketCap fund={selectedFund} />
            </Box>
          </Grid>
                    <Grid item xs={12} md={6}>
            <Box className="pdf-section">
              <PNLSectorWiseFundDetails fund={selectedFund} />
            </Box>
          </Grid>
                    <Grid item xs={12} md={6}>
            <Box className="pdf-section">
              <RiskReportDailyPnlvsVarChart fund={selectedFund} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="pdf-section">
              <DtdTopBottomMainPNL fund={selectedFund} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="pdf-section">
              <DailyNetOfHedgeChart fund={selectedFund} />
            </Box>
          </Grid>

   
          <Grid item xs={12}>
            <Box className="pdf-section">
              <PNLFundReturnsChartsDifference fund={selectedFund} />
            </Box>
          </Grid>


          <Grid item xs={12}>
            <Box className="pdf-section">
              <PNLHistoricalChart fund={selectedFund} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PNLRiskReportMain;

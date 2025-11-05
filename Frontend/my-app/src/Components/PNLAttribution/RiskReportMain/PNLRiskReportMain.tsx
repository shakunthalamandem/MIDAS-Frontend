import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Typography,
  Paper,
  Box,
  Grid,
  Select,
  MenuItem,
} from "@mui/material";

import PNLLmvDataTablesMain from "./PNLLmvDataTablesMain";
import DailyNetOfHedgeChart from "./DailyNetOfHedgeChart";
import DtdTopBottomMainPNL from "./DtdTopBottomMainPNL";
import PNLAttributionMarketCap from "./PNLAttributionMarketCap";
import PNLFundReturnsChartsDifference from "./RiskReportPNLPortfolioTable";
import RiskReportIndexPortfolioTable from "./RiskReportIndexPortfolioTable";
import PNLSectorWiseFundDetails from "./PNLSectorWiseFundDetails";
import RiskPDFExporter from "./RiskPDFExporter";
import RiskReportDailyPnlvsVarChart from "./RiskReportDailyPnlvsVarChart";
import RiskReportRegionWiseTable from "./RiskReportRegionWiseTable";
import CumulativeFundReturnChart from "./CumulativeFundReturnChart";
interface PNLRiskReportMainProps {
  fund?: string;
}

const PNLRiskReportMain: React.FC<PNLRiskReportMainProps> = ({ fund }) => {
  const fundOptions = [
    "BEMAP2",
    "FMAP",
    "Mission Pure Alpha LP",
    "Monashee Pure Alpha SPV I LP",
    "MPAM",
    "BHM",
    "GEPT",
  ];

  const [selectedFund, setSelectedFund] = useState(fund || "FMAP");
  const [maxTradeDate, setMaxTradeDate] = useState<string>("");

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // Fetch latest trade date whenever selectedFund changes
  useEffect(() => {
    const fetchMaxTradeDate = async () => {
      try {
        const res = await fetch(`${apiUrl}/api/risk_report_max_trade_date/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ fund: selectedFund }),
        });

        if (!res.ok) {
          const err = await res.json();
          console.error("Error fetching max trade date:", err);
          setMaxTradeDate("N/A");
          return;
        }

        const data = await res.json();
        setMaxTradeDate(data.max_trade_date || "N/A");
      } catch (error) {
        console.error("Error fetching max trade date:", error);
        setMaxTradeDate("N/A");
      }
    };

    fetchMaxTradeDate();
  }, [selectedFund, apiUrl, token]);

  const formattedTradeDate = useMemo(() => {
    if (!maxTradeDate || maxTradeDate === "N/A") {
      return "N/A";
    }
    const parsed = new Date(maxTradeDate);
    if (Number.isNaN(parsed.getTime())) {
      return maxTradeDate;
    }
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, [maxTradeDate]);

  const pdfCardStyles = {
    backgroundColor: "#ffffff",
    borderRadius: 3,
    boxShadow: "0px 24px 48px rgba(0, 32, 96, 0.08)",
    border: "1px solid rgba(0, 32, 96, 0.06)",
    padding: "24px",
    overflow: "hidden",
  };

  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
      {/* Header with Fund Selector */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, backgroundColor: "#ffffff", boxShadow: "0px 20px 48px rgba(0,32,96,0.08)", mb: 4 }}>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={12} md={6}>
            <Typography variant="h6" color="#002060" fontWeight={600}>
              {selectedFund}: Summary as of{" "}
              {formattedTradeDate}
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              display="flex"
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              alignItems="center"
              gap={2}
              mt={{ xs: 2, md: 0 }}
            >
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
              <RiskPDFExporter
                exportId="pdf-export-area"
                fileName={`${selectedFund}_Risk_Report.pdf`}
                buttonText="Generate PDF"
              />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Main Exportable Content */}
      <Box id="pdf-export-area">
        <Box
          className="pdf-section"
          sx={{
            backgroundColor: "#ffffff",
            borderRadius: 4,
            boxShadow: "0px 30px 60px rgba(0, 32, 96, 0.12)",
            border: "1px solid rgba(0, 32, 96, 0.1)",
            p: { xs: 4, md: 6 },
            textAlign: "center",
            mb: 4,
          }}
        >
          <Typography variant="h3" sx={{ color: "#002060", fontWeight: 700, mb: 2 }}>
            Risk Report
          </Typography>
          <Typography variant="h4" sx={{ color: "#002060", fontWeight: 600, mb: 1 }}>
            {selectedFund}
          </Typography>
          <Typography variant="h6" sx={{ color: "rgba(0, 32, 96, 0.8)", fontWeight: 500 }}>
            As of {formattedTradeDate}
          </Typography>
        </Box>

        <Box className="pdf-section" sx={{ ...pdfCardStyles, mb: 4 }}>
          <PNLLmvDataTablesMain fund={selectedFund} />
        </Box>

        <Grid container spacing={3} mt={2}>
          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <RiskReportRegionWiseTable fund={selectedFund} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <CumulativeFundReturnChart fund={selectedFund} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <PNLAttributionMarketCap fund={selectedFund} />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <PNLSectorWiseFundDetails fund={selectedFund} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <RiskReportDailyPnlvsVarChart fund={selectedFund} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <DtdTopBottomMainPNL fund={selectedFund} />
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <DailyNetOfHedgeChart fund={selectedFund} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <PNLFundReturnsChartsDifference fund={selectedFund} />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box className="pdf-section" sx={pdfCardStyles}>
              <RiskReportIndexPortfolioTable fund={selectedFund} />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default PNLRiskReportMain;

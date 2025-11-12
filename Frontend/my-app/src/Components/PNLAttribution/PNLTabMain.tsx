import React from "react";
import {
  Box,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Typography,
  Fade,
} from "@mui/material";
import BarChartIcon from "@mui/icons-material/BarChart";
import TableRowsIcon from "@mui/icons-material/TableRows";
import { useNavigate, useParams } from "react-router-dom";

import PnlAttributionMain from "./PnlAttributionMain";
import PNLGraphsMain from "./PNLCharts/PNLGraphsMain";
import PNLPagesMain from "./PNLPages/PNLPagesMain";
import AttributionFundMainTab from "./AttributionFundMain/AttributionFundMainTab";
import PNLRiskReportMain from "./RiskReportMain/PNLRiskReportMain";

const PNLTabMain = () => {
  const navigate = useNavigate();
  const { tab = "summary_pnl" } = useParams(); // Get tab from URL or fallback to default

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTab = (event.target as HTMLInputElement).value;
    navigate(`/portfolio-attribution/${newTab}`);
  };

  return (
    <Box>
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
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to Monashee's latest P&L performance overview.
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, mt: 2 }}>
        <FormControl>
          <RadioGroup
            row
            value={tab}
            onChange={handleChange}
            sx={{
              gap: 3,
              "& .MuiFormControlLabel-root": {
                px: 2,
                py: 0.5,
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "#e3f2fd",
                },
              },
            }}
          >
            <FormControlLabel
              value="summary_pnl"
              control={
                <Radio
                  sx={{
                    color: "#00796b",
                    "&.Mui-checked": { color: "#00796b" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#5d0163" }}>
                  <BarChartIcon fontSize="small" />
                  <Typography variant="h6">Summary P&L</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="total_pnl_attribution"
              control={
                <Radio
                  sx={{
                    color: "#00796b",
                    "&.Mui-checked": { color: "#00796b" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#5d0163" }}>
                  <TableRowsIcon fontSize="small" />
                  <Typography variant="h6">Total P&L Attribution</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="equities__pnl_attribution"
              control={
                <Radio
                  sx={{
                    color: "#00796b",
                    "&.Mui-checked": { color: "#00796b" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#5d0163" }}>
                  <BarChartIcon fontSize="small" />
                  <Typography variant="h6">Equities P&L Attribution</Typography>
                </Box>
              }
            />
            <FormControlLabel
              value="pnlfunddeatils"
              control={
                <Radio
                  sx={{
                    color: "#00796b",
                    "&.Mui-checked": { color: "#00796b" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#5d0163" }}>
                  <BarChartIcon fontSize="small" />
                  <Typography variant="h6">Daily Note to Fund</Typography>
                </Box>
              }
            />
             <FormControlLabel
              value="pnl_risk_report"
              control={
                <Radio
                  sx={{
                    color: "#00796b",
                    "&.Mui-checked": { color: "#00796b" },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#5d0163" }}>
                  <BarChartIcon fontSize="small" />
                  <Typography variant="h6">Risk Report to Fund</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Animated Content Switch */}
      <Fade in={tab === "summary_pnl"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{tab === "summary_pnl" && <PNLGraphsMain />}</Box>
      </Fade>
      <Fade in={tab === "total_pnl_attribution"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{tab === "total_pnl_attribution" && <PnlAttributionMain />}</Box>
      </Fade>
      <Fade in={tab === "equities__pnl_attribution"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{tab === "equities__pnl_attribution" && <PNLPagesMain />}</Box>
      </Fade>
      <Fade in={tab === "pnlfunddeatils"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{tab === "pnlfunddeatils" && <AttributionFundMainTab />}</Box>
      </Fade>
        <Fade in={tab === "pnl_risk_report"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{tab === "pnl_risk_report" && <PNLRiskReportMain />}</Box>
      </Fade>
    </Box>
  );
};

export default PNLTabMain;

import React, { useState } from "react";
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

import PnlAttributionMain from "./PnlAttributionMain";
import PNLGraphsMain from "./PNLCharts/PNLGraphsMain";
import PNLPagesMain from "./PNLPages/PNLPagesMain";

const PNLTabMain = () => {
  const [selectedView, setSelectedView] = useState("summary_pnl");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedView((event.target as HTMLInputElement).value);
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          mb: 2,
          mt: 2,
        }}
      >
        <FormControl>
          <RadioGroup
            row
            value={selectedView}
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
                    "&.Mui-checked": {
                      color: "#00796b",
                    },
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
                    "&.Mui-checked": {
                      color: "#00796b",
                    },
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
                    "&.Mui-checked": {
                      color: "#00796b",
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#5d0163" }}>
                  <BarChartIcon fontSize="small" />
                  <Typography variant="h6">Equities	 P&L Attribution</Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Animated Content Switch */}
      <Fade in={selectedView === "summary_pnl"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{selectedView === "summary_pnl" && <PNLGraphsMain />}</Box>
      </Fade>
      <Fade in={selectedView === "total_pnl_attribution"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{selectedView === "total_pnl_attribution" && <PnlAttributionMain />}</Box>
      </Fade>
      <Fade in={selectedView === "equities__pnl_attribution"} timeout={400} mountOnEnter unmountOnExit>
        <Box>{selectedView === "equities__pnl_attribution" && <PNLPagesMain />}</Box>
      </Fade>
    </Box>
  );
};

export default PNLTabMain;
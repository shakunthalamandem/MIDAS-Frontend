import React, { useState } from "react";
import { Box, FormControl, FormControlLabel, Radio, RadioGroup, Typography } from "@mui/material";
import Fundwisedata from "./Fundwisedata";
import Sectorwisedata from "./Sectorwisedata";

import DashboardFilter from "./DashboardFilter";

const PortfolioAttribution: React.FC = () => {
  const [view, setView] = useState<string>("fund");

  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff", p: 2 }}>
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
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 2s ease-out",
        }}
      >
        Uncover the driving forces behind your portfolio’s performance with detailed attribution analysis.
      </Typography>
      {/* Radio Buttons for selecting Fund or Sector */}
      <Box sx={{ display: "flex", justifyContent: "center", marginBottom: 2 }}>
        <FormControl component="fieldset">
          <RadioGroup row value={view} onChange={(e) => setView(e.target.value)}>
            <FormControlLabel value="Dashboard" control={<Radio />} label="Dashboard" />
            <FormControlLabel value="fund" control={<Radio />} label="Fund" />
            <FormControlLabel value="sector" control={<Radio />} label="Sector" />
          </RadioGroup>
        </FormControl>
      </Box>

      {/* Correct conditional rendering */}
      {view === "Dashboard" ? (
        <DashboardFilter />
      ) : view === "fund" ? (
        <Fundwisedata />
      ) : (
        <Sectorwisedata />
      )}
    </Box>
  );
};

export default PortfolioAttribution;
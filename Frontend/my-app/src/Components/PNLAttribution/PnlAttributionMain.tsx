import React from "react";
import { Box, Typography } from "@mui/material";
import AssestTypePnlAttribution from "./AssestTypePnlAttribution";
import PnLSummary from "./PnLSummary";
import PnlAttributionTable from "./PnlAttributionTable";

const PnlAttributionMain = () => {
  return (
    <Box sx={{ width: "100%", backgroundColor: "#fff" }}>
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

      {/* Components section */}
      <>
        <PnLSummary />
        <PnlAttributionTable />
      </>
    </Box>
  );
};

export default PnlAttributionMain;

import React, { Suspense } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useParams } from "react-router-dom";

const IPODashboardMain = React.lazy(
  () => import("../../IPODashboardLLM/IPODashboardMain")
);

interface WriteUpIPODashbaordProps {
  ticker?: string;
}

const WriteUpIPODashbaord: React.FC<WriteUpIPODashbaordProps> = ({ ticker }) => {
  const { ticker: paramTicker } = useParams<{ ticker: string }>();
  const selectedTicker = ticker ?? paramTicker ?? "";

  return (
    <>
          <Box
        sx={{
          backgroundColor: "#0b2a6b",
          color: "#fff",
          py: 1.2,
          textAlign: "center",
          mb: 3,
          boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, letterSpacing: 0.2 }}
        >
          Welcome to detailed Insights on IPO Write-Ups!
        </Typography>
      </Box>
      <Suspense
        fallback={
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              py: 4,
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
              Loading IPO write-up for <strong>{selectedTicker}</strong>
            </Typography>
          </Box>
        }
      >
        <IPODashboardMain selectedTicker={selectedTicker} />
      </Suspense>
    </>
  );
};

export default WriteUpIPODashbaord;

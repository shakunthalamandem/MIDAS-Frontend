import React from "react";
import { Box, Typography, Paper, Stack } from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import NewDealsUpcomingRecent from "./NewDealsUpcomingRecent";

const NewDealsCycleMain: React.FC = () => {
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 2, sm: 3 },
          py: { xs: 1.2, sm: 1.6 },
          borderRadius: 999,
          textAlign: "center",
          mb: 2.5,
          background:
            "linear-gradient(135deg, #0a2b7a 0%, #002060 45%, #001745 100%)",
          boxShadow: "0 12px 26px rgba(0,32,96,0.32)",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-1px)",
            boxShadow: "0 16px 32px rgba(0,32,96,0.38)",
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.35)",
            }}
          >
            <TrendingUpIcon fontSize="small" sx={{ color: "#ffffff" }} />
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 700,
              color: "#FFFFFF",
              fontSize: { xs: "0.95rem", sm: "1.1rem" },
              letterSpacing: 0.2,
            }}
          >
            Welcome to Deal Flow Tracker: IPOs, Follow-Ons
          </Typography>
        </Stack>
      </Paper>

      <NewDealsUpcomingRecent />
    </Box>
  );
};

export default NewDealsCycleMain;

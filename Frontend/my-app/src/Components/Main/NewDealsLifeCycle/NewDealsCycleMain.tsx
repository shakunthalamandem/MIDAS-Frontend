import React, { useState } from "react";
import { Grid, Box, Typography, Container } from "@mui/material";
import NewDealsUpcomingRecent from "./NewDealsUpcomingRecent";


const NewDealsCycleMain: React.FC = () => {

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
        }}
      >
        Welcome to 📊 Deal Flow Tracker: IPOs, Follow-Ons
      </Typography>

      <NewDealsUpcomingRecent />
     
    </Box>
  );
};

export default NewDealsCycleMain;

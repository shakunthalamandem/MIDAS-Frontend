import React from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import "./SectionOne.css"; // Import the CSS file for styling

const SectionOne: React.FC = () => {
  return (
    <Box className="section-one">
      <Grid container className="section-one-grid" alignItems="center">
        {/* Left Side: Text and Buttons */}
        <Grid item xs={12} md={6}>
          <Box className="section-one-content">
            <Typography
              variant="h3"
              className="section-one-heading"
              gutterBottom
            >
              {/* Your Lens Into the Entire Cryptoeconomy */}
              Your Comprehensive Platform for New Issue Market
            </Typography>
            <Typography
              variant="h4"
              className="section-one-text"
              gutterBottom
            >
             Monashee Insights & Data Application System "MIDAS"
            </Typography>
            <Box
              className="section-one-buttons"
              mt={2}
              sx={{ display: "flex", gap: 4 }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#dd6d2f",
                  fontWeight:'bold',
                  "&:hover": {
                    backgroundColor: "#c55e28",
                  },
                }}
              >
                Monashee Insights
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#dd6d2f",
                  fontWeight:'bold',
                  "&:hover": {
                    backgroundColor: "#c55e28",
                  },
                }}
              >
                Request Demo
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* Right Side: Empty */}
        <Grid item xs={12} md={6}></Grid>
      </Grid>
    </Box>
  );
};

export default SectionOne;

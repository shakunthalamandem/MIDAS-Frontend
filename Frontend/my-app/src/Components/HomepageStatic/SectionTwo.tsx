import React from "react";
import { Typography, Grid, Container, Button, Box } from "@mui/material";
import "./SectionTwo.css";
import Imagecard from "../../Assets/images/sec2image.jpg";
import logo from '../../Assets/images/MIDAS_logo.png' // Corrected import

const SectionTwo: React.FC = () => (
  <Container maxWidth="lg" className="section-container">
    <Grid
      container
      spacing={2}
      // mt={4}
      alignItems="stretch" // Ensure all child grids have the same height
      className="section-content"
    >
      {/* Left Column */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          backgroundImage: `url(${Imagecard})`,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          color: "white",
          padding: "1rem",
          display: "flex", // Aligns content vertically
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography
          className="section-title"
          variant="h4"
          gutterBottom
          style={{ fontWeight: "bold" }} // Makes text bold
        >
          Monashee Proprietary Database for insights into IPO's and Follow-on's
        </Typography>
        
        
      </Grid>

      {/* Right Column */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex", // Align content to match Left Column
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Typography className="section-title" variant="h4" gutterBottom>
          Amberdata Introduces Digital Asset Portfolio Management
        </Typography>
        <Typography className="section-text" variant="body1">
          Amberdata’s new portfolio management suite offers a seamless way to
          view holdings across supported blockchains and exchanges. From balance
          updates to profit-and-loss details, portfolio managers have access to
          the most accurate and up-to-date information about their assets,
          helping them stay on top of evolving market conditions.
        </Typography>
        <Box
          sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
        >
          <Button
            variant="contained"
            sx={{
              width: "200px",
              border: "1px solid #c55e28",
              color: "#dd6d2f",
              backgroundColor: "#ffffff",
              fontWeight: "bold",
              "&:hover": {
                border: "1px solid #c55e28",
                backgroundColor: "#ffffff",
              },
            }}
          >
            Learn More
          </Button>
        </Box>
      </Grid>
    </Grid>
  </Container>
);

export default SectionTwo;

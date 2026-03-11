import React from "react";
import { Typography, Grid, Container, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import "./SectionTwo.css";
import Imagecard from "../../Assets/images/section2img.png";
import logo from '../../Assets/images/MIDAS_logo.png' // Corrected import

const SectionTwo: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/agents/dashboard');
  };

  return (
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
            alignItems: "left",
            justifyContent: "center",
          }}
        >
          {/* <Typography
          className="section-title"
          gutterBottom
          style={{ fontWeight: "bold",fontSize:'28px' }} // Makes text bold
        >
          Monashee Proprietary Database for insights into IPO's and Follow-on's
        </Typography> */}


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
          <Typography className="section-title" variant="h4" style={{ color: '#002060', fontWeight: 'bold' }}>
            Monashee Proprietary Database for insights into IPO's and Follow-on's
          </Typography>
          <Typography className="section-text" variant="body1">
            Monashee's new real-time data platform enables investment decisions based on performance of similar new issue transactions (by sub-sector, by bank, by strategy) and utilizing Artificial Intelligence (AI) based machine learning models to predict the potential returns and help improve the overall skew of the portfolio towards positively performing investments.
          </Typography>
          <br />
          <Typography className="section-text" variant="body1" style={{ fontWeight: 'bold', color: '#002060' }}>
            Stay tuned for our <span style={{ cursor: 'pointer' }} onClick={handleLearnMore}>risk</span> management tools.
          </Typography>
          <Box
            sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}
          >
            <Button
              variant="contained"
              onClick={handleLearnMore}
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
};

export default SectionTwo;

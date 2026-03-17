import React from "react";
import { Typography, Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import "./SectionTwo.css";
import Imagecard from "../../Assets/images/section2imgnew.png";

const SectionTwo: React.FC = () => {
  const navigate = useNavigate();

  const handleLearnMore = () => {
    navigate('/agents/dashboard');
  };

  return (
    <Box className="section-two-wrapper">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <Box className="section-two-body">
          {/* Left - Image */}
          <Box className="section-two-image-container">
            <img src={Imagecard} alt="MIDAS Dashboard" />
          </Box>

          {/* Right - Title + Text + Button */}
          <Box className="section-two-content">
            <Typography className="section-two-title">
              Monashee Proprietary Database for insights into IPO's and Follow-on's
            </Typography>
            <Typography className="section-two-text">
              Monashee's new real-time data platform enables investment decisions based on
              performance of similar new issue transactions (by sub-sector, by bank, by strategy)
              and utilizing Artificial Intelligence (AI) based machine learning models to predict
              the potential returns and help improve the overall skew of the portfolio towards
              positively performing investments.
            </Typography>
            <Typography className="section-two-highlight" sx={{ mt: 1 }}>
              Stay tuned for our risk management tools.
            </Typography>
            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                onClick={handleLearnMore}
                sx={{
                  background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
                  fontWeight: 600,
                  color: "white",
                  borderRadius: "10px",
                  padding: "10px 28px",
                  fontSize: "0.9rem",
                  textTransform: "none",
                  boxShadow: "0 4px 20px rgba(255, 126, 95, 0.25)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ff6a4d, #fd9c67)",
                    boxShadow: "0 6px 24px rgba(255, 126, 95, 0.35)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Box>
  );
};

export default SectionTwo;

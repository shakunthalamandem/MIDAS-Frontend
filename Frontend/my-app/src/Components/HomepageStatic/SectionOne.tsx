import React, { useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import RequestDemoModal from "./RequestDemoModal";
import "./SectionOne.css";

const SectionOne: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  const handleNavigate = () => navigate("/opportunity/summary");

  return (
    <Box className="section-one">
      <Grid container className="section-one-grid" alignItems="center">
        <Grid item xs={12} md={7}>
          <Box className="section-one-content">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <Typography variant="h3" className="section-one-heading" gutterBottom>
                Capital Markets Intelligence driven by Proprietary AI
              </Typography>
              <Typography variant="h6" className="section-one-text" gutterBottom>
                Monashee Insights & Data Application System "MIDAS"
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              style={{ display: "flex", gap: "1rem", marginTop: "2rem", flexWrap: "wrap" }}
            >
              <Button
                variant="contained"
                onClick={handleNavigate}
                sx={{
                  background: "linear-gradient(135deg, #ff7e5f, #feb47b)",
                  fontWeight: 600,
                  color: "white",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  fontSize: "0.9rem",
                  textTransform: "none",
                  boxShadow: "0 4px 20px rgba(255, 126, 95, 0.3)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #ff6a4d, #fd9c67)",
                    boxShadow: "0 6px 24px rgba(255, 126, 95, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Monashee Insights
              </Button>
              <Button
                variant="contained"
                onClick={handleOpenModal}
                sx={{
                  background: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(10px)",
                  fontWeight: 600,
                  color: "white",
                  borderRadius: "10px",
                  padding: "12px 28px",
                  fontSize: "0.9rem",
                  textTransform: "none",
                  border: "1px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    background: "rgba(255, 255, 255, 0.18)",
                    borderColor: "rgba(255,255,255,0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                Request Demo
              </Button>
            </motion.div>
          </Box>
        </Grid>
      </Grid>
      <RequestDemoModal open={openModal} onClose={handleCloseModal} />
    </Box>
  );
};

export default SectionOne;

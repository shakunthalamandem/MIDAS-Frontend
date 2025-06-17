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
        <Grid item xs={12} md={6}>
          <Box className="section-one-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Typography variant="h3" className="section-one-heading" gutterBottom>
                Your Comprehensive Platform for New Issue Market
              </Typography>
              <Typography variant="h4" className="section-one-text" gutterBottom>
                Monashee Insights & Data Application System "MIDAS"
              </Typography>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="section-one-buttons"
              style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
            >
              <Button
                variant="contained"
                onClick={handleNavigate}
                sx={{
                  background: "linear-gradient(45deg, #ff7e5f, #feb47b)",
                  fontWeight: "bold",
                  color: "white",
                  borderRadius: "8px",
                  padding: "0.8rem 1.5rem",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #ff6a5f, #fd9c67)",
                  },
                }}
              >
                Monashee Insights
              </Button>
              <Button
                variant="contained"
                // onClick={handleOpenModal}
                sx={{
                  background: "linear-gradient(45deg, #36d1dc, #5b86e5)",
                  fontWeight: "bold",
                  color: "white",
                  borderRadius: "8px",
                  padding: "0.8rem 1.5rem",
                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": {
                    background: "linear-gradient(45deg, #2db9c3, #4a74c5)",
                  },
                }}
              >
                Request Demo
              </Button>
            </motion.div>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          {/* Placeholder for any image or graphics */}
        </Grid>
      </Grid>
      <RequestDemoModal open={openModal} onClose={handleCloseModal} />
    </Box>
  );
};

export default SectionOne;

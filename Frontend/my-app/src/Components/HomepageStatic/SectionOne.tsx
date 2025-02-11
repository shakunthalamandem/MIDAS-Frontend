import React, { useState } from "react";
import { Box, Typography, Button, Grid } from "@mui/material";
import RequestDemoModal from "./RequestDemoModal"; 
import "./SectionOne.css";

const SectionOne: React.FC = () => {
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleFormSubmit = (formData: { name: string; phone: string; email: string }) => {
    console.log("Form submitted with data:", formData);
  };

  return (
    <Box className="section-one">
      <Grid container className="section-one-grid" alignItems="center">
        <Grid item xs={12} md={6}>
          <Box className="section-one-content">
            <Typography variant="h3" className="section-one-heading" gutterBottom>
              Your Comprehensive Platform for New Issue Market
            </Typography>
            <Typography variant="h4" className="section-one-text" gutterBottom>
              Monashee Insights & Data Application System "MIDAS"
            </Typography>
            <Box className="section-one-buttons" mt={2} sx={{ display: "flex", gap: 4 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#dd6d2f",
                  fontWeight: "bold",
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
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#c55e28",
                  },
                }}
                onClick={handleOpenModal}
              >
                Request Demo
              </Button>
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}></Grid>
      </Grid>

      <RequestDemoModal
        open={openModal}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default SectionOne;

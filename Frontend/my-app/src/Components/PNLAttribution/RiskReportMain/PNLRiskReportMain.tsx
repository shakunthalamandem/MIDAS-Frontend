import { Container, Typography } from "@mui/material";
import React from "react";

const PNLRiskReportMain = () => {
  return (
    <>
      <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
        {" "}
        <Typography variant="h6" color="#002060" fontWeight={600} gutterBottom>
          Risk Report to Fund
        </Typography>
      </Container>
    </>
  );
};

export default PNLRiskReportMain;

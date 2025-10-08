import { Container, Typography, Paper, Box } from "@mui/material";
import React from "react";
import PNLLmvDataTablesMain from "./PNLLmvDataTablesMain"; // make sure path is correct

const PNLRiskReportMain = () => {
  const defaultFund = "FMAP"; // default fund

  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
      <Typography
        variant="h5"
        color="#002060"
        fontWeight={700}
        gutterBottom
        sx={{ mb: 3 }}
      >
        Risk Report to Fund
      </Typography>

      {/* Card container */}
      <Paper
        elevation={8}
        sx={{
          p: 3,
          borderRadius: 3,
          backgroundColor: "#f9f9f9",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box>
          <PNLLmvDataTablesMain fund={defaultFund} />
        </Box>
      </Paper>
    </Container>
  );
};

export default PNLRiskReportMain;

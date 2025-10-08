import { Container, Typography, Paper, Box } from "@mui/material";
import React from "react";
import PNLLmvDataTablesMain from "./PNLLmvDataTablesMain"; // make sure path is correct

const PNLRiskReportMain = () => {
  const defaultFund = "FMAP"; // default fund

  // Get today's date in MM/DD/YYYY format
  const today = new Date();
  const formattedDate = `${String(today.getMonth() + 1).padStart(2, "0")}/${String(
    today.getDate()
  ).padStart(2, "0")}/${today.getFullYear()}`;

  return (
    <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
     

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
        <Box sx={{ mb: 2 }}>
          {/* Dynamic fund summary heading */}
          <Typography variant="h6" fontWeight={600} color="#002060" align="center">
            {`${defaultFund}: Summary as of ${formattedDate}`}
          </Typography>
        </Box>

        <Box>
          <PNLLmvDataTablesMain fund={defaultFund} />
        </Box>
      </Paper>
    </Container>
  );
};

export default PNLRiskReportMain;

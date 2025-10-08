import { Container, Typography } from "@mui/material";
import React from "react";
import PNLLmvDataTablesMain from "./PNLLmvDataTablesMain"; // make sure path is correct

const PNLRiskReportMain = () => {
  const defaultFund = "FMAP"; // default fund

  return (
    <>
      <Container sx={{ mt: 4, mb: 4 }} maxWidth="xl">
        <Typography
          variant="h6"
          color="#002060"
          fontWeight={600}
          gutterBottom
        >
          Risk Report to Fund
        </Typography>

        {/* Pass default fund to the table component */}
        <PNLLmvDataTablesMain fund={defaultFund} />
      </Container>
    </>
  );
};

export default PNLRiskReportMain;

import React, { useState } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Card,
  CardContent,
  Fade,
} from "@mui/material";
import NewPNLAttributionMain from "./NewPNLAttributionMain";
import RiskReportSectionMain from "./RiskReportSectionMain";

const PNLAttributionSectionMain = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ padding: 0, marginBottom: 4 }}>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        PNL Attribution & Risk Report
      </Typography>

      <Card sx={{ boxShadow: 3, borderRadius: 2, mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            centered
            TabIndicatorProps={{
              style: { display: "none" },
            }}
            sx={{
              display: "flex",
              justifyContent: "center",
              margin: "10px 0",
              "& .MuiTab-root": {
                backgroundColor: "#E3E6F0",
                color: "#002060",
                borderRadius: "12px",
                padding: "10px 20px",
                fontSize: "0.9rem",
                fontWeight: "600",
                textTransform: "none",
                margin: "0 8px",
                transition:
                  "transform 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "#DCE6F0",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                },
              },
              "& .Mui-selected": {
                backgroundColor: "#013e3a",
                color: "#ffffff !important",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <Tab label="PNL Attribution" />
            <Tab label="Risk Report" />
          </Tabs>
        </CardContent>
      </Card>

      <Card
        sx={{
          boxShadow: 4,
          borderRadius: 2,
          mb: 4,
          transition: "0.5s ease",
        }}
      >
        <CardContent>
          <Fade in={tabValue === 0} timeout={400} mountOnEnter unmountOnExit>
            <Box>{tabValue === 0 && <NewPNLAttributionMain />}</Box>
          </Fade>
          <Fade in={tabValue === 1} timeout={400} mountOnEnter unmountOnExit>
            <Box>{tabValue === 1 && <RiskReportSectionMain />}</Box>
          </Fade>
        </CardContent>
      </Card>
    </Container>
  );
};

export default PNLAttributionSectionMain;

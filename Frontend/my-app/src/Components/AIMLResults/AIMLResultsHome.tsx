import React from "react";
import {
  Avatar,
  Box,
  Card,
  Container,
  Typography,
  useTheme,
} from "@mui/material";

const AIMLResultsHome: React.FC = () => {
  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <Box sx={{ width: { xs: "96%", sm: "90%", md: "80%" } }}>
          <Box
            sx={{
              fontWeight: 500,
              color: "#FFFFFF",
              fontSize: { xs: "1rem", sm: "1.15rem" },
              backgroundColor: "#002060",
              textAlign: "center",
              py: 1.25,
              borderRadius: 2,
              mt: 1.5,
              mb: 2,
            }}
          >
            Welcome to the AI-ML Results Dashboard! Here, you can explore and
            analyze the outcomes of our machine learning models.
          </Box>

          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 4,
              p: { xs: 2, md: 3 },
            }}
          >
            {/* Work zone
            <Box sx={{ backgroundColor: "#f7f9fc", p: { xs: 2, md: 3 }, borderRadius: 2 }}>
              <PredictionLayout options={options} />
            </Box> */}
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default AIMLResultsHome;

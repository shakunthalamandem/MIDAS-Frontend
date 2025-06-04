import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ConstructionIcon from "@mui/icons-material/Construction";
import { useNavigate } from "react-router-dom";

const PageUnderDevelopment: React.FC = () => {
  const navigate = useNavigate(); // remove if you're not using react-router

  return (
    <Box
      sx={{
        // height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f9f9f9",
        textAlign: "center",
        p: 2,
      }}
    >
      <ConstructionIcon sx={{ fontSize: 100, color: "#FFA726", mb: 2 }} />
      <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
        Page Under Development
      </Typography>
      <Typography variant="body1" sx={{ color: "text.secondary", mb: 3 }}>
        We’re working hard to bring you this feature. Please check back soon!
      </Typography>
      <Button
        variant="contained"
       
        onClick={() => navigate("/")}
        sx={{ borderRadius: "20px", px: 4 ,bgcolor: "#124124", color: "#fff", "&:hover": { bgcolor: "#FF9800" } }}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default PageUnderDevelopment;

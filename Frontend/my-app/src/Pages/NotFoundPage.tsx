import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        bgcolor: "#f8f9fa",
      }}
    >
      <Typography
        component={motion.h1}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
        variant="h2"
        fontWeight="bold"
        color="primary"
      >
        404
      </Typography>
      <Typography variant="h5" color="textSecondary" sx={{ mt: 1, mb: 2 }}>
        Oops! The page you're looking for doesn't exist.
      </Typography>
      <motion.div whileHover={{ scale: 1.1 }}>
        <Button variant="contained" color="primary" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </motion.div>
    </Box>
  );
};

export default NotFoundPage;

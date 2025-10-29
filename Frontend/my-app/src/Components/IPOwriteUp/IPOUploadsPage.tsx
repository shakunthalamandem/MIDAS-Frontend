import React from "react";
import { Box, Container, Typography, Card, Divider, IconButton, Tooltip, Breadcrumbs, Link } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import IPOS1FileUpload from "../IPOwriteUp/IPOS1FileUpload";

const IPOUploadsPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 6 }}>
      <Container>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Tooltip title="Back to Uploads">
            <IconButton onClick={() => navigate("/uploads")} size="small" sx={{ mr: 1 }}>
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Breadcrumbs aria-label="breadcrumb">
            <Link underline="hover" color="inherit" onClick={() => navigate("/uploads")} sx={{ cursor: "pointer" }}>
              Uploads
            </Link>
            <Typography color="text.primary">IPO Files</Typography>
          </Breadcrumbs>
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, color: "#0b3d91", mb: 2 }}>
          IPO Files
        </Typography>
        <Typography variant="body2" sx={{ mb: 3, color: "text.secondary" }}>
          Upload S1/A1/analytics documents by region. Ticker is mandatory for all uploads. EMEA support is coming soon.
        </Typography>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card elevation={3} sx={{ borderRadius: 3, p: 3, background: "linear-gradient(to right, #ffecd2, #fcb69f)" }}>
            <Typography variant="h6" align="center" color="primary" sx={{ fontWeight: 600, mb: 2 }}>
              Upload IPO Files
            </Typography>
            <Divider sx={{ my: 2 }} />
            <IPOS1FileUpload />
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default IPOUploadsPage;

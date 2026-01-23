import React, { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  Divider,
  IconButton,
  Tooltip,
  Breadcrumbs,
  Link,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import IPOS1FileUpload from "../IPOwriteUp/IPOS1FileUpload";
import FOS1FileUpload from "../Main/FOWriteUpMain/FOWriteUpUploads/FOS1FileUpload";
import FinancialforecastUpload from "../Uploads/FinancialforecastUpload";

type View = "ipo" | "fo" | "forecast";

const IPOUploadsPage: React.FC = () => {
  const navigate = useNavigate();

  const [view, setView] = useState<View>("ipo");

 

  return (
    <Box sx={{ backgroundColor: "#fff", minHeight: "100vh", py: 6 }}>
      <Container>
        {/* 🔙 Navigation & Breadcrumbs */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Tooltip title="Back to Uploads">
            <IconButton
              onClick={() => navigate("/uploads")}
              size="small"
              sx={{ mr: 1 }}
            >
              <ArrowBackIosNewIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Breadcrumbs aria-label="breadcrumb">
            <Link
              underline="hover"
              color="inherit"
              onClick={() => navigate("/uploads")}
              sx={{ cursor: "pointer" }}
            >
              Back to Uploads
            </Link>
          </Breadcrumbs>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#0b3d91", mb: 2 }}
        >
          IPO and FO Files
        </Typography>

        {/* 🧭 Horizontal Toggle */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <ToggleButtonGroup
            exclusive
            color="primary"
            value={view}
            onChange={(_, val: View | null) => val && setView(val)}
            size="small"
          >
            <ToggleButton value="ipo">IPO Documents</ToggleButton>
            <ToggleButton value="forecast">Financial Forecasts</ToggleButton>
            <ToggleButton value="fo">FO Documents</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* === IPO Upload Section === */}
        {view === "ipo" && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                p: 3,
                background: "linear-gradient(to right, #ffecd2, #fcb69f)",
              }}
            >
              <Typography
                variant="h6"
                align="center"
                color="primary"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Upload IPO Documents
              </Typography>
              <Divider sx={{ my: 2 }} />
              <IPOS1FileUpload />
            </Card>
          </motion.div>
        )}



        {/* === FO Upload Section === */}
        {view === "fo" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card elevation={3}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 3,
                  p: 3,
                  background: "linear-gradient(to right, #ffecd2, #fcb69f)",
                }}
              >
                <Typography
                  variant="h6"
                  align="center"
                  color="primary"
                  sx={{ fontWeight: 600, mb: 2 }}
                >
                  Upload FO Files
                </Typography>
                <Divider sx={{ my: 2 }} />
                <FOS1FileUpload />
              </Card>
            </Card>
          </motion.div>
        )}


                {/* === Financial Forecast Upload Section === */}
        {view === "forecast" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                p: 3,
                background: "linear-gradient(to right, #ffecd2, #fcb69f)",
              }}
            >
              <Typography
                variant="h6"
                align="center"
                color="primary"
                sx={{ fontWeight: 600, mb: 2 }}
              >
                Upload IPO Financial Forecasts
              </Typography>
              <Divider sx={{ my: 2 }} />
              <FinancialforecastUpload />
            </Card>
          </motion.div>
        )}
      </Container>
    </Box>
  );
};

export default IPOUploadsPage;

import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

interface StrengthWriteupProps {
  selectedData: {
    strengths?: string;
    weakness?: string;
  };
}

const FOStrengthWriteUp: React.FC<StrengthWriteupProps> = ({ selectedData }) => {
  if (!selectedData || (!selectedData.strengths && !selectedData.weakness)) {
    return null;
  }

  const MotionBox = motion(Box);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Strengths Section */}
        {selectedData.strengths && (
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Accordion
                sx={{
                  borderRadius: 3,
            background: "linear-gradient(#f0f5ff)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="strengths-header"
                  sx={{
            background: "linear-gradient(#f0f5ff)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      color: "#026269",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    Strengths
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>

                      <Typography
                        variant="body1"
                        sx={{ color: "#333", lineHeight: 1.7, fontSize: "1.05rem" }}
                      >
                        {selectedData.strengths}
                      </Typography>
                 
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}

        {/* Weaknesses Section */}
        {selectedData.weakness && (
          <Grid item xs={12} md={6}>
            <MotionBox
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <Accordion
                sx={{
                  borderRadius: 3,
            background: "linear-gradient(#f0f5ff)",
                  boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  id="weakness-header"
                  sx={{
            background: "linear-gradient(#f0f5ff)",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                  }}
                >
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{
                      color: "#026269",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    Concerns
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>

                      <Typography
                        variant="body1"
                        sx={{ color: "#333", lineHeight: 1.7, fontSize: "1.05rem" }}
                      >
                        {selectedData.weakness || "N/A"}
                      </Typography>
              
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}
      </Grid>
    </Container>
  );
};

export default FOStrengthWriteUp;

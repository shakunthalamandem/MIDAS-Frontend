import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { motion } from "framer-motion";

interface StrengthWriteupProps {
  selectedData: {
    strengths?: string;
    weakness?: string;
  };
  ticker: string;
}

const FOStrengthWriteUp: React.FC<StrengthWriteupProps> = ({ selectedData, ticker }) => {
  const [editStrength, setEditStrength] = useState(false);
  const [editWeakness, setEditWeakness] = useState(false);
  const [strengthValue, setStrengthValue] = useState(selectedData.strengths || "");
  const [weaknessValue, setWeaknessValue] = useState(selectedData.weakness || "");

  const handleSave = async (field: "strengths" | "weakness") => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    const payload = {
      ticker,
      [field]: field === "strengths" ? strengthValue : weaknessValue,
    };

    try {
      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        if (field === "strengths") setEditStrength(false);
        else setEditWeakness(false);
      } else {
        console.error("Error updating:", field);
      }
    } catch (error) {
      console.error("PATCH error:", error);
    }
  };

  const MotionBox = motion(Box);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* Strengths Section */}
        {selectedData.strengths !== undefined && (
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
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#026269",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    Strengths
                  </Typography>
                  <IconButton
                    onClick={() => (editStrength ? handleSave("strengths") : setEditStrength(true))}
                                sx={{ color: "#002060" }}  // <-- Icon color updated here

                  >
                    {editStrength ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  {editStrength ? (
                    <TextField
                      multiline
                      fullWidth
                      minRows={6}
                      value={strengthValue}
                      onChange={(e) => setStrengthValue(e.target.value)}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{ color: "#333", lineHeight: 1.7, fontSize: "1.05rem" }}
                    >
                      {selectedData.strengths}
                    </Typography>
                  )}
                </AccordionDetails>
              </Accordion>
            </MotionBox>
          </Grid>
        )}

        {/* Weaknesses Section */}
        {selectedData.weakness !== undefined && (
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
                    position: "relative",
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "#026269",
                      fontWeight: "bold",
                      flex: 1,
                    }}
                  >
                    Concerns
                  </Typography>
                  <IconButton
                    onClick={() => (editWeakness ? handleSave("weakness") : setEditWeakness(true))}
                  >
                    {editWeakness ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </AccordionSummary>
                <AccordionDetails>
                  {editWeakness ? (
                    <TextField
                      multiline
                      fullWidth
                      minRows={6}
                      value={weaknessValue}
                      onChange={(e) => setWeaknessValue(e.target.value)}
                    />
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{ color: "#333", lineHeight: 1.7, fontSize: "1.05rem" }}
                    >
                      {selectedData.weakness}
                    </Typography>
                  )}
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

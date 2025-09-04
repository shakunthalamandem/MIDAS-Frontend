import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

interface ValuationWriteupProps {
  selectedData: {
    business_highlights?: string;
  };
}

const FOBusinessHighlights: React.FC<ValuationWriteupProps> = ({ selectedData }) => {
  if (!selectedData || !selectedData.business_highlights) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Accordion Wrapper */}
      <Accordion
        
        sx={{
          borderRadius: 3,
            background: "linear-gradient(#f0f5ff)",
          boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
          "&:before": { display: "none" },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          id="business-highlights-header"
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
            Business Highlights
          </Typography>
        </AccordionSummary>

        <AccordionDetails>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#333",
                    lineHeight: 1.7,
                    fontSize: "1.1rem",
                  }}
                >
                  {selectedData.business_highlights}
                </Typography>
              </Box>

        </AccordionDetails>
      </Accordion>
    </motion.div>
  );
};

export default FOBusinessHighlights;

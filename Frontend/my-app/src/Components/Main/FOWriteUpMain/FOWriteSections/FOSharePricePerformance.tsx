import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { motion } from "framer-motion";

interface SharePricePerformance {
  _3_year_total_return?: number;
  _1_year_total_return?: number;
  ytd_return?: number;
  _6_month_return?: number;
  _3_month_return?: number;
  _1_month_return?: number;
}

interface Props {
  selectedData: SharePricePerformance;
}

const perfFields: { label: string; key: keyof SharePricePerformance }[] = [
  { label: "3-Year Total Return (%)", key: "_3_year_total_return" },
  { label: "1-Year Total Return (%)", key: "_1_year_total_return" },
  { label: "YTD Return (%)", key: "ytd_return" },
  { label: "6-Month Return (%)", key: "_6_month_return" },
  { label: "3-Month Return (%)", key: "_3_month_return" },
  { label: "1-Month Return (%)", key: "_1_month_return" },
];

const formatValue = (value: any) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") return `${value.toLocaleString()}%`;
  return value;
};

const FOSharePricePerformance: React.FC<Props> = ({ selectedData }) => {
  if (!selectedData || Object.keys(selectedData).length === 0) return null;

  // Split fields into two columns
  const leftFields = perfFields.slice(0, 4);
  const rightFields = perfFields.slice(4);

  return (
    <Container maxWidth="xl">
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
            id="share-price-performance-header"
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
              Share Price Performance
            </Typography>
          </AccordionSummary>

          <AccordionDetails>

                {/* Two Columns Layout */}
                <Box display="flex" gap={4} flexWrap="wrap">
                  {/* Left Column */}
                  <Box flex="1">
                    {leftFields.map((field, idx) => (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={{ marginBottom: "16px" }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}
                        >
                          {field.label}
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#333" }}>
                          {formatValue(selectedData[field.key])}
                        </Typography>
                      </motion.div>
                    ))}
                  </Box>

                  {/* Right Column */}
                  <Box flex="1">
                    {rightFields.map((field, idx) => (
                      <motion.div
                        key={field.key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (idx + leftFields.length) * 0.05 }}
                        style={{ marginBottom: "16px" }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}
                        >
                          {field.label}
                        </Typography>
                        <Typography variant="h6" sx={{ color: "#333" }}>
                          {formatValue(selectedData[field.key])}
                        </Typography>
                      </motion.div>
                    ))}
                  </Box>
                </Box>
 
          </AccordionDetails>
        </Accordion>
      </motion.div>
    </Container>
  );
};

export default FOSharePricePerformance;

import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
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

  // Split into two columns
  const leftFields = perfFields.slice(0, 4);
  const rightFields = perfFields.slice(4);

  return (
    <Container maxWidth="xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card
          sx={{
            borderRadius: 4,
            background: "linear-gradient(#f0f5ff)",
            boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
            p: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "#127080ff", mb: 3 }}
              align="center"
            >
              Share Price Performance
            </Typography>

            {/* Two Columns Layout */}
            <Box display="flex" gap={4} flexWrap="wrap">
              {/* Left Column (4 values) */}
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

              {/* Right Column (2 values) */}
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
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default FOSharePricePerformance;

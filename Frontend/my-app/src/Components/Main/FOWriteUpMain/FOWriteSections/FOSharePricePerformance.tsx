import React from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

interface SharePricePerformance {
  three_year_total_return?: number;
  one_year_total_return?: number;
  ytd_return?: number;
  six_month_return?: number;
  three_month_return?: number;
  one_month_return?: number;
}

interface Props {
  selectedData: SharePricePerformance;
}

// Config array for fields
const perfFields: { label: string; key: keyof SharePricePerformance }[] = [
  { label: "3-Year Total Return (%)", key: "three_year_total_return" },
  { label: "1-Year Total Return (%)", key: "one_year_total_return" },
  { label: "YTD Return (%)", key: "ytd_return" },
  { label: "6-Month Return (%)", key: "six_month_return" },
  { label: "3-Month Return (%)", key: "three_month_return" },
  { label: "1-Month Return (%)", key: "one_month_return" },
];

// Format values
const formatValue = (value: any) => {
  if (value === undefined || value === null) return "N/A";
  if (typeof value === "number") return `${value.toLocaleString()}%`;
  return value;
};

const FOSharePricePerformance: React.FC<Props> = ({ selectedData }) => {
  if (!selectedData || Object.keys(selectedData).length === 0) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12}>
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
                <Grid container spacing={3}>
                  {perfFields.map((field, idx) => (
                    <Grid item xs={12} sm={3} key={field.key}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Box>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}
                          >
                            {field.label}
                          </Typography>
                          <Typography variant="h6" sx={{ color: "#333" }}>
                            {formatValue(selectedData[field.key])}
                          </Typography>
                        </Box>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FOSharePricePerformance;

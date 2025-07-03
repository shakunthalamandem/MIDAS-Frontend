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
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";

interface IPODashboardCardRatingsProps {
  ipodata: Record<string, any>;
}

const ratingFields = [
  "profitability",
  "leverage",
  "management_quality",
  "customer_mix",
  "barriers_to_entry",
  "proprietary_solution",
  "near_term_catalyst",
  "valuation_attractiveness",
];

const infoFields: { label: string; key: string }[] = [
  { label: "Pricing Date", key: "pricing_date" },
  { label: "Price Range", key: "price_range" },
  { label: "Deal Size ($ Million)", key: "deal_size" },
  { label: "Industry", key: "industry" },
  { label: "Shares Offered", key: "shares_offered" },
  { label: "No of Shares Outstanding", key: "nosh" },
  { label: "Established", key: "established_year" },
  { label: "Bookrunners", key: "bookrunners" },
];

const formatValue = (key: string, value: any, ipodata: Record<string, any>) => {
  if (key === "price_range") {
    return ipodata.lower_bound && ipodata.upper_bound
      ? `$${ipodata.lower_bound} - $${ipodata.upper_bound}`
      : "N/A";
  }

  if (key === "deal_size" || key === "shares_offered") {
    return value ? Number(value).toLocaleString() : "N/A";
  }

  if (key === "nosh") {
    return value ? `${Number(value).toLocaleString()}M` : "N/A";
  }

  if (key === "bookrunners") {
    return Array.isArray(value) && value.length > 0 ? value.join(", ") : "N/A";
  }

  return value || "N/A";
};


const IPODashboardCardRatings: React.FC<IPODashboardCardRatingsProps> = ({
  ipodata,
}) => {
  if (!ipodata || Object.keys(ipodata).length === 0) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={4}>
        {/* IPO Info as Cards */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(to right, #e3f2fd, #fce4ec)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                p: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#6a1b9a" }} align="center">
                  IPO Summary
                </Typography>
                <Grid container spacing={3}>
                  {infoFields.map((field, idx) => (
                    <Grid item xs={12} sm={6} key={field.key}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Box>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, mb: 0.5, color: "#124180" }}
                          >
                            {field.label}
                          </Typography>
                          <Typography variant="body2" sx={{ color: "#333" }}>
                            {formatValue(field.key, ipodata[field.key], ipodata)}
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

        {/* Ratings */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
          >
            <Card
              sx={{
                borderRadius: 4,
                background: "linear-gradient(to right, #fff3e0, #fce4ec)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
                p: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 700, color: "#6a1b9a" }} align="center">
                  Ratings Overview
                </Typography>
                <Grid container spacing={3}>
                  {ratingFields.map((field, idx) => {
                    const value = Math.round(Math.min(10, ipodata[field]) / 2);
                    return (
                      <Grid item xs={12} sm={6} key={field}>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, mb: 1, color: "#002060", textTransform: "capitalize" }}
                          >
                            {field.replace(/_/g, " ")}
                          </Typography>
                          <Box display="flex" gap={0.5}>
                            {[1, 2, 3, 4, 5].map((i) =>
                              i <= value ? (
                                <StarIcon key={i} sx={{ color: "#e54702" }} />
                              ) : (
                                <StarBorderIcon key={i} sx={{ color: "#ccc" }} />
                              )
                            )}
                          </Box>
                        </motion.div>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default IPODashboardCardRatings;

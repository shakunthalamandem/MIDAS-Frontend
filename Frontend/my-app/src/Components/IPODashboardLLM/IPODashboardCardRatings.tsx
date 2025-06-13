import React from "react";
import { Box, Typography, Grid, Container, Card, CardContent } from "@mui/material";
import { motion } from "framer-motion";

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

const IPODashboardCardRatings: React.FC<IPODashboardCardRatingsProps> = ({ ipodata }) => {
  console.log("IPODashboardCardRatings ipodata:", {
    profitability: ipodata?.profitability,
    leverage: ipodata?.leverage,
    management_quality: ipodata?.management_quality,
    customer_mix: ipodata?.customer_mix,
    barriers_to_entry: ipodata?.barriers_to_entry,
    proprietary_solution: ipodata?.proprietary_solution,
    near_term_catalyst: ipodata?.near_term_catalyst,
    valuation_attractiveness: ipodata?.valuation_attractiveness,
  });

  if (!ipodata || Object.keys(ipodata).length === 0) {
    return null; // Or show a loader/placeholder
  }

  return (
    <Container maxWidth="lg" sx={{ mb: 4 }}>
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          background: "linear-gradient(135deg, #f0f4ff 0%, #ffffff 100%)",
        }}
      >
        <CardContent>
          <Grid container spacing={4}>
            {ratingFields.map((field) => {
              const value = Math.round(Math.min(10, ipodata[field]) / 2);

              return (
                <Grid item xs={12} sm={6} md={3} key={field}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: ratingFields.indexOf(field) * 0.05 }}
                  >
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, mb: 1, textTransform: "capitalize", color: "#002060" }}
                      >
                        {field.replace(/_/g, " ")}
                      </Typography>

                      <Grid container spacing={1}>
                        {[1, 2, 3, 4, 5].map((index) => (
                          <Grid item key={index}>
                            <motion.div
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: index <= value ? 1 : 0 }}
                              transition={{ duration: 0.5 }}
                              style={{
                                transformOrigin: "left",
                                width: 30,
                                height: 8,
                                borderRadius: 2,
                                backgroundColor: index <= value ? "#002060" : "#000000",
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </motion.div>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default IPODashboardCardRatings;

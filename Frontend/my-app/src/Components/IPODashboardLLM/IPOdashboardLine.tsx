import React from "react";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Box,
  Container,
} from "@mui/material";
import { motion } from "framer-motion";

interface IPOdashboardLineProps {
  ipodata: Record<string, any>;
}

const timelineFields = [
  { label: "Filed Date", key: "filed_date" },
  { label: "Term Date", key: "term_date" },
  { label: "Pricing Date", key: "pricing_date" },
  { label: "Trade Date", key: "trade_date" },
];

const IPOdashboardLine: React.FC<IPOdashboardLineProps> = ({ ipodata }) => {
  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Card
        sx={{
          borderRadius: 4,
          background: "linear-gradient(to right, #e3f2fd, #fce4ec)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          overflowX: "auto",
          p: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              position: "relative",
              minHeight: 120,
            }}
          >
            {timelineFields.map((item, index) => {
              const value = ipodata[item.key];
              return (
                <Box
                  key={item.key}
                  sx={{
                    textAlign: "center",
                    flex: 1,
                    position: "relative",
                  }}
                >
                  {/* Top label */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#002060", fontWeight: 600, mb: 1 }}
                    >
                      {item.label}
                    </Typography>
                  </motion.div>

                  {/* Dot */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 }}
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      backgroundColor: "#002060",
                      margin: "0 auto",
                      zIndex: 2,
                    }}
                  />

                  {/* Date below */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        mt: 1,
                        display: "block",
                        fontWeight: 500,
                        color: "#333",
                      }}
                    >
                      {value || "N/A"}
                    </Typography>
                  </motion.div>

                  {/* Connecting line */}
                  {index < timelineFields.length - 1 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        width: "100%",
                        height: 2,
                        backgroundColor: "#003e36",
                        transform: "translateX(8px) translateY(-50%)",
                      }}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default IPOdashboardLine;

import React from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
} from "@mui/material";
import { motion } from "framer-motion";

interface ValuationWriteupProps {
  selectedData: {
    management_writeup?: string;
  };
}

const FOValuationWriteup: React.FC<ValuationWriteupProps> = ({ selectedData }) => {
  if (!selectedData || !selectedData.management_writeup) return null;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
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
              align="center"
              sx={{ fontWeight: 700, color: "#128080ff", mb: 2 }}
            >
              Management Writeup
            </Typography>
            <Box>
              <Typography
                variant="body1"
                sx={{
                  color: "#333",
                  lineHeight: 1.7,
                  fontSize: "1.1rem",
                }}
              >
                {selectedData.management_writeup}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default FOValuationWriteup;

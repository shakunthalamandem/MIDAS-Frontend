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

interface FODealInformationProps {
  selectedData: Record<string, any>; // ✅ Updated prop
}

// Fields to be displayed in IPO summary
const infoFields: { label: string; key: string }[] = [
  { label: "Pricing Date", key: "pricing_date" },
  { label: "Issue price($)", key: "issue_price" },
  { label: "Deal Size ($ Million)", key: "deal_size" },
  { label: "Industry", key: "industry" },
  { label: "Shares Offered", key: "shares_offered" },
  { label: "No of Shares Outstanding", key: "number_of_shares_outstanding" },
  { label: "Greenshoe", key: "greenshoe" },
  { label: "Bookrunners", key: "bookrunners" },
];

// 🔹 Format value
const formatValue = (key: string, value: any, selectedData: Record<string, any>) => {
  
  if (key === "deal_size" || key === "shares_offered" || key === "issue_price") {
    return value ? Number(value).toLocaleString() : "N/A";
  }
  if (key === "number_of_shares_outstanding"  || key === "greenshoe") {
    return value ? `${Number(value).toLocaleString()}` : "N/A";
  }
  if (key === "bookrunners") {
    return Array.isArray(value) && value.length > 0 ? value.join(", ") : "N/A";
  }
  return value || "N/A";
};

const FODealInformation: React.FC<FODealInformationProps> = ({ selectedData }) => {
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
                <Grid container spacing={3}>
                  {infoFields.map((field, idx) => (
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
                            {formatValue(field.key, selectedData[field.key], selectedData)}
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

export default FODealInformation;

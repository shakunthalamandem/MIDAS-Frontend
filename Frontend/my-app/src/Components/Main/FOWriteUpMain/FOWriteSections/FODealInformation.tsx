import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Container,
  Card,
  CardContent,
  TextField,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface FODealInformationProps {
  data: Record<string, any>;
  ticker: string;
}

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

const formatValue = (key: string, value: any) => {
  if (!value) return "N/A";

  if (["deal_size", "shares_offered", "issue_price"].includes(key)) {
    return Number(value).toLocaleString();
  }

  if (["number_of_shares_outstanding", "greenshoe"].includes(key)) {
    return Number(value).toLocaleString();
  }

  if (key === "bookrunners") {
    if (Array.isArray(value)) {
      try {
        if (value.length === 1 && typeof value[0] === "string" && value[0].includes("'")) {
          const parsed = JSON.parse(
            value[0].replace(/'/g, '"') 
          );
          return parsed.join(", ");
        }
        return value.join(", ");
      } catch {
        return value.join(", ");
      }
    }
    return value;
  }

  return value;
};


const FODealInformation: React.FC<FODealInformationProps> = ({ data, ticker }) => {
  const [editMode, setEditMode] = useState(false);
  const [localData, setLocalData] = useState<Record<string, any>>(data);

  const handleChange = (key: string, value: string) => {
    if (key === "bookrunners") {
      setLocalData({ ...localData, [key]: value.split(",").map((item) => item.trim()) });
    } else {
      setLocalData({ ...localData, [key]: value });
    }
  };

  const handleSave = async () => {
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const token = localStorage.getItem("access_token");

      const payload = {
        ticker,
        ...localData,
      };

      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error("Save failed");
      } else {
        setEditMode(false);
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  if (!localData || Object.keys(localData).length === 0) return null;

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
                position: "relative",
              }}
            >
              {/* Top-right Edit/Save Button */}
              <IconButton
                onClick={() => (editMode ? handleSave() : setEditMode(true))}
                sx={{ position: "absolute", top: 8, right: 8,color: "#002060" }}
              >
                {editMode ? <SaveIcon /> : <EditIcon />}
              </IconButton>

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

                          {editMode ? (
                            <TextField
                              fullWidth
                              variant="outlined"
                              size="small"
                              value={
                                field.key === "bookrunners"
                                  ? (localData[field.key] || []).join(", ")
                                  : localData[field.key] ?? ""
                              }
                              onChange={(e) => handleChange(field.key, e.target.value)}
                            />
                          ) : (
                            <Typography variant="h6" sx={{ color: "#333" }}>
                              {formatValue(field.key, localData[field.key])}
                            </Typography>
                          )}
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

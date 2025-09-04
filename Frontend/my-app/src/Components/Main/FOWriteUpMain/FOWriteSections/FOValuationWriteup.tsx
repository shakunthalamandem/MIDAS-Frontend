import React, { useState } from "react";
import {
  Box,
  Typography,
  Container,
  Card,
  CardContent,
  IconButton,
  TextField,
} from "@mui/material";
import { motion } from "framer-motion";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";

interface ValuationWriteupProps {
  selectedData: {
    valuation?: string;
  };
  ticker: string;
}

const FOValuationWriteup: React.FC<ValuationWriteupProps> = ({ selectedData, ticker }) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(selectedData.valuation || "");
  const [loading, setLoading] = useState(false);

  if (!selectedData || !selectedData.valuation) return null;

  const handleSave = async () => {
    setLoading(true);
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    try {
      const response = await fetch(`${apiUrl}/api/fo_writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          ticker,
          valuation: value,
        }),
      });

      if (!response.ok) {
        console.error("Failed to update valuation writeup");
      } else {
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating valuation writeup:", error);
    } finally {
      setLoading(false);
    }
  };

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
            position: "relative",
          }}
        >
          <CardContent>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#128080ff", flexGrow: 1, textAlign: "center" }}
              >
                Valuation Writeup
              </Typography>
              <IconButton
                onClick={() => {
                  if (editMode) {
                    handleSave();
                  } else {
                    setEditMode(true);
                  }
                }}
                disabled={loading}
                            sx={{ color: "#002060" }}  // <-- Icon color updated here

              >
                {editMode ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </Box>

            {editMode ? (
              <TextField
                multiline
                fullWidth
                minRows={6}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                disabled={loading}
              />
            ) : (
              <Typography
                variant="body1"
                sx={{
                  color: "#333",
                  lineHeight: 1.7,
                  fontSize: "1.1rem",
                  whiteSpace: "pre-line",
                }}
              >
                {value}
              </Typography>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </Container>
  );
};

export default FOValuationWriteup;

import React, { useState } from "react";
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
  Slide,
} from "@mui/material";
import { motion } from "framer-motion";

const AiInsightsInputForm: React.FC = () => {
  const [date, setDate] = useState<Date | null>(null);
  const [cardId, setCardId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    const token = localStorage.getItem("access_token");

    if (!apiUrl) {
      console.error("API URL is not defined in environment variables");
      return;
    }

    const payload = {
      card_id: cardId,
      date: date?.toISOString().split("T")[0],
      title,
      description,
    };

    try {
      const response = await fetch(`${apiUrl}/api/ai_insights_data/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      setSubmitted(true);
    } catch (error) {
      console.error("Submission error:", error);
      alert("Form submission failed.");
    }
  };

  const handleReset = () => {
    setDate(null);
    setCardId("");
    setTitle("");
    setDescription("");
    setSubmitted(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        elevation={6}
        sx={{ maxWidth: 600, mx: "auto", mt: 5, p: 3, borderRadius: 4 }}
      >
        <CardContent>
          <Typography variant="h5" color="#002060" gutterBottom align="center">
            AI Insights Input Form
          </Typography>
          <Stack spacing={3}>
      <TextField
  label="Date"
  type="date"
  fullWidth
  value={date ? date.toISOString().split("T")[0] : ""}
  onChange={(e) => {
    const newDate = e.target.value ? new Date(e.target.value) : null;
    setDate(newDate);
  }}
  InputLabelProps={{
    shrink: true,
  }}
/>


            <TextField
              label="Card ID"
              variant="outlined"
              fullWidth
              value={cardId}
              onChange={(e) => setCardId(e.target.value)}
            />
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <TextField
              label="Description"
              variant="outlined"
              fullWidth
              multiline
              minRows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{ color: "#fff", backgroundColor: "#002060" }}
              >
                Submit
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleReset}
              >
                Reset
              </Button>
            </Box>

            {submitted && (
              <Slide direction="up" in={submitted} mountOnEnter unmountOnExit>
                <Typography variant="body1" color="success.main">
                  Form submitted successfully!
                </Typography>
              </Slide>
            )}
          </Stack>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AiInsightsInputForm;

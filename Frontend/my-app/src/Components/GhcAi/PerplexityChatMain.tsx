import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Fade,
} from "@mui/material";
import GHCAIMain from "./GHCAIMain"; // Import the renderer

const PerplexityChatMain: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setData([]);
    setError(null);

    try {
      const response = await fetch(`${apiUrl}/api/perplexity_chat/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          question: question.trim(),
          history: [],
        }),
      });

      const result = await response.json();
      console.log("API Response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      if (Array.isArray(result.answer)) {
        setData(result.answer); 
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to fetch answer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0a6952ff, #013842ff, #012533ff)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "start",
        py: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 700,
          p: 4,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.58)",
          backdropFilter: "blur(14px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            background: "linear-gradient(90deg, #aa0d02ff, #b8020bff)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: 700,
            textAlign: "center",
            mb: 4,
          }}
        >
          Ask Perplexity AI
        </Typography>

        <Box component="form" onSubmit={handleSubmit} display="flex" gap={2}>
          <TextField
            fullWidth
            label="Type your question..."
            variant="outlined"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            sx={{
              background: "#ffffff",
              borderRadius: 2,
              input: {
                color: "#333",
              },
            }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !question.trim()}
            sx={{
              background: "linear-gradient(45deg, #bbbbc5ff, #c1f7ddff)",
              color: "#002060",
              px: 4,
              borderRadius: 2,
              transition: "transform 0.2s",
              "&:hover": {
                transform: "scale(1.05)",
                background: "linear-gradient(45deg, #c7dddbff, #f0efd1ff)",
              },
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : "Ask"}
          </Button>
        </Box>
      </Paper>

      <GHCAIMain data={data} loading={loading} error={error} />
    </Box>
  );
};

export default PerplexityChatMain;

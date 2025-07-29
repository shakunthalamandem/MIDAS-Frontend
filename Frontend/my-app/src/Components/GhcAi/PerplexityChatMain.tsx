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

const PerplexityChatMain: React.FC = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setAnswer(null);
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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setAnswer(data.answer);
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
        alignItems: "center",
        justifyContent: "center",
        p: 2,
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

        <Fade in={!!answer || !!error} timeout={600}>
          <Box mt={4}>
            {answer && (
              <Box
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: "linear-gradient(to right, #43e97b, #38f9d7)",
                  color: "#0b2e13",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  AI Answer:
                </Typography>
                <Typography variant="body1">{answer}</Typography>
              </Box>
            )}

            {error && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#ff5252",
                  color: "#fff",
                  textAlign: "center",
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {error}
                </Typography>
              </Box>
            )}
          </Box>
        </Fade>
      </Paper>
    </Box>
  );
};

export default PerplexityChatMain;

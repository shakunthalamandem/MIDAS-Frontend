import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Container,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import SendIcon from "@mui/icons-material/Send";
import SuggestedQuestions from "./AIPages/SuggestedQuestions";
import GHCAIMain from "./GHCAIMain";

const PerplexityChatMain: React.FC = () => {
  const location = useLocation();
  const stockData = location.state?.stock;

  const formatStockAsQuestion = (stock: any) => {
    return `Give me insights on ${stock.stock_name} in the ${stock.sector} sector (${stock.region}, ${stock.country}). `;
  };

  const [question, setQuestion] = useState<string>(
    stockData ? formatStockAsQuestion(stockData) : ""
  );
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  // const handleSubmit = async (e?: React.FormEvent | Event) => {
  //   if (e?.preventDefault) e.preventDefault();
  //   if (!question.trim()) return;

  //   setLoading(true);
  //   setData([]);
  //   setError(null);

  //   try {
  //     const response = await fetch(`${apiUrl}/api/perplexity_chat/`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         Authorization: token ? `Bearer ${token}` : "",
  //       },
  //       body: JSON.stringify({
  //         question: question.trim(),
  //         history: [],
  //       }),
  //     });

  //     const result = await response.json();
  //     if (!response.ok) throw new Error(result.error || "Something went wrong");
  //     if (Array.isArray(result.answer)) setData(result.answer);
  //     else throw new Error("Invalid response format");
  //   } catch (err: any) {
  //     setError(err.message || "Failed to fetch answer");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleSubmit = async (e?: React.FormEvent | Event, customQuestion?: string) => {
    if (e?.preventDefault) e.preventDefault();
    const query = customQuestion ?? question;
    if (!query.trim()) return;

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
          question: query.trim(),
          history: [],
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Something went wrong");
      if (Array.isArray(result.answer)) setData(result.answer);
      else throw new Error("Invalid response format");
    } catch (err: any) {
      setError(err.message || "Failed to fetch answer");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (stockData) {
      const formatted = formatStockAsQuestion(stockData);
      setQuestion(formatted);
      handleSubmit(undefined, formatted);
    }
  }, [stockData]);

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, rgba(210, 222, 231, 1), rgba(203, 220, 223, 1))",

        minHeight: "200vh",
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 500,
          color: "#FFFFFF",
          fontSize: { xs: "1rem", sm: "1.2rem" },
          backgroundColor: "#002060",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "4vh",
          padding: "8px 16px",
          borderRadius: "8px",
          textAlign: "center",
          marginBottom: "20px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          animation: "fadeIn 1.5s ease-in-out",
          "@keyframes fadeIn": {
            "0%": { opacity: 0 },
            "100%": { opacity: 1 },
          },
        }}
      >
        Welcome to AI-Powered Conversations, Seamlessly Integrated

      </Typography>
      <Container maxWidth="xl">
        {/* Flex Layout: Left = Paper, Right = Heatmap Button */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems="flex-start"
          gap={4}
        >
          {/* Left side - Question Form */}
          <Paper
            elevation={6}
            sx={{
              flex: 1,
              p: 4,
              borderRadius: 4,
              background: "rgba(255, 255, 255, 0.58)",
              backdropFilter: "blur(14px)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
              align="center"
              sx={{ fontWeight: 600, color: "#002060", mb: 2 }}
            >
              Ask Me Anything !!!
            </Typography>

            <Box component="form" onSubmit={handleSubmit} display="flex" gap={2}>
              <TextField
                fullWidth
                size="small"
                label="Type your question..."
                variant="outlined"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                sx={{
                  background: "#ffffff",
                  borderRadius: 2,
                  input: { color: "#333" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !question.trim()}
                sx={{
                  background: "#c9c9c9ff",
                  color: "#002060",
                  px: 3,
                  borderRadius: 2,
                  transition: "transform 0.2s",
                  minWidth: 50,
                  "&:hover": {
                    transform: "scale(1.05)",
                    background: "linear-gradient(45deg, #c7dddbff, #f0efd1ff)",
                  },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : <SendIcon />}
              </Button>
            </Box>
          </Paper>

          {/* Right side - Open Heatmap Button */}

        </Box>

        {/* AI Response and Suggestions */}
        <GHCAIMain data={data} loading={loading} error={error} />
        <SuggestedQuestions
          questions={data.find((block) => block.type === "suggested_questions")?.questions || []}
          onSelect={(selected) => {
            setQuestion(selected); // updates input field
            handleSubmit(undefined, selected); // uses correct question
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />


      </Container>
    </Box>
  );
};

export default PerplexityChatMain;

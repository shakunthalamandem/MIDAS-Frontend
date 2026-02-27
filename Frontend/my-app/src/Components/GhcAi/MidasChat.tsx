// src/components/MidasChat.tsx
import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import GHCAIMain from "./GHCAIMain";
import SuggestedQuestions from "./AIPages/SuggestedQuestions";

type MidasChatProps = {
  question: string;
  setQuestion: React.Dispatch<React.SetStateAction<string>>;
  data: any[];
  loading: boolean;
  error: string | null;
  onAsk: (e?: React.FormEvent | Event, customQuestion?: string) => Promise<void>;
};

const MidasChat: React.FC<MidasChatProps> = ({
  question,
  setQuestion,
  data,
  loading,
  error,
  onAsk,
}) => {
  return (
    <Box>
      <Paper
        elevation={6}
        sx={{
          width: { xs: "100%", sm: "80%", md: "60%", lg: "80%" },
          mx: "auto",
          p: 4,
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ fontWeight: 700, color: "#002060", mb: 2 }}
        >
          MIDAS Chat
        </Typography>

        <Typography align="center" sx={{ fontSize: "0.95rem", color: "#333", mb: 3 }}>
          Ask Anything about Midas and get AI-powered insights.
        </Typography>

        <Box
          component="form"
          onSubmit={onAsk}
          display="flex"
          gap={2}
          flexDirection={{ xs: "column", sm: "row" }}
        >
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
              minWidth: { xs: "100%", sm: 50 },
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

      <GHCAIMain data={data} loading={loading} error={error} />

      <SuggestedQuestions
        questions={
          data.find((block) => block.type === "suggested_questions")?.questions || []
        }
        onSelect={(selected) => {
          setQuestion(selected);
          onAsk(undefined, selected);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </Box>
  );
};

export default MidasChat;

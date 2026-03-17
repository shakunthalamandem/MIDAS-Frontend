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
  showRecentQuestions: boolean;
  onToggleRecentQuestions: () => void;
  recentLoading?: boolean;
  recentError?: string | null;
  recentItems?: Array<{
    id: number;
    question?: string | null;
  }>;
  onSelectRecent?: (id: number) => void;
};

const MidasChat: React.FC<MidasChatProps> = ({
  question,
  setQuestion,
  data,
  loading,
  error,
  onAsk,
  showRecentQuestions,
  onToggleRecentQuestions,
  recentLoading = false,
  recentError = null,
  recentItems = [],
  onSelectRecent,
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

        <Box
          sx={{
            mt: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {recentLoading && <CircularProgress size={16} />}
          </Box>
          <Button
            variant="contained"
            size="small"
            onClick={onToggleRecentQuestions}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2,
              backgroundColor: "#002060",
              boxShadow: "0 8px 18px rgba(0, 32, 96, 0.25)",
              "&:hover": {
                backgroundColor: "#001840",
                boxShadow: "0 10px 22px rgba(0, 32, 96, 0.35)",
              },
            }}
          >
            {showRecentQuestions ? "Hide recent questions" : "Show recent questions"}
          </Button>
        </Box>

        {recentError && (
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            {recentError}
          </Typography>
        )}

        {showRecentQuestions && recentItems.length === 0 && !recentLoading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            No previous MIDAS questions yet.
          </Typography>
        )}

        {showRecentQuestions && recentItems.length > 0 && (
          <Box
            sx={{
              mt: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 1.5,
            }}
          >
            {recentItems.map((item) => (
              <Paper
                key={item.id}
                variant="outlined"
                role="button"
                tabIndex={0}
                onClick={() => onSelectRecent?.(item.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectRecent?.(item.id);
                  }
                }}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  borderColor: "rgba(0, 32, 96, 0.2)",
                  background:
                    "linear-gradient(180deg, rgba(248, 250, 255, 0.95), rgba(255,255,255,1))",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  boxShadow: "0 10px 18px rgba(0, 32, 96, 0.08)",
                  cursor: "pointer",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 12px 22px rgba(0, 32, 96, 0.16)",
                  },
                }}
              >
                <Typography variant="subtitle2">{item.question}</Typography>
              </Paper>
            ))}
          </Box>
        )}
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

import React from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import GENAIRenderer from "../GhcAi/AIPages/GENAIRenderer";
import { Block } from "../GhcAi/Utils/ComponentsUtils";

type S1QueryBotProps = {
  ticker?: string;
};

const S1QueryBot: React.FC<S1QueryBotProps> = ({ ticker }) => {
  const [question, setQuestion] = React.useState("");
  const [blocks, setBlocks] = React.useState<Block[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const apiUrl = React.useMemo(() => process.env.REACT_APP_API_URL, []);

  React.useEffect(() => {
    setBlocks([]);
    setError(null);
    setQuestion("");
  }, [ticker]);

  const toBlocks = (data: any): Block[] => {
    if (Array.isArray(data)) {
      return data as Block[];
    }
    let content = "Received response.";
    if (typeof data === "string") {
      content = data;
    } else {
      try {
        content = JSON.stringify(data, null, 2);
      } catch {
        // fallback to default
      }
    }
    return [
      {
        type: "text",
        row: 1,
        column: 1,
        total_columns: 1,
        content,
      },
    ];
  };

  const ask = async () => {
    if (!question.trim() || loading) return;
    if (!ticker) {
      setError("Ticker is missing.");
      return;
    }
    if (!apiUrl) {
      setError("API URL is not defined in environment variables.");
      return;
    }

    const token = localStorage.getItem("access_token");

    setLoading(true);
    setError(null);
    setBlocks([]);

    try {
      const res = await fetch(`${apiUrl}/api/s1_bot/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ticker,
          question: question.trim(),
        }),
      });

      if (!res.ok) {
        let detail = "";
        try {
          const errJson = await res.json();
          detail = errJson?.detail ? ` - ${errJson.detail}` : "";
        } catch {
          // ignore
        }
        throw new Error(`Request failed: ${res.status}${detail}`);
      }

      const data = await res.json();
      setBlocks(toBlocks(data));
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "rgba(255,255,255,0.8)",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            S1 AI Query
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask a question for {ticker || "the selected ticker"}.
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            size="small"
            sx={{ bgcolor: "white" }}
          />
          <Button
            variant="contained"
            onClick={ask}
            disabled={loading || !question.trim()}
            sx={{ minWidth: { xs: "100%", sm: 120 } }}
          >
            {loading ? <CircularProgress size={18} color="inherit" /> : "Ask"}
          </Button>
        </Stack>

        {error && <Alert severity="error">{error}</Alert>}

        {blocks.length > 0 && (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              bgcolor: "white",
              overflow: "hidden",
            }}
          >
            <GENAIRenderer
              blocks={blocks}
              setQuestion={setQuestion}
              handleSubmit={ask}
              renderAll
              disableMotion
            />
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default S1QueryBot;

import React from "react";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
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
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            S1 AI Query
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask a question for {ticker || "the selected ticker"}.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <TextField
            fullWidth
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Search company policies, culture, benefits, careers..."
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === "Enter") ask();
            }}
            size="medium"
            sx={{
              maxWidth: 900,
              bgcolor: "transparent",
              "& .MuiOutlinedInput-root": {
                height: 56,
                borderRadius: 999,
                bgcolor: "white",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                boxShadow: "0 6px 20px rgba(110, 150, 220, 0.25)",
                "& fieldset": {
                  borderColor: "rgba(120, 160, 220, 0.35)",
                },
                "&:hover fieldset": {
                  borderColor: "rgba(90, 140, 210, 0.6)",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#4aa3ff",
                  borderWidth: 2,
                },
              },
              "& .MuiOutlinedInput-input": {
                px: 2.5,
              },
            }}
          />
          <IconButton
            onClick={ask}
            aria-label="Send question"
            sx={{
              bgcolor: "#8ed0ff",
              color: "white",
              width: 48,
              height: 48,
              backgroundColor:"#2f81c0ff",
              boxShadow: "0 6px 20px rgba(110, 150, 220, 0.25)",
              "&:hover": { bgcolor: "#2f81c0ff" },
            }}
          >
            {loading ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              <SendRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        {blocks.length > 0 && (
          // <Box
          //   sx={{
          //     border: "1px solid",
          //     borderColor: "divider",
          //     borderRadius: 2,
          //     bgcolor: "white",
          //     overflow: "hidden",
          //   }}
          // >
            <GENAIRenderer
              blocks={blocks}
              setQuestion={setQuestion}
              handleSubmit={ask}
              renderAll
              disableMotion
            />
          // </Box>
        )}
      </Stack>
    </Paper>
  );
};

export default S1QueryBot;

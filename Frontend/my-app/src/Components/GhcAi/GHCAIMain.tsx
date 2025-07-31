import React from "react";
import {
  Container,
  Typography,
  Alert,
  Box,
  Paper,
} from "@mui/material";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt"; // AI/Thinking symbol
import GENAIRenderer from "./AIPages/GENAIRenderer";

interface GHCAIMainProps {
  data: any[];
  loading: boolean;
  error?: string | null;
}

 const GHCAIMain: React.FC<GHCAIMainProps> = ({ data, loading, error }) => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      {loading && (
        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "40vh",
            gap: 2,
            // background: "linear-gradient(135deg, #f3e5f5, #ede7f6)",
            animation: "pulse 2s infinite",
            "@keyframes pulse": {
              "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(106, 27, 154, 0.4)" },
              "70%": { transform: "scale(1.01)", boxShadow: "0 0 8px 8px rgba(106, 27, 154, 0)" },
              "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(106, 27, 154, 0)" },
            },
          }}
        >
          {/* Symbol */}
          <PsychologyAltIcon sx={{ fontSize: 48, color: "#6A1B9A" }} />

          {/* Thinking GIF */}
          <Box
            component="img"
            src="/images/thinking.gif"
            alt="AI Thinking"
            sx={{ width: 120, height: 120 }}
          />


          {/* Message */}
          <Typography
            variant="h6"
            sx={{
              color: "#6A1B9A",
              fontWeight: 600,
              letterSpacing: 0.5,
              mt: 1,
            }}
          >
            AI is thinking… please hold on for 10 seconds
          </Typography>
        </Paper>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && <GENAIRenderer blocks={data} />}
    </Container>
  );
};
export default GHCAIMain;
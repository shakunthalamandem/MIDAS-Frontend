import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Fade,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect?: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelect,
}) => {
  if (!questions || questions.length === 0) return null;

  return (
    <Fade in timeout={600}>
      <Paper
        elevation={3}
        sx={{
          p: 3,
          borderRadius: 3,
          background: "linear-gradient(135deg, #f0f4ff, #dbefff)",
          border: "1px solid #90caf9",
        }}
      >
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <HelpOutlineIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Suggested Questions
          </Typography>
        </Box>

        <Box>
          <Stack direction="row" spacing={0} flexWrap="wrap">
            {questions.map((q, idx) => (
              <Chip
                key={idx}
                icon={<HelpOutlineIcon fontSize="small" color="action" />}
                label={q}
                title={q}
                onClick={() => onSelect?.(q)}
                sx={{
                  m: 1,
                  cursor: "pointer",
                  background: "linear-gradient(120deg, #fefefe, #e0ecf9)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(120deg, #64b5f6, #42a5f5)",
                    color: "#fff",
                    "& .MuiSvgIcon-root": {
                      color: "#fff",
                    },
                    boxShadow: 3,
                    transform: "scale(1.05)",
                  },
                  fontSize: "0.875rem",
                  borderColor: "#90caf9",
                }}
                variant="outlined"
              />
            ))}
          </Stack>
        </Box>
      </Paper>
    </Fade>
  );
};

export default SuggestedQuestions;

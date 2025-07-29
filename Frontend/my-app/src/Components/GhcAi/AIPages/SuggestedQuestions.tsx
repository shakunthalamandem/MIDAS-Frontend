import React from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  Paper,
  Fade,
} from "@mui/material";
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

interface SuggestedQuestionsProps {
  questions: string[];
  onSelect?: (question: string) => void;
}

const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onSelect,
}) => {
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

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {questions.map((q, idx) => (
            <Chip
              key={idx}
              label={q}
              onClick={() => onSelect?.(q)}
              sx={{
                m: 0.5,
                cursor: "pointer",
                background: "linear-gradient(45deg, #e3f2fd, #bbdefb)",
                "&:hover": {
                  background: "linear-gradient(45deg, #90caf9, #64b5f6)",
                  color: "#fff",
                },
                fontSize: "0.875rem",
              }}
              variant="outlined"
            />
          ))}
        </Stack>
      </Paper>
    </Fade>
  );
};

export default SuggestedQuestions;

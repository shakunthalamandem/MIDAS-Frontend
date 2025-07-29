import React from "react";
import { Paper, Typography } from "@mui/material";
import { getRandomBgColor } from "../Utils/colorUtils";
import ReactMarkdown from "react-markdown";

const GENAITextBlock: React.FC<{ content: string }> = ({ content }) => (
  <Paper
    elevation={3}
    sx={{
      p: 2,
      my: 2,
      bgcolor: getRandomBgColor(),
      lineHeight: 1.6
    }}
  >
    <Typography variant="body1" component="div">
      <ReactMarkdown>{content}</ReactMarkdown>
    </Typography>
  </Paper>
);

export default GENAITextBlock;

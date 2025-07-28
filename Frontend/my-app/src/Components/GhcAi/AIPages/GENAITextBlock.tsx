import React from "react";
import { Paper, Typography } from "@mui/material";
import { getRandomBgColor } from "../Utils/colorUtils";

const GENAITextBlock: React.FC<{ content: string }> = ({ content }) => (
  <Paper elevation={3} sx={{ p: 2, my: 2, bgcolor: getRandomBgColor() }}>
    <Typography variant="h6">{content}</Typography>
  </Paper>
);

export default GENAITextBlock;

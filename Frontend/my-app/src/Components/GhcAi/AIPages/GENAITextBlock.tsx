import React from "react";
import {  Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const GENAITextBlock: React.FC<{ content: string }> = ({ content }) => (
<>
    <Typography variant="body1" component="div">
      <ReactMarkdown>{content}</ReactMarkdown>
    </Typography>
</>
);

export default GENAITextBlock;

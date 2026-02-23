import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const GENAITextBlock: React.FC<{ content: string | number }> = ({ content }) => {
  const normalizedContent = React.useMemo(() => String(content ?? ""), [content]);

  return (
    <Card
      sx={{
        backgroundColor: "#5d5df010", // light transparent white
        // backgroundcolor:"red",
        borderRadius: 3,
        boxShadow: 2,
        border: "1px solid #5d5df0a4", // subtle white border
        color: "#0f0e0eff",
        p: 1,
      }}
    >
      <CardContent sx={{ paddingBottom: "16px !important" }}>
        <Typography variant="body1" component="div">
          <ReactMarkdown>{normalizedContent}</ReactMarkdown>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GENAITextBlock;

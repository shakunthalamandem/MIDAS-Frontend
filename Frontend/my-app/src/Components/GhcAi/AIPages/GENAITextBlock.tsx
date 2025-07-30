import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const GENAITextBlock: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Card
      sx={{
        backgroundColor: "rgba(217, 235, 235, 1)", // light transparent white
        // backgroundcolor:"red",
        borderRadius: 3,
        boxShadow: 2,
        border: "1px solid rgba(255, 255, 255, 0.1)", // subtle white border
        color: "#0f0e0eff",
        p: 1,
      }}
    >
      <CardContent sx={{ paddingBottom: "16px !important" }}>
        <Typography variant="body1" component="div">
          <ReactMarkdown>{content}</ReactMarkdown>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GENAITextBlock;

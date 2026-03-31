import React from "react";
import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const GENAITextBlock: React.FC<{ content: string | number }> = ({ content }) => {
  const normalizedContent = React.useMemo(() => String(content ?? ""), [content]);

  return (
    <Box
      sx={{
        background: "#f8fafc",
        borderRadius: 2.5,
        border: "1px solid #e2e8f0",
        p: { xs: 2, md: 2.5 },
        width: "100%",
        transition: "border-color 0.2s ease",
        fontFamily: "'Inter', sans-serif",
        "&:hover": {
          borderColor: "#cbd5e1",
        },
        "& p": {
          fontSize: "0.95rem",
          lineHeight: 1.8,
          color: "#374151",
          margin: 0,
          fontWeight: 300,
          "&:not(:last-child)": { mb: 1.5 },
        },
        "& h1, & h2, & h3, & h4, & h5, & h6": {
          color: "#0f172a",
          fontWeight: 500,
          letterSpacing: "-0.01em",
          mt: 0,
          mb: 1,
          fontFamily: "'Inter', sans-serif",
        },
        "& h1": { fontSize: "1.5rem", fontWeight: 600 },
        "& h2": { fontSize: "1.25rem", fontWeight: 600 },
        "& h3": { fontSize: "1.1rem", fontWeight: 500 },
        "& strong": { color: "#0f172a", fontWeight: 600 },
        "& ul, & ol": {
          pl: 2.5,
          my: 1,
          "& li": {
            fontSize: "0.95rem",
            lineHeight: 1.8,
            color: "#374151",
            fontWeight: 300,
            mb: 0.5,
            "&::marker": { color: "#64748b" },
          },
        },
        "& a": {
          color: "#4f46e5",
          textDecoration: "none",
          fontWeight: 500,
          "&:hover": { textDecoration: "underline" },
        },
        "& code": {
          background: "#e2e8f0",
          borderRadius: 1,
          px: 0.8,
          py: 0.2,
          fontSize: "0.85rem",
          fontFamily: "'JetBrains Mono', 'SF Mono', monospace",
          color: "#4f46e5",
          fontWeight: 400,
        },
        "& blockquote": {
          borderLeft: "3px solid #4f46e5",
          pl: 2,
          ml: 0,
          my: 1.5,
          color: "#374151",
          fontStyle: "italic",
          fontWeight: 300,
        },
      }}
    >
      <Typography variant="body1" component="div" sx={{ fontFamily: "'Inter', sans-serif", fontWeight: 300 }}>
        <ReactMarkdown>{normalizedContent}</ReactMarkdown>
      </Typography>
    </Box>
  );
};

export default GENAITextBlock;

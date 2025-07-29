import React from "react";
import { Paper, Link, Typography } from "@mui/material";
import { getRandomBgColor } from "../Utils/colorUtils";
import ReactMarkdown from "react-markdown";

const GENAILinkBlock: React.FC<{ text: string; url: string }> = ({ text, url }) => (
  <Paper
    elevation={2}
    sx={{
      p: 2,
      m: 2,
      bgcolor: getRandomBgColor(),
      transition: "transform 0.3s",
      "&:hover": {
        transform: "scale(1.02)"
      }
    }}
  >
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{ fontWeight: 600, fontSize: "1rem", color: "#1d4ed8" }}
    >
      <Typography variant="body1" component="div">
        <ReactMarkdown>{text}</ReactMarkdown>
      </Typography>
    </Link>
  </Paper>
);

export default GENAILinkBlock;

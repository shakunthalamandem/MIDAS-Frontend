import React from "react";
import { Box, Link, Typography } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { getRandomBgColor } from "../Utils/colorUtils"; // optional

const GENAILinkBlock: React.FC<{ text: string; url: string }> = ({ text, url }) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      px: 2,
      py: 1,
      my: 1,
      borderRadius: 2,
      backgroundColor: getRandomBgColor(), 
      transition: "background 0.3s, transform 0.2s",
      "&:hover": {
        backgroundColor: "#e0e7ff",
        transform: "scale(1.01)",
      },
    }}
  >
    <LinkIcon sx={{ color: "#1d4ed8" }} />
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{
        fontSize: "1rem",
        fontWeight: 400,
        // color: "#222222ff",
        wordBreak: "break-word",
      }}
    >
      {text || url}
    </Link>
  </Box>
);

export default GENAILinkBlock;

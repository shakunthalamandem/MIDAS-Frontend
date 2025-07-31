import React from "react";
import { Box, Link, Typography, Card } from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import { getRandomBgColor } from "../Utils/colorUtils"; // optional

const GENAILinkBlock: React.FC<{ text: string; url: string }> = ({ text, url }) => (
  <Card
    elevation={1}
    sx={{
      width: "100%",
      my: 1.5,
      borderRadius: 3,
      backgroundColor: getRandomBgColor(),
      transition: "background 0.3s, transform 0.2s",
      "&:hover": {
        backgroundColor: "#e0e7ff",
        transform: "scale(1.01)",
      },
    }}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1.5,
      }}
    >
      <LinkIcon sx={{ color: "#1d4ed8", fontSize: 22 }} />
      <Link
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        underline="hover"
        sx={{
          fontSize: "1rem",
          fontWeight: 500,
          color: "#1e293b",
          wordBreak: "break-word",
          flex: 1,
        }}
      >
        {text || url}
      </Link>
    </Box>
  </Card>
);

export default GENAILinkBlock;

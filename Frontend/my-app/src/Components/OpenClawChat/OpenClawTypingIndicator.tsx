import React from "react";
import { Box, keyframes } from "@mui/material";

const bounce = keyframes`
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.35; }
  40%           { transform: scale(1);   opacity: 1; }
`;

const Dot: React.FC<{ delay: number }> = ({ delay }) => (
  <Box
    sx={{
      width: 6,
      height: 6,
      borderRadius: "50%",
      backgroundColor: "#64748b",
      animation: `${bounce} 1.2s infinite ease-in-out`,
      animationDelay: `${delay}s`,
    }}
  />
);

const OpenClawTypingIndicator: React.FC = () => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 2, pb: 1 }}>
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.6,
        px: 1.25,
        py: 0.9,
        borderRadius: "14px 14px 14px 4px",
        backgroundColor: "#ffffff",
        border: "1px solid rgba(15, 23, 42, 0.08)",
      }}
    >
      <Dot delay={0} />
      <Dot delay={0.15} />
      <Dot delay={0.3} />
    </Box>
  </Box>
);

export default OpenClawTypingIndicator;

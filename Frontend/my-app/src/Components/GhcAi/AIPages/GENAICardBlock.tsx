import React from "react";
import { Box, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

const ACCENT_PALETTES = [
  { accent: "#4f46e5", accentBg: "#eef2ff", accentBorder: "#c7d2fe" },
  { accent: "#0891b2", accentBg: "#ecfeff", accentBorder: "#a5f3fc" },
  { accent: "#059669", accentBg: "#ecfdf5", accentBorder: "#a7f3d0" },
  { accent: "#d97706", accentBg: "#fffbeb", accentBorder: "#fde68a" },
  { accent: "#dc2626", accentBg: "#fef2f2", accentBorder: "#fecaca" },
  { accent: "#7c3aed", accentBg: "#f5f3ff", accentBorder: "#ddd6fe" },
];

const getPalette = (title: string) => {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ACCENT_PALETTES[Math.abs(hash) % ACCENT_PALETTES.length];
};

interface GENAICardBlockProps {
  title: string | number;
  subtitle?: string | number;
  description: string | number;
  icon?: string;
}

const GENAICardBlock: React.FC<GENAICardBlockProps> = ({
  title,
  subtitle,
  description,
  icon,
}) => {
  const normalizedTitle = React.useMemo(() => String(title ?? ""), [title]);
  const normalizedSubtitle = React.useMemo(
    () => (subtitle !== undefined && subtitle !== null ? String(subtitle) : ""),
    [subtitle]
  );
  const normalizedDescription = React.useMemo(
    () => String(description ?? ""),
    [description]
  );
  const palette = React.useMemo(() => getPalette(normalizedTitle), [normalizedTitle]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{ height: "100%", display: "flex", width: "100%" }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2.5,
          border: `1px solid ${palette.accentBorder}`,
          background: palette.accentBg,
          overflow: "hidden",
          transition: "all 0.2s ease",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            transform: "translateY(-1px)",
          },
        }}
      >
        {/* Header strip */}
        <Box
          sx={{
            height: 3,
            background: palette.accent,
            flexShrink: 0,
          }}
        />

        <Box sx={{ p: { xs: 2, md: 2.5 }, flex: 1 }}>
          {/* Title */}
          <Box
            sx={{
              mb: 1,
              "& p": { margin: 0 },
              "& h1, & h2, & h3, & h4, & h5, & h6": { margin: 0 },
            }}
          >
            <Typography
              component="div"
              sx={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: palette.accent,
                lineHeight: 1.3,
              }}
            >
              <ReactMarkdown>{normalizedTitle}</ReactMarkdown>
            </Typography>
          </Box>

          {/* Subtitle */}
          {normalizedSubtitle && (
            <Box sx={{ mb: 1, "& p": { margin: 0 } }}>
              <Typography
                component="div"
                sx={{ fontSize: "0.78rem", color: "#000000", fontWeight: 600 }}
              >
                <ReactMarkdown>{normalizedSubtitle}</ReactMarkdown>
              </Typography>
            </Box>
          )}

          {/* Description */}
          <Box
            sx={{
              "& p": {
                margin: 0,
                fontSize: "0.84rem",
                lineHeight: 1.7,
                color: "#000000",
              },
              "& strong": { color: "#000000", fontWeight: 700 },
              "& ul, & ol": {
                pl: 2,
                my: 0.5,
                "& li": {
                  fontSize: "0.84rem",
                  lineHeight: 1.7,
                  color: "#000000",
                  mb: 0.3,
                },
              },
            }}
          >
            <Typography variant="body2" component="div">
              <ReactMarkdown>{normalizedDescription}</ReactMarkdown>
            </Typography>
          </Box>
        </Box>
      </Box>
    </motion.div>
  );
};

export default GENAICardBlock;

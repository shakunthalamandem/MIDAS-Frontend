import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";


const COLOR_PALETTES = [
  {
    titleColor: "#C0392B",       // bold red
    textColor: "#2C2C2C",        // dark neutral
    subtitleColor: "#7F8C8D",    // cool gray
  },
  {
    titleColor: "#117864",       // dark teal
    textColor: "#212121",        // charcoal
    subtitleColor: "#5D6D7E",    // steel blue-gray
  },
  {
    titleColor: "#B7950B",       // gold
    textColor: "#333333",        // near black
    subtitleColor: "#7D6608",    // soft brownish-gold
  },
  {
    titleColor: "#1A5276",       // navy
    textColor: "#1C2833",        // very dark slate
    subtitleColor: "#5DADE2",    // lighter blue
  },
  {
    titleColor: "#6C3483",       // violet
    textColor: "#2E2E2E",        // rich gray
    subtitleColor: "#A569BD",    // lavender
  },
];

// Utility to randomly pick one color palette
const getRandomPalette = () =>
  COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

interface GENAICardBlockProps {
  title: string;
  subtitle: string;
  description: string; // supports markdown
  icon?: string; // Optional: emoji or icon name
}

const GENAICardBlock: React.FC<GENAICardBlockProps> = ({
  title,
  subtitle,
  description,
  icon,
}) => {
  const palette = React.useMemo(() => getRandomPalette(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      style={{ height: "100%", display: "flex" }}
    >
      <Card
        sx={{
          flexGrow: 1,
          // bgcolor: palette.background,
          color: palette.textColor,
          borderRadius: 3,
          boxShadow: 3,
          borderLeft: `5px solid ${palette.titleColor}`, // 👉 highlight border
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          "&:hover": {
            boxShadow: 6,
          },
        }}
      >
<CardHeader
  titleTypographyProps={{
    variant: "h6",
    sx: { color: palette.titleColor },
  }}
  subheaderTypographyProps={{
    sx: { color: palette.subtitleColor },
  }}
  title={title}
  subheader={subtitle}
  sx={{ pb: 0 }}
/>

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            component="div"
            sx={{ color: palette.textColor }}
          >
            <ReactMarkdown>{description}</ReactMarkdown>
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GENAICardBlock;

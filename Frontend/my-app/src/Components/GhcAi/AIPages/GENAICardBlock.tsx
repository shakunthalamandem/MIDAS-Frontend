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

// Optional: You can extend this palette as needed
const COLOR_PALETTES = [
  {
    background: "#FDEDEC",
    titleColor: "#C0392B",
    textColor: "#7B241C",
  },
  {
    background: "#E8F8F5",
    titleColor: "#117864",
    textColor: "#0B5345",
  },
  {
    background: "#FEF9E7",
    titleColor: "#B7950B",
    textColor: "#7D6608",
  },
  {
    background: "#EBF5FB",
    titleColor: "#1A5276",
    textColor: "#154360",
  },
  {
    background: "#F4ECF7",
    titleColor: "#6C3483",
    textColor: "#512E5F",
  },
];

const getRandomPalette = () =>
  COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

const GENAICardBlock: React.FC<{
  title: string;
  subtitle: string;
  description: string; // supports markdown
  icon?: string;
}> = ({ title, subtitle, description, icon }) => {
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
          bgcolor: palette.background,
          color: palette.textColor,
          borderRadius: 3,
          boxShadow: 3,
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
          subheaderTypographyProps={{ sx: { color: palette.titleColor } }}
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

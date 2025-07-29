import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const GENAICardBlock: React.FC<{
  title: string;
  subtitle: string;
  description: string; // supports markdown
  icon?: string;
}> = ({ title, subtitle, description }) => (
  <Card
    sx={{
      bgcolor: "#6A1B9A", // Deep Purple
      color: "#fff",
      m: 2,
      borderRadius: 3,
      boxShadow: 4,
      height: "100%", // <== Crucial
      display: "flex",
      flexDirection: "column",
      transition: "transform 0.3s ease, box-shadow 0.3s ease",
      "&:hover": {
        transform: "scale(1.03)",
        boxShadow: 6,
      },
    }}
  >
    <CardHeader
      title={title}
      subheader={subtitle}
      sx={{
        color: "#fff",
        pb: 0,
      }}
    />
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="body2" component="div" sx={{ color: "#fff" }}>
        <ReactMarkdown>{description}</ReactMarkdown>
      </Typography>
    </CardContent>
  </Card>
);

export default GENAICardBlock;

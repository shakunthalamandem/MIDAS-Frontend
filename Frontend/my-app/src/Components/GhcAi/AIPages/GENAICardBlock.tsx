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
      bgcolor: "#ffffff",
      color: "#6A1B9A",
      m: 2,
      borderRadius: 3,
      boxShadow: 4,
      height: "100%",
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
      titleTypographyProps={{ variant: "h6", sx: { color: "#002060" } }}
      subheaderTypographyProps={{ sx: { color: "#002060" } }}
      title={title}
      subheader={subtitle}
      sx={{ pb: 0 }}
    />
    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Typography
        variant="body2"
        component="div"
        sx={{ color: "#000000", flexGrow: 1 }}
      >
        <ReactMarkdown>{description}</ReactMarkdown>
      </Typography>
    </CardContent>
  </Card>
);

export default GENAICardBlock;

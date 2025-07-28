import React from "react";
import { Card, CardContent, Typography, CardHeader } from "@mui/material";
import { getRandomBgColor } from "../Utils/colorUtils";

const GENAICardBlock: React.FC<{ title: string; subtitle: string; description: string; icon?: string }> = ({
  title, subtitle, description
}) => (
  <Card sx={{ bgcolor: getRandomBgColor(), m: 2, transition: "transform 0.3s", "&:hover": { transform: "scale(1.03)" } }}>
    <CardHeader title={title} subheader={subtitle} />
    <CardContent>
      <Typography variant="body2">{description}</Typography>
    </CardContent>
  </Card>
);

export default GENAICardBlock;

import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

interface Props {
  title: string;
  description: string;
  url: string;
  alt: string;
}

const GENAIImageCard: React.FC<Props> = ({ title, description, url, alt }) => {
  return (
    <Card>
      <CardMedia component="img" height="200" image={url} alt={alt} />
      <CardContent>
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GENAIImageCard;

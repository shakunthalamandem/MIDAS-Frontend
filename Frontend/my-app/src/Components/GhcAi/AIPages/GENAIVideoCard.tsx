import React from "react";
import { Card, CardMedia, CardContent, Typography } from "@mui/material";

interface Props {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

const GENAIVideoCard: React.FC<Props> = ({ title, description, url, thumbnail }) => {
  return (
    <Card>
      <CardMedia component="video" controls poster={thumbnail} height="200" src={url} />
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

export default GENAIVideoCard;

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
    <Card
      sx={{
        borderRadius: 3, // Adjust the curve here (e.g., 2 = medium, 3 = more curved)
        overflow: "hidden", // Important to make the image follow the card's border radius
        boxShadow: 3, // Optional: adds elevation to enhance visual appeal
      }}
    >
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

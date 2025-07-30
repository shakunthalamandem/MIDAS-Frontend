import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
} from "@mui/material";

interface Props {
  title: string;
  description: string;
  url: string;
  thumbnail: string;
}

const GENAIVideoCard: React.FC<Props> = ({
  title,
  description,
  url,
  thumbnail,
}) => {
  return (
    <Card
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: 4,
        background: "linear-gradient(135deg, #f8f9fc, #e3f2fd)",
        transition: "transform 0.3s ease",
        "&:hover": {
          transform: "scale(1.015)",
        },
      }}
    >
      <CardMedia
        component="video"
        controls
        poster={thumbnail}
        src={url}
        sx={{
          height: 220,
          objectFit: "cover",
          backgroundColor: "#000",
        }}
      />
      <CardContent>
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{ color: "#1a237e", mb: 0.5 }}
        >
          {title}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.875rem" }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GENAIVideoCard;

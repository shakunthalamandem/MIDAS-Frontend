import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";

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
        cursor: "pointer",
        "&:hover": {
          transform: "scale(1.015)",
        },
      }}
      onClick={() => window.open(url, "_blank")}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          image={thumbnail}
          alt={title}
          sx={{ height: 220, objectFit: "cover" }}
        />
        <IconButton
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "#e2e4e9cc",
            fontSize: 60,
            "&:hover": {
              color: "#112ae5ff",
            },
          }}
        >
          <PlayCircleFilledWhiteIcon fontSize="inherit" />
        </IconButton>
      </Box>

      <CardContent>
        <Typography variant="subtitle1" fontWeight={600} sx={{ color: "#1a237e", mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default GENAIVideoCard;

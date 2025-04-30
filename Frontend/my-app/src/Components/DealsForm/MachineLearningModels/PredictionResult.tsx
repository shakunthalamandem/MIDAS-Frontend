import React from "react";
import { Box, Typography } from "@mui/material";

type PredictionResultProps = {
  result: {
    prediction: string;
    lower_bound: string;
    upper_bound: string;
  };
};

const PredictionResult: React.FC<PredictionResultProps> = ({ result }) => {
  const getText = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case "positive deal":
        return "slightly positive";
      case "negative deal":
        return "slightly negative";
      case "neutral deal":
        return "neutral";
      default:
        return prediction;
    }
  };

  // Determine the color based on prediction
  const getColor = (prediction: string) => {
    switch (prediction.toLowerCase()) {
      case "positive deal":
        return "green";
      case "negative deal":
        return "red";
      case "neutral deal":
        return "orange";
      default:
        return "black"; // Default color if no match
    }
  };

  return (
    <Box sx={{ marginTop: 2, display: "flex", justifyContent: "center" }}>
      <Typography variant="body1" sx={{ textAlign: "center" }}>
        The model has predicted that the deal would be{" "}
        <strong style={{ color: getColor(result.prediction) }}>
          {getText(result.prediction)}
        </strong>{" "}
        and the expected range is{" "}
        <strong style={{ color: getColor(result.prediction) }}>
          {result.lower_bound}% to {result.upper_bound}%
        </strong>
        .
      </Typography>
    </Box>
  );
};

export default PredictionResult;

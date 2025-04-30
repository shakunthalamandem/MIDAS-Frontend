import React from "react";
import { Card, Typography } from "@mui/material";

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
      case "positive":
        return "slightly positive";
      case "negative":
        return "slightly negative";
      case "neutral":
        return "neutral";
      default:
        return prediction;
    }
  };

  return (
    <Card
      sx={{
        padding: 3,
        borderRadius: 2,
        boxShadow: 3,
        backgroundColor: "#f5f5f5",
        width: "130%",
        maxWidth: 800,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Prediction
      </Typography>
      <Typography variant="body1">
        The model has predicted the return to be{" "}
        <strong>{getText(result.prediction)}</strong> and the expected range is{" "}
        <strong>{result.lower_bound}% to {result.upper_bound}</strong>%.
      </Typography>
    </Card>
  );
};

export default PredictionResult;

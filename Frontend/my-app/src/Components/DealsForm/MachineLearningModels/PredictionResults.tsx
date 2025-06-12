import React, { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Box,
  Divider,
  LinearProgress,
  Container,
  Button,
  TextField,
} from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";

interface PredictionModel {
  prediction: string | null;
  Accuracy: number;
  model: string;
  range: string;
}

interface PredictionResultsProps {
  result: Record<string, PredictionModel>;
  onRepredict?: (t1dOpenPrice: number) => void;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({result, onRepredict,}) => {
  const [price, setPrice] = useState<number | "">("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value === "" ? "" : parseFloat(value));
  };

  const handleRepredict = () => {
    if (typeof price === "number" && onRepredict) {
      onRepredict(price);
    }
  };

  const modelVersions = Array.from(
    new Set(Object.keys(result).map((key) => key.split("_")[0]))
  );

  const modelTypes = ["main", "positive", "negative"];

  const getModelKey = (version: string, type: string): string => {
    const regex = new RegExp(`^${version}.*${type}`);
    return Object.keys(result).find((key) => regex.test(key)) || "";
  };

  const getOutcomeCategory = (
    prediction: string | null | undefined
  ): "Negative" | "Neutral" | "Positive" => {
    if (!prediction || typeof prediction !== "string") return "Neutral";
    const lower = prediction.toLowerCase();
    if (lower.includes("negative")) return "Negative";
    if (lower.includes("neutral")) return "Neutral";
    if (lower.includes("positive")) return "Positive";
    return "Neutral";
  };

  const renderOutcome = (prediction: string | null | undefined) => {
    if (!prediction) {
      return (
        <Box display="flex" alignItems="center" color="text.disabled">
          N/A
        </Box>
      );
    }

    const outcomeCategory = getOutcomeCategory(prediction);
    switch (outcomeCategory) {
      case "Negative":
        return (
          <Box display="flex" alignItems="center" color="error.main">
            <TrendingDownIcon sx={{ mr: 1 }} />
            Negative Deal
          </Box>
        );
      case "Neutral":
        return (
          <Box display="flex" alignItems="center" color="text.secondary">
            <TrendingFlatIcon sx={{ mr: 1 }} />
            Neutral Deal
          </Box>
        );
      case "Positive":
        return (
          <Box display="flex" alignItems="center" color="success.main">
            <TrendingUpIcon sx={{ mr: 1 }} />
            Positive Deal
          </Box>
        );
      default:
        return (
          <Box display="flex" alignItems="center" color="text.disabled">
            N/A
          </Box>
        );
    }
  };

  const renderBinaryResult = (value: string | null | undefined) => {
    if (!value) {
      return (
        <Box display="flex" alignItems="center" color="text.disabled">
          N/A
        </Box>
      );
    }

    const isTrue = value.toLowerCase() === "true";
    return (
      <Box display="flex" alignItems="center" color={isTrue ? "success.main" : "error.main"}>
        {isTrue ? (
          <>
            <CheckCircleIcon sx={{ mr: 1 }} /> Yes
          </>
        ) : (
          <>
            <CancelIcon sx={{ mr: 1 }} /> No
          </>
        )}
      </Box>
    );
  };

  const renderConfidenceLevel = (confidence: number | null | undefined) => {
    if (confidence == null || isNaN(confidence)) {
      return (
        <Box display="flex" alignItems="center" color="text.disabled">
          N/A
        </Box>
      );
    }

    let color = "#f44336";
    if (confidence >= 70) color = "#4caf50";
    else if (confidence >= 50) color = "#ff9800";

    return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            {confidence.toFixed(1)}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={confidence}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
      </Box>
    );
  };

  const rowLabels: Record<string, string> = {
    main: "General Deal Outcome Classification",
    positive: "High Positive Return Likelihood",
    negative: "High Negative Return Risk",
  };

  const rowExplanations: Record<string, string> = {
    main: `Categorizes the deal into:
📉 Negative: Return < -1%
⚖️ Neutral: -1% ≤ Return ≤ 1%
📈 Positive: Return > 1%`,
    positive: `Binary classifier predicting strong gain.
Threshold: Return > 3%`,
    negative: `Binary classifier estimating significant loss risk.
Threshold: Return < -2%`,
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper
        sx={{
          p: 3,
          mt: 4,
          bgcolor: "#f9fafb",
          borderRadius: 3,
          boxShadow: 3,
        }}
      >
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center">
            <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="h6" color="primary">
              📊 Model Prediction Results
            </Typography>
          </Box>

          {onRepredict && (
            <Box display="flex" alignItems="center">
              <TextField
                label="T+1 Day Open Price %"
                variant="outlined"
                value={price}
                onChange={handlePriceChange}
                size="small"
                sx={{ mr: 2, width: "200px" }}
                type="number"
              />
              <Button
                variant="outlined"
                onClick={handleRepredict}
                sx={{ backgroundColor: "#002060", color: "#FFF" }}
              >
                Repredict
              </Button>
            </Box>
          )}
        </Box>

        <Typography variant="body1" gutterBottom>
          Using trained machine learning models, this report provides insights into the expected return profile
          of a prospective equity deal under current conditions.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <TableContainer>
          <Table>
            <TableBody>
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
                {modelVersions.map((version) => (
                  <React.Fragment key={version}>
                    <TableCell sx={{ fontWeight: 600 }}>{`${version.toUpperCase()} Result`}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{`${version.toUpperCase()} Accuracy`}</TableCell>
                  </React.Fragment>
                ))}
              </TableRow>

              {modelTypes.map((type) => (
                <TableRow key={type}>
                  <TableCell>{rowLabels[type]}</TableCell>
                  <TableCell>
                    <Typography variant="body2" whiteSpace="pre-line">
                      {rowExplanations[type]}
                    </Typography>
                  </TableCell>

                  {modelVersions.map((version) => {
                    const key = getModelKey(version, type);
                    const modelData = result[key];

                    if (!modelData) {
                      return (
                        <React.Fragment key={version}>
                          <TableCell>
                            <Box color="text.disabled">N/A</Box>
                          </TableCell>
                          <TableCell>
                            <Box color="text.disabled">N/A</Box>
                          </TableCell>
                        </React.Fragment>
                      );
                    }

                    const renderResult =
                      type === "main"
                        ? renderOutcome(modelData.prediction)
                        : renderBinaryResult(modelData.prediction);

                    return (
                      <React.Fragment key={version}>
                        <TableCell>{renderResult}</TableCell>
                        <TableCell>{renderConfidenceLevel(modelData.Accuracy)}</TableCell>
                      </React.Fragment>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default PredictionResults;

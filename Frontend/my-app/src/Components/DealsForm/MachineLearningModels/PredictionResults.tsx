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
  CircularProgress,
} from "@mui/material";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import BarChartIcon from "@mui/icons-material/BarChart";
import MethodologyAccordion1Day from "./MethodologyAccordion1Day";

interface PredictionModel {
  prediction: string | null;
  accuracy: number;
  confidence: number;
  model: string;
  range: string;
  explanation?: string;
}

interface PredictionResultsProps {
  result: Record<string, PredictionModel>;
  onRepredict?: (t1dOpenPrice: number) => void;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({
  result,
  onRepredict,
}) => {
  const [price, setPrice] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value === "" ? "" : parseFloat(value));
  };

  const handleRepredict = async () => {
    if (typeof price === "number" && onRepredict) {
      setIsLoading(true);
      try {
        await onRepredict(price);
      } finally {
        setIsLoading(false);
      }
    }
  };

  /** 🔹 Identify model groups: baseline vs open */
  const modelVersions = Array.from(
    new Set(
      Object.keys(result).map((key) =>
        key.includes("open") ? "t1d_open" : "t1d"
      )
    )
  );

  const modelTypes = ["main", "positive", "negative"];

  /** 🔹 Helper to pick the right key for a version + type */
  const getModelKey = (version: string, type: string) => {
    const regex = new RegExp(`^${version}.*${type}_model$`);
    const keys = Object.keys(result).filter((key) => regex.test(key));
    return keys[0] || "";
  };

  /** 🔹 Normalize prediction outcome */
  const getOutcomeCategory = (
    prediction: string | null | undefined
  ): "Negative" | "Neutral" | "Positive" => {
    if (!prediction) return "Neutral";
    const lower = prediction.toLowerCase();
    if (lower.includes("negative")) return "Negative";
    if (lower.includes("neutral")) return "Neutral";
    if (lower.includes("positive")) return "Positive";
    return "Neutral";
  };

  /** 🔹 Decide overall prediction (prefer open if price entered) */
  const getOverallPrediction = (): "Negative" | "Neutral" | "Positive" => {
    const mainModel = result["t1d_main_model"];
    const openMainModel = result["t1d_open_main_model"];

    if (openMainModel && typeof price === "number") {
      return getOutcomeCategory(openMainModel.prediction);
    }
    if (mainModel) {
      return getOutcomeCategory(mainModel.prediction);
    }
    return "Neutral";
  };

  const overallPrediction = getOverallPrediction();

  /** 🔹 UI renderers */
  const renderOutcome = (prediction: string | null | undefined) => {
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
        return <Box color="text.disabled">N/A</Box>;
    }
  };

  const renderBinaryResult = (value: string | null | undefined) => {
    if (!value) return <Box color="text.disabled">N/A</Box>;
    const isTrue = value.toLowerCase() === "true";
    return (
      <Box
        display="flex"
        alignItems="center"
        color={isTrue ? "success.main" : "error.main"}
      >
        {isTrue ? <CheckCircleIcon sx={{ mr: 1 }} /> : <CancelIcon sx={{ mr: 1 }} />}
        {isTrue ? "Yes" : "No"}
      </Box>
    );
  };

  const renderConfidenceLevel = (confidence: number | null | undefined) => {
    if (confidence == null || isNaN(confidence))
      return <Box color="text.disabled">N/A</Box>;

    let color = "#f44336";
    if (confidence >= 60) color = "#4caf50";
    else if (confidence >= 40) color = "#ff9800";

    return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <LinearProgress
          variant="determinate"
          value={confidence}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": { backgroundColor: color },
          }}
        />
        <Typography
          variant="caption"
          sx={{ fontStyle: "italic", color: "text.secondary", mt: 0.5 }}
        >
          Confidence - {confidence.toFixed(1)}%
        </Typography>
      </Box>
    );
  };

const rowLabels: Record<string, { issue?: string; open?: string }> = (() => {
  const labels: Record<string, { issue?: string; open?: string }> = {
    main: {},
    positive: {},
    negative: {},
  };

  // ---- MAIN ----
  if (result["t1d_main_model"]?.prediction) {
    labels.main.issue = "Overall Return Category";
  }
  if (result["t1d_open_main_model"]?.prediction) {
    labels.main.open = "Overall Return Category";
  }

  // ---- POSITIVE ----
  if (result["t1d_positive_model"]?.prediction?.toLowerCase() === "true") {
    labels.positive.issue = "High Positive Return Probability";
  }
  if (result["t1d_open_positive_model"]?.prediction?.toLowerCase() === "true") {
    labels.positive.open = "High Positive Return Probability";
  }

  // ---- NEGATIVE ----
  if (result["t1d_negative_model"]?.prediction?.toLowerCase() === "true") {
    labels.negative.issue = "High Negative Return Risk";
  }
  if (result["t1d_open_negative_model"]?.prediction?.toLowerCase() === "true") {
    labels.negative.open = "High Negative Return Risk";
  }

  return labels;
})();

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
        {/* ---- Header ---- */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              T+1D Close - Model Predictions
            </Typography>
          </Box>
          {onRepredict && (
            <Box display="flex" alignItems="center">
              <TextField
                label="T+1D Open Return (%)"
                variant="outlined"
                size="small"
                value={price}
                onChange={handlePriceChange}
                sx={{
                  mr: 2,
                  width: 194,
                  backgroundColor: "#ede7f6",
                  borderRadius: 1,
                }}
                type="number"
              />
              <Button
                variant="outlined"
                onClick={handleRepredict}
                disabled={isLoading}
                sx={{
                  backgroundColor: "#ede7f6",
                  color: "#002060",
                  border: "1px solid #B99976",
                  "&:disabled": { backgroundColor: "#002060", color: "#ccc" },
                }}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: "#fff" }} />
                ) : (
                  "Repredict"
                )}
              </Button>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 3 }} />
        <MethodologyAccordion1Day />

        {/* ---- Table ---- */}
        <TableContainer>
          <Table>
            <TableBody>
              {/* Header Row */}
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
                {modelVersions.map((version, idx) => {
                  const label = version.includes("open")
                    ? "T+1D Close from T+1D Open"
                    : "T+1D Close from Issue Price";
                  const cellBgColor = idx === 0 ? "#e3f2fd" : "#ede7f6";
                  return (
                    <React.Fragment key={version}>
                      <TableCell sx={{ fontWeight: 600, bgcolor: cellBgColor }}>
                        {label}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, bgcolor: cellBgColor }}>
                        Confidence
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              {/* Dynamic Rows */}
              {Object.entries(rowLabels)
                .filter(([_, label]) => label)
                .map(([type, label]) => (
                  <TableRow key={type}>
                    <TableCell>
                      {label.issue || label.open || ""}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" whiteSpace="pre-line">
                        {result[getModelKey(modelVersions[0], type)]?.explanation ||
                          ""}
                      </Typography>
                    </TableCell>

                    {modelVersions.map((version, idx) => {
                      const key = getModelKey(version, type);
                      const modelData = result[key];
                      const cellColor = idx === 0 ? "#e3f2fd" : "#ede7f6";

                      if (!modelData) {
                        return (
                          <React.Fragment key={version}>
                            <TableCell sx={{ bgcolor: cellColor }}>
                              <Box color="text.disabled">N/A</Box>
                            </TableCell>
                            <TableCell sx={{ bgcolor: cellColor }}>
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
                          <TableCell sx={{ bgcolor: cellColor }}>
                            {renderResult}
                          </TableCell>
                          <TableCell sx={{ bgcolor: cellColor }}>
                            {renderConfidenceLevel(modelData.confidence)}
                          </TableCell>
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

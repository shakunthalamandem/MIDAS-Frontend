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

const IpoPredictionResults: React.FC<PredictionResultsProps> = ({
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
      onRepredict(price);
      setIsLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } finally {
        setIsLoading(false);
      }
    }
  };

  // versions are like ["t1d", "t1d_open"]
  const modelVersions = Array.from(
    new Set(Object.keys(result).map((key) => key.split("_")[0] + (key.includes("open") ? "_open" : "")))
  );

  const modelTypes = ["main"
    // , "positive", "negative"
];

  const getModelKey = (version: string, type: string): string => {
    const regex = new RegExp(`^${version}.*${type}_model$`);
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
      <Box
        display="flex"
        alignItems="center"
        color={isTrue ? "success.main" : "error.main"}
      >
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

  const renderAccuracyLevel = (accuracy: number | null | undefined) => {
    if (accuracy == null || isNaN(accuracy)) {
      return (
        <Box display="flex" alignItems="center" color="text.disabled">
          N/A
        </Box>
      );
    }

    let color = "#f44336";
    if (accuracy >= 70) color = "#4caf50";
    else if (accuracy >= 50) color = "#ff9800";

    return (
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {/* <LinearProgress
          variant="determinate"
          value={accuracy}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "rgba(0,0,0,0.05)",
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        /> */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontStyle: "italic",
              ml: 1,
              color: "text.secondary",
              fontWeight: "bold",
            }}
          >
            Accuracy - {accuracy.toFixed(1)}%
          </Typography>
        </Box>
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
            "& .MuiLinearProgress-bar": {
              backgroundColor: color,
            },
          }}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
          <Typography
            variant="caption"
            sx={{
              fontStyle: "italic",
              ml: 1,
              color: "text.secondary",
            }}
          >
            Confidence - {confidence.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    );
  };

  const rowLabels: Record<string, string> = {
    main: "Overall Return Category",
    // positive: "High Positive Return Probability",
    // negative: "High Negative Return Risk",
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
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
            <Typography
              variant="h6"
              component="h2"
              color="primary.main"
              fontWeight="bold"
            >
              T+1D Close - Model Predictions
            </Typography>
          </Box>

          {/* {onRepredict && (
            <Box display="flex" alignItems="center">
              <TextField
                label="T+1D Open Return (%)"
                variant="outlined"
                value={price}
                onChange={handlePriceChange}
                size="small"
                sx={{
                  mr: 2,
                  width: "194px",
                  position: "relative",
                  top: "18px",
                  backgroundColor: "#ede7f6",
                  borderRadius: "4px",
                }}
                type="number"
              />
              <Button
                variant="outlined"
                onClick={handleRepredict}
                disabled={isLoading}
                sx={{
                  position: "relative",
                  top: "18px",
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
          )} */}
        </Box>

        <Divider sx={{ my: 3 }} />
        <Box mb={2}>
          <MethodologyAccordion1Day />
        </Box>

        <TableContainer>
          <Table>
            <TableBody>
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
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          bgcolor: cellBgColor,
                        }}
                      >
                        {label}
                      </TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 600,
                          bgcolor: cellBgColor,
                        }}
                      >
                        Confidence
                      </TableCell>
                    </React.Fragment>
                  );
                })}
              </TableRow>

              {modelTypes.map((type) => (
                <TableRow key={type}>
                  <TableCell>{rowLabels[type]}</TableCell>
                  <TableCell>
                    <Typography variant="body2" whiteSpace="pre-line">
                      {
                        result[getModelKey(modelVersions[0], type)]
                          ?.explanation || ""
                      }
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
                          <Box display="flex" flexDirection="column" gap={1}>
                            {/* {renderAccuracyLevel(modelData.accuracy)} */}
                            {renderConfidenceLevel(modelData.confidence)}
                          </Box>
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

export default IpoPredictionResults;

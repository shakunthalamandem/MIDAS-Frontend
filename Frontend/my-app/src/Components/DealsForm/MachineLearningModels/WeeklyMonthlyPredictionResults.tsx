import React, { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Box,
  Divider,
  LinearProgress,
  Container,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

import BarChartIcon from "@mui/icons-material/BarChart";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

interface PredictionModel {
  prediction: string | null;
  Accuracy: number;
  Confidence: number;
  range?: string | null;
  model?: string | null;
}

interface WeeklyMonthlyPredictionResultsProps {
  result: Record<string, PredictionModel> | null;
  onWeeklyMonthlyRepredict: (
    t1dCloseReturn: number
  ) => Promise<Record<string, PredictionModel>>;
}

const WeeklyMonthlyPredictionResults: React.FC<
  WeeklyMonthlyPredictionResultsProps
> = ({ result, onWeeklyMonthlyRepredict }) => {
  const [t1dCloseReturn, setT1dCloseReturn] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState(result);

  useEffect(() => {
    setPredictionResult(result);
  }, [result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setT1dCloseReturn(value === "" ? "" : parseFloat(value));
  };

  const handleRepredict = async () => {
    if (typeof t1dCloseReturn === "number" && onWeeklyMonthlyRepredict) {
      setIsLoading(true);
      try {
        const newResult = await onWeeklyMonthlyRepredict(t1dCloseReturn);
        setPredictionResult(newResult);
      } catch (error) {
        console.error("Reprediction failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
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
            <TrendingDownIcon sx={{ mr: 1 }} /> Negative Deal
          </Box>
        );
      case "Neutral":
        return (
          <Box display="flex" alignItems="center" color="text.secondary">
            <TrendingFlatIcon sx={{ mr: 1 }} /> Neutral Deal
          </Box>
        );
      case "Positive":
        return (
          <Box display="flex" alignItems="center" color="success.main">
            <TrendingUpIcon sx={{ mr: 1 }} /> Positive Deal
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
        <LinearProgress
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
        />
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

  const rowConfig = [
{
  key: "main",
  label: "Outcome Classification",
  explanation: `Classifies the expected return into categories:\n📉 Negative: Return ≤ 0%\n📈 Positive: Return > 0%`,
},

    {
      key: "positive",
      label: "High Positive Return Likelihood",
      explanation:
        "Binary classifier predicting a strong gain (e.g., Return > 5%).",
    },
    {
      key: "negative",
      label: "High Negative Return Risk",
      explanation:
        "Binary classifier estimating significant loss risk (e.g., Return < -3%).",
    },
  ];

  const timeFrames = ["Weekly", "Monthly"];

  const showTable = predictionResult && Object.keys(predictionResult).length > 0;

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Paper
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: 3,
          boxShadow: 3,
          bgcolor: "background.default",
        }}
      >
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems={{ md: "center" }}
          justifyContent="space-between"
          gap={2}
          mb={2}
        >
          <Box display="flex" alignItems="center">
            <BarChartIcon color="primary" sx={{ mr: 1.5 }} />
            <Typography
              variant="h6"
              component="h2"
              color="primary.main"
              fontWeight="bold"
            >
              T+1W & T+1M - Model Predictions
            </Typography>
          </Box>
          <Box display="flex" alignItems="flex-end" gap={2}>
            <TextField
              label="T+1D Close Return (%)"
              variant="outlined"
              size="small"
              type="number"
              value={t1dCloseReturn}
              onChange={handleInputChange}
              sx={{ minWidth: "220px" }}
            />
            <Button
              variant="contained"
              onClick={handleRepredict}
              disabled={isLoading || t1dCloseReturn === ""}
              sx={{ height: "40px" }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Predict"
              )}
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {showTable ? (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      "& .MuiTableCell-head": {
                        fontWeight: "bold",
                        bgcolor: "grey.100",
                      },
                    }}
                  >
                    <TableCell  sx={{ minWidth: 150 }}>Model</TableCell>
                    <TableCell sx={{ minWidth: 250 }}>Explanation</TableCell>
                    {timeFrames.map((frame, index) => (
                      <React.Fragment key={frame}>
                        <TableCell
                          sx={{
                            bgcolor:
                              index === 0
                                ? "rgba(227, 242, 253, 0.7)"
                                : "rgba(237, 231, 246, 0.7)",
                          }}
                        >
                          T + 1 {frame} (AM) Result
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor:
                              index === 0
                                ? "rgba(227, 242, 253, 0.7)"
                                : "rgba(237, 231, 246, 0.7)",
                            minWidth: 180,
                          }}
                        >
                          Accuracy & Confidence
                        </TableCell>
                      </React.Fragment>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rowConfig.map((row) => {
                    const modelKeys = {
                      weekly: `t1w_${row.key}`,
                      monthly: `t1m_${row.key}`,
                    };

                    const isWeeklyNull =
                      !predictionResult?.[modelKeys.weekly]?.prediction &&
                      predictionResult?.[modelKeys.weekly]?.Accuracy == null;

                    const isMonthlyNull =
                      !predictionResult?.[modelKeys.monthly]?.prediction &&
                      predictionResult?.[modelKeys.monthly]?.Accuracy == null;

                    if (isWeeklyNull && isMonthlyNull) return null;

                    return (
                      <TableRow
                        key={row.key}
                        sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ fontWeight: "medium" }}
                        >
                          {row.label}
                        </TableCell>
<TableCell>
  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
    {row.explanation}
  </Typography>
</TableCell>
                        {timeFrames.map((frame, index) => {
                          const apiKey =
                            frame.toLowerCase() === "weekly"
                              ? modelKeys.weekly
                              : modelKeys.monthly;
                          const modelData = predictionResult?.[apiKey];
                          const cellBgColor =
                            index === 0
                              ? "#e3f2fd"
                              : "#ede7f6";
                              

                          if (!modelData) {
                            return (
                              <React.Fragment key={apiKey}>
                                <TableCell sx={{ bgcolor: cellBgColor }}>
                                  <Box color="text.disabled">N/A</Box>
                                </TableCell>
                                <TableCell sx={{ bgcolor: cellBgColor }}>
                                  <Box color="text.disabled">N/A</Box>
                                </TableCell>
                              </React.Fragment>
                            );
                          }

                          const renderResult =
                            row.key === "main"
                              ? renderOutcome(modelData.prediction)
                              : renderBinaryResult(modelData.prediction);

                          return (
                            <React.Fragment key={apiKey}>
                              <TableCell
                                sx={{ bgcolor: cellBgColor, fontWeight: "medium" }}
                              >
                                {renderResult}
                              </TableCell>
                              <TableCell sx={{ bgcolor: cellBgColor }}>
                                <Box display="flex" flexDirection="column" gap={1}>
                                  {renderAccuracyLevel(modelData.Accuracy)}
                                  {renderConfidenceLevel(modelData.Confidence)}
                                </Box>
                              </TableCell>
                            </React.Fragment>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={4} textAlign="left">
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-line", mt: 2, lineHeight: 1.6 }}
              >
                <Box component="span" sx={{ color: "error.main", fontWeight: 600 }}>
                  Note:
                </Box>{" "}
                The model automatically incorporates the following key factors based
                on the deal's <strong>Pricing Date</strong> and{" "}
                <strong>Sector</strong>
                {"\n"}📈 <strong>Market context:</strong> Average sector index
                returns and S&amp;P 500 performance over
                <em> T+1 Week</em>, <em> T+1 Month</em>, and <em> T+3 Months</em>.
                {"\n"}💧 <strong>Liquidity indicator:</strong> Compares NYSE trading
                volume on the previous day with the average volume over the past
                month.
                {"\n"}These factors are automatically calculated and used by the
                model to improve prediction accuracy.
                {"\n"}The model is trained on{" "}
                <strong>over 4,000 historical deals</strong>, ensuring a robust and
                reliable forecast.
              </Typography>
            </Box>
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Enter the **T+1D Close Return (%)** to predict the T+1W and T+1M
              outcomes.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default WeeklyMonthlyPredictionResults;
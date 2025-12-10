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
  accuracy?: number | null;
  confidence?: number | null;
  range?: string | null;
  model?: string | null;
  explanation?: string | null;
}

interface WeeklyMonthlyPredictionResultsProps {
  result: Record<string, PredictionModel> | null;

  // UPDATED: send both close price & close return
  onWeeklyMonthlyRepredict: (params: {
    t1dClosePrice: number;
    t1dCloseReturn: number;
  }) => Promise<Record<string, PredictionModel>>;

  /** Prefill input when a T+1D close price is already known (nullable) */
  initialT1dClosePrice?: number | null;

  /** Issue price to calculate T+1D close return from */
  issuePrice?: number | null;
}

const IPOWeeklyMonthlyPredictionResults: React.FC<
  WeeklyMonthlyPredictionResultsProps
> = ({
  result,
  onWeeklyMonthlyRepredict,
  initialT1dClosePrice,
  issuePrice,
}) => {
  const [t1dClosePrice, setT1dClosePrice] = useState<number | "">("");
  const [t1dCloseReturn, setT1dCloseReturn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState(result);

  // Prefill from props: calculate return from issuePrice + closePrice
  useEffect(() => {
    if (
      initialT1dClosePrice == null ||
      issuePrice == null ||
      issuePrice === 0
    ) {
      setT1dClosePrice("");
      setT1dCloseReturn(null);
      return;
    }

    setT1dClosePrice(initialT1dClosePrice);

    const ret = ((initialT1dClosePrice - issuePrice) / issuePrice) * 100;
    setT1dCloseReturn(Number(ret.toFixed(2)));
  }, [initialT1dClosePrice, issuePrice]);

  useEffect(() => {
    setPredictionResult(result);
  }, [result]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setT1dClosePrice("");
      setT1dCloseReturn(null);
      return;
    }

    const numeric = parseFloat(value);
    if (isNaN(numeric)) {
      setT1dClosePrice("");
      setT1dCloseReturn(null);
      return;
    }

    setT1dClosePrice(numeric);

    if (issuePrice != null && issuePrice !== 0) {
      const ret = ((numeric - issuePrice) / issuePrice) * 100;
      setT1dCloseReturn(Number(ret.toFixed(2)));
    } else {
      setT1dCloseReturn(null);
    }
  };

  const handleRepredict = async () => {
    if (
      typeof t1dClosePrice === "number" &&
      t1dCloseReturn != null &&
      onWeeklyMonthlyRepredict
    ) {
      setIsLoading(true);
      try {
        const newResult = await onWeeklyMonthlyRepredict({
          t1dClosePrice,
          t1dCloseReturn,
        });
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
          <Typography variant="caption" sx={{ fontStyle: "italic", ml: 1 }}>
            Confidence: {confidence.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    );
  };

  const rowConfig = [
    { key: "main_model", label: "Outcome Classification" },
    { key: "positive_model", label: "High Positive Return Likelihood" },
    { key: "negative_model", label: "High Negative Return Risk" },
  ];

  const timeFrames = ["Week", "Month"];
  const showTable =
    predictionResult && Object.keys(predictionResult).length > 0;

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
            {/* Number Badge */}
            <Box
              sx={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: "#002060",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                mr: 2,
                fontSize: "16px",
              }}
            >
              3
            </Box>

            <BarChartIcon color="primary" sx={{ mr: 1.5 }} />

            <Typography
              variant="h6"
              component="h2"
              color="primary.main"
              fontWeight="bold"
            >
              1 Week & 1 Month from 1st Day Close - Model Predictions
            </Typography>
          </Box>

          <Box display="flex" alignItems="flex-end" gap={2}>
            <Box>
              <TextField
                label="1st Day Close Price"
                variant="outlined"
                size="small"
                type="number"
                value={t1dClosePrice}
                onChange={handleInputChange}
                sx={{ minWidth: "220px" }}
              />
              <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
                Calculated 1st Day Close Return:{" "}
                {t1dCloseReturn != null
                  ? `${t1dCloseReturn.toFixed(2)} %`
                  : "—"}
              </Typography>
              {issuePrice != null && (
                <Typography variant="caption" color="text.secondary">
                  Issue Price: {issuePrice}
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={handleRepredict}
              disabled={
                isLoading || t1dClosePrice === "" || t1dCloseReturn == null
              }
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
        <Box>
          <Typography>
            Along with the parameters considered for the 1st Day prediction, we
            additionally use the <b>1st Day Close Price / Return</b> to generate
            1 Week and 1 Month outcomes.
          </Typography>
        </Box>
        <Divider sx={{ my: 3 }} />

        {showTable ? (
          <>
            <TableContainer>
              <Table sx={{ minWidth: 800 }}>
                <TableHead>
                  <TableRow
                    sx={{
                      "& .MuiTableCell-head": { fontWeight: "bold" },
                    }}
                  >
                    <TableCell sx={{ minWidth: 100, bgcolor: "#F0F0f0" }}>
                      Model
                    </TableCell>
                    <TableCell sx={{ minWidth: 200, bgcolor: "#F0F0f0" }}>
                      Explanation
                    </TableCell>
                    {timeFrames.map((frame, index) => (
                      <React.Fragment key={frame}>
                        <TableCell
                          sx={{ bgcolor: index === 0 ? "#e3f2fd" : "#ede7f6" }}
                        >
                          1st {frame}(AM) from 1st Day Close
                        </TableCell>
                        <TableCell
                          sx={{
                            bgcolor: index === 0 ? "#e3f2fd" : "#ede7f6",
                            minWidth: 90,
                          }}
                        >
                          Confidence
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

                    const weeklyData = predictionResult?.[modelKeys.weekly];
                    const monthlyData = predictionResult?.[modelKeys.monthly];

                    if (!weeklyData && !monthlyData) return null;

                    return (
                      <TableRow
                        key={row.key}
                        sx={{
                          "&:last-child td, &:last-child th": { border: 0 },
                        }}
                      >
                        <TableCell
                          component="th"
                          scope="row"
                          sx={{ fontWeight: "medium" }}
                        >
                          {row.label}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: "pre-line" }}
                          >
                            {weeklyData?.explanation ||
                              (weeklyData as any)?.Explanation ||
                              monthlyData?.explanation ||
                              (monthlyData as any)?.Explanation ||
                              "N/A"}
                          </Typography>
                        </TableCell>
                        {timeFrames.map((frame, index) => {
                          const apiKey =
                            frame === "Week"
                              ? modelKeys.weekly
                              : modelKeys.monthly;
                          const modelData = predictionResult?.[apiKey];
                          const cellBgColor =
                            index === 0 ? "#e3f2fd" : "#ede7f6";

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
                            row.key === "main_model"
                              ? renderOutcome(modelData.prediction)
                              : renderBinaryResult(modelData.prediction);

                          return (
                            <React.Fragment key={apiKey}>
                              <TableCell
                                sx={{
                                  bgcolor: cellBgColor,
                                  fontWeight: "medium",
                                }}
                              >
                                {renderResult}
                              </TableCell>
                              <TableCell sx={{ bgcolor: cellBgColor }}>
                                <Box
                                  display="flex"
                                  flexDirection="column"
                                  gap={1}
                                >
                                  {renderConfidenceLevel(
                                    modelData.confidence ??
                                      (modelData as any)?.Confidence ??
                                      null
                                  )}
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
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              Enter the <b>1st Day Close Price</b> to predict the 1W and 1M
              outcomes.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default IPOWeeklyMonthlyPredictionResults;

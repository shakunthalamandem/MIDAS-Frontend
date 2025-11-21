import React, { useEffect, useState } from "react";
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
import IPOModelMethodologyAccordion from "./IPOModelMethodologyAccordion";

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
  initialT1dOpenReturn?: number | null;
}

const IPOPredictionResults: React.FC<PredictionResultsProps> = ({
  result,
  onRepredict,
  initialT1dOpenReturn,
}) => {
  const [price, setPrice] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (initialT1dOpenReturn === null || initialT1dOpenReturn === undefined) {
      setPrice("");
    } else {
      setPrice(initialT1dOpenReturn);
    }
  }, [initialT1dOpenReturn]);

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

  const modelTypes = ["main"] as const;

  const getModelKey = (versionPrefix: string, type: string): string => {
    // "t1d" + "main"      => "t1d_main_model"
    // "t1d_open" + "main" => "t1d_open_main_model"
    return `${versionPrefix}_${type}_model`;
  };

  const getOutcomeCategory = (
    prediction: string | null | undefined
  ): "Low Return" | "Neutral Return" | "Positive Return" => {
    const DEFAULT = "Neutral Return" as const;
    if (!prediction || typeof prediction !== "string") return DEFAULT;
    const lower = prediction.trim().toLowerCase();

    if (lower.includes("low return")) return "Low Return";
    if (lower.includes("neutral return")) return "Neutral Return";
    if (lower.includes("positive return")) return "Positive Return";

    return DEFAULT;
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
      case "Low Return":
        return (
          <Box display="flex" alignItems="center" color="error.main">
            <TrendingDownIcon sx={{ mr: 1 }} />
            Low Return Deal
          </Box>
        );
      case "Neutral Return":
        return (
          <Box display="flex" alignItems="center" color="text.secondary">
            <TrendingFlatIcon sx={{ mr: 1 }} />
            Neutral Return Deal
          </Box>
        );
      case "Positive Return":
        return (
          <Box display="flex" alignItems="center" color="success.main">
            <TrendingUpIcon sx={{ mr: 1 }} />
            Positive Return Deal
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
          <Typography
            variant="caption"
            sx={{
              fontStyle: "italic",
              ml: 1,
            }}
          >
            Confidence: {confidence.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    );
  };

  const rowLabels: Record<string, string> = {
    main: "Overall Return Category",
  };

  /** Generic table renderer for a given "versionPrefix" */
  const renderSingleVersionTable = (
    versionPrefix: string,
    headerTitle: string,
    showRepredict: boolean,
    tableNumber: number
  ) => {
    const isOpenVersion = versionPrefix.includes("open");
    const headerBg = isOpenVersion ? "#ede7f6" : "#e3f2fd";
    const columnLabel = isOpenVersion
      ? "1st Day Close from Open Price"
      : "1st Day Close from Issue Price";

    return (
      <Paper
        sx={{ p: 3, mt: 4, bgcolor: "#f9fafb", borderRadius: 3, boxShadow: 3 }}
      >
        {/* HEADER WITH TABLE NUMBER */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center">
            {/* Numbered Circle */}
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
                fontWeight: 600,
                mr: 2,
              }}
            >
              {tableNumber}
            </Box>
            <BarChartIcon sx={{ color: "primary.main", mr: 1 }} />
            <Typography
              variant="h6"
              component="h2"
              color="primary.main"
              fontWeight="bold"
            >
              {headerTitle}
            </Typography>
          </Box>

          {showRepredict && onRepredict && (
            <Box display="flex" alignItems="center">
              <TextField
                label="1st Day Open Return (%)"
                variant="outlined"
                value={price}
                onChange={handlePriceChange}
                size="small"
                sx={{
                  mr: 2,
                  width: "194px",
                  backgroundColor: "#ede7f6",
                  borderRadius: "4px",
                }}
                type="number"
              />
              <Button
                variant="outlined"
                onClick={handleRepredict}
                disabled={isLoading || price === ""}
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

        <TableContainer>
          <Table>
            <TableBody>
              {/* Header row */}
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: headerBg }}>
                  {columnLabel}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: headerBg }}>
                  Confidence
                </TableCell>
              </TableRow>

              {modelTypes.map((type) => {
                const key = getModelKey(versionPrefix, type);
                const modelData = result[key]; // may be undefined initially for open

                return (
                  <TableRow key={`${versionPrefix}-${type}`}>
                    <TableCell>{rowLabels[type]}</TableCell>
                    <TableCell>
                      <Typography variant="body2" whiteSpace="pre-line">
                        {modelData?.explanation || ""}
                      </Typography>
                    </TableCell>

                    {/* Prediction */}
                    <TableCell sx={{ bgcolor: headerBg }}>
                      {type === "main"
                        ? renderOutcome(modelData?.prediction)
                        : renderBinaryResult(modelData?.prediction)}
                    </TableCell>

                    {/* Confidence */}
                    <TableCell sx={{ bgcolor: headerBg }}>
                      <Box display="flex" flexDirection="column" gap={1}>
                        {/* Uncomment if you want accuracy */}
                        {/* {renderAccuracyLevel(modelData?.accuracy)} */}
                        {renderConfidenceLevel(modelData?.confidence)}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const hasAnyPrediction =
    result && Object.keys(result).length > 0 && result.constructor === Object;

  // We still detect if open results exist (for nicer handling),
  // but we ALSO show table 2 whenever onRepredict is available.
  const hasOpenVersion = Object.keys(result || {}).some((key) =>
    key.toLowerCase().includes("open")
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <IPOModelMethodologyAccordion />

      {/* Table 1: Issue Price (no Repredict) */}
      {hasAnyPrediction &&
        renderSingleVersionTable(
          "t1d",
          "1st Day Close from Issue Price - Model Predictions",
          false,
          1
        )}

      {/* Table 2: From T+1D Open (Repredict shown)
          - Shown if:
            a) we actually have "open" model keys, OR
            b) we have an onRepredict handler (so user can input open return)
      */}
      {(hasOpenVersion || !!onRepredict) &&
        hasAnyPrediction &&
        renderSingleVersionTable(
          "t1d_open",
          "1st Day Close from Open - Model Predictions",
          true,
          2
        )}
    </Container>
  );
};

export default IPOPredictionResults;

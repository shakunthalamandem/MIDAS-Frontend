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
import FOModelMethodologyAccordion from "./FOModelMethodologyAccordion";

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

  // UPDATED: send both price & return to parent
  onRepredict?: (params: {
    t1dOpenPrice: number;
    t1dOpenReturn: number;
  }) => void;

  /** Prefill T+1D Open Price when known */
  initialT1dOpenPrice?: number | null;

  /** Issue price to calculate return from */
  issuePrice?: number | null;
}

const FOPredictionResults: React.FC<PredictionResultsProps> = ({
  result,
  onRepredict,
  initialT1dOpenPrice,
  issuePrice,
}) => {
  const [openPrice, setOpenPrice] = useState<number | "">("");
  const [openReturn, setOpenReturn] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Hydrate from props whenever they change
  useEffect(() => {
    if (
      initialT1dOpenPrice == null ||
      issuePrice == null ||
      issuePrice === 0
    ) {
      setOpenPrice("");
      setOpenReturn(null);
      return;
    }

    setOpenPrice(initialT1dOpenPrice);
    const ret =
      ((initialT1dOpenPrice - issuePrice) / issuePrice) * 100;
    setOpenReturn(Number(ret.toFixed(2)));
  }, [initialT1dOpenPrice, issuePrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (value === "") {
      setOpenPrice("");
      setOpenReturn(null);
      return;
    }

    const numeric = parseFloat(value);
    if (isNaN(numeric)) {
      setOpenPrice("");
      setOpenReturn(null);
      return;
    }

    setOpenPrice(numeric);

    if (issuePrice != null && issuePrice !== 0) {
      const ret = ((numeric - issuePrice) / issuePrice) * 100;
      setOpenReturn(Number(ret.toFixed(2)));
    } else {
      setOpenReturn(null);
    }
  };

  const handleRepredict = async () => {
    if (
      typeof openPrice === "number" &&
      openReturn != null &&
      onRepredict
    ) {
      setIsLoading(true);
      try {
        await onRepredict({
          t1dOpenPrice: openPrice,
          t1dOpenReturn: openReturn,
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  /** Identify model groups: baseline vs open */
  const modelVersions = Array.from(
    new Set(
      Object.keys(result).map((key) =>
        key.includes("open") ? "t1d_open" : "t1d"
      )
    )
  );
  const issueVersions = modelVersions.filter((v) => !v.includes("open")); // "T+1D Close from Issue Price"
  const openVersions = modelVersions.filter((v) => v.includes("open")); // "T+1D Close from T+1D Open"

  const modelTypes = ["main", "positive", "negative"];

  /** Helper to pick the right key for a version + type */
  const getModelKey = (version: string, type: string) => {
    const regex = new RegExp(`^${version}.*${type}_model$`);
    const keys = Object.keys(result).filter((key) => regex.test(key));
    return keys[0] || "";
  };

  /** Normalize prediction outcome */
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
        <Typography variant="caption" sx={{ fontStyle: "italic", mt: 0.5 }}>
          Confidence: {confidence.toFixed(1)}%
        </Typography>
      </Box>
    );
  };

  /** Build visible row labels once, same as before */
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

  /** Helper to render a table for a specific version set */
  const renderTableForVersions = (
    versions: string[],
    headerTitle: string,
    showRepredictControls: boolean,
    tableNumber: number
  ) => {
    if (versions.length === 0) return null;

    const headerBg = versions[0].includes("open") ? "#ede7f6" : "#e3f2fd";

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
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              {headerTitle}
            </Typography>
          </Box>

          {showRepredictControls && onRepredict && (
            <Box display="flex" alignItems="center">
              <Box mr={2}>
                <TextField
                  label="T+1D Open Price"
                  variant="outlined"
                  size="small"
                  value={openPrice}
                  onChange={handlePriceChange}
                  sx={{
                    width: 200,
                    backgroundColor: "#ede7f6",
                    borderRadius: 1,
                  }}
                  type="number"
                />
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, display: "block" }}
                >
                  Calculated 1st Day Open Return:{" "}
                  {openReturn != null ? `${openReturn.toFixed(2)} %` : "—"}
                </Typography>
                {issuePrice != null && (
                  <Typography variant="caption" color="text.secondary">
                    Issue Price: {issuePrice}
                  </Typography>
                )}
              </Box>

              <Button
                variant="outlined"
                onClick={handleRepredict}
                disabled={
                  isLoading ||
                  openPrice === "" ||
                  openReturn == null
                }
                sx={{
                  backgroundColor: "#ede7f6",
                  color: "#002060",
                  border: "1px solid #B99976",
                  "&:disabled": {
                    backgroundColor: "#002060",
                    color: "#ccc",
                  },
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

        {/* ---- Table ---- */}
        <TableContainer>
          <Table>
            <TableBody>
              {/* Header Row */}
              <TableRow sx={{ bgcolor: "#f0f4f8" }}>
                <TableCell sx={{ fontWeight: 600 }}>Model</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Explanation</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: headerBg }}>
                  {versions[0].includes("open")
                    ? "1st Day Close from Open Price"
                    : "1st Day Close from Issue Price"}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: headerBg }}>
                  Confidence
                </TableCell>
              </TableRow>

              {/* Dynamic Rows */}
              {Object.entries(rowLabels)
                .filter(([_, label]) =>
                  versions[0].includes("open") ? Boolean(label.open) : Boolean(label.issue)
                )
                .filter(([type]) => {
                  const key = getModelKey(versions[0], type);
                  return Boolean(result[key]);
                })
                .map(([type, label]) => {
                  const labelText = versions[0].includes("open")
                    ? label.open || ""
                    : label.issue || "";

                  const modelKey = getModelKey(versions[0], type);
                  const modelData = result[modelKey];

                  const explanation = modelData?.explanation || "";

                  const rendered =
                    type === "main"
                      ? renderOutcome(modelData?.prediction)
                      : renderBinaryResult(modelData?.prediction);

                  return (
                    <TableRow key={`${versions[0]}-${type}`}>
                      <TableCell>{labelText}</TableCell>
                      <TableCell>
                        <Typography variant="body2" whiteSpace="pre-line">
                          {explanation}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ bgcolor: headerBg }}>{rendered}</TableCell>
                      <TableCell sx={{ bgcolor: headerBg }}>
                        {renderConfidenceLevel(modelData?.confidence)}
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <FOModelMethodologyAccordion />

      {/* Table 1: Issue Price */}
      {renderTableForVersions(
        issueVersions,
        "1st Day Close from Issue Price - Model Predictions",
        false,
        1
      )}

      {/* Table 2: From T+1D Open (with Repredict) */}
      {renderTableForVersions(
        openVersions,
        "1st Day Close from Open Price - Model Predictions",
        true,
        2
      )}
    </Container>
  );
};

export default FOPredictionResults;

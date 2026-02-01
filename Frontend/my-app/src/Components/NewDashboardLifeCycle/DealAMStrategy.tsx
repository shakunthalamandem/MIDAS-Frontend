import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

type SummaryKey = "t1d" | "t1w" | "t1m";
type SummaryOption = "Positive" | "Neutral" | "Negative";

const summaryFields: { key: SummaryKey; label: string }[] = [
  { key: "t1d", label: "T+1 Day" },
  { key: "t1w", label: "T+1 Week" },
  { key: "t1m", label: "T+1 Month" },
];

const summaryOptions: SummaryOption[] = ["Positive", "Neutral", "Negative"];

const chipColorMap: Record<SummaryOption, "success" | "warning" | "default"> = {
  Positive: "success",
  Neutral: "default",
  Negative: "warning",
};

function mapToSummaryOption(value?: string): SummaryOption {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("positive") || normalized.includes("bull") || normalized.includes("up")) {
    return "Positive";
  }
  if (
    normalized.includes("negative") ||
    normalized.includes("bear") ||
    normalized.includes("down") ||
    normalized.includes("low")
  ) {
    return "Negative";
  }
  return "Neutral";
}

function buildSummaryState(values: Partial<Record<SummaryKey, string>>): Record<SummaryKey, SummaryOption> {
  return {
    t1d: mapToSummaryOption(values.t1d),
    t1w: mapToSummaryOption(values.t1w),
    t1m: mapToSummaryOption(values.t1m),
  };
}

export default function DealAMStrategy({
  recommendation,
  potentialQty,
  ticker,
  overallSummary,
}: {
  recommendation: string;
  potentialQty: number | null;
  ticker: string;
  overallSummary: { t1d: string; t1w: string; t1m: string };
}) {
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const [currentRecommendation, setCurrentRecommendation] = useState(
    recommendation || ""
  );
  const [currentQty, setCurrentQty] = useState<number | null>(
    potentialQty ?? null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draftRecommendation, setDraftRecommendation] = useState(
    recommendation || ""
  );
  const [draftQty, setDraftQty] = useState(
    potentialQty === null || potentialQty === undefined
      ? ""
      : String(potentialQty)
  );
  const [currentSummary, setCurrentSummary] = useState<Record<SummaryKey, SummaryOption>>(
    () => buildSummaryState(overallSummary)
  );
  const [draftSummary, setDraftSummary] = useState<Record<SummaryKey, SummaryOption>>(
    () => buildSummaryState(overallSummary)
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCurrentRecommendation(recommendation || "");
    setCurrentQty(potentialQty ?? null);
    if (!isEditing) {
      setDraftRecommendation(recommendation || "");
      setDraftQty(
        potentialQty === null || potentialQty === undefined
          ? ""
          : String(potentialQty)
      );
    }
  }, [recommendation, potentialQty, isEditing]);

  useEffect(() => {
    const normalized = buildSummaryState(overallSummary);
    setCurrentSummary(normalized);
    if (!isEditing) {
      setDraftSummary(normalized);
    }
  }, [
    overallSummary.t1d,
    overallSummary.t1w,
    overallSummary.t1m,
    isEditing,
  ]);

  const openEdit = () => {
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraftRecommendation(currentRecommendation || "");
    setDraftQty(currentQty === null || currentQty === undefined ? "" : String(currentQty));
    setDraftSummary(currentSummary);
  };

  const handleSave = async () => {
    if (!API_URL) {
      setError("REACT_APP_API_URL is not set.");
      return;
    }

    const parsedQty =
      draftQty.trim() === "" ? null : Number(draftQty.trim());

    try {
      setIsSaving(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/update_deal_recommendation/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ticker,
          potential_am_quantity: Number.isNaN(parsedQty) ? null : parsedQty,
          am_strategy_recommendation: draftRecommendation.trim(),
          t1d_overall_pred: draftSummary.t1d,
          t1w_overall_pred: draftSummary.t1w,
          t1m_overall_pred: draftSummary.t1m,
        }),
      });
      const raw = await response.text();
      if (!response.ok) {
        throw new Error(raw || "Failed to save AM strategy");
      }

      setCurrentRecommendation(draftRecommendation.trim());
      setCurrentQty(Number.isNaN(parsedQty) ? null : parsedQty);
      setCurrentSummary(draftSummary);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save AM strategy");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid #e5e7ef",
        background: "#f7f9ff",
        boxShadow: "0 12px 24px rgba(32, 70, 150, 0.08)"
        
      }}
    >
      <CardContent sx={{ p: { xs: 2.5, md: 3, mb: 2 } }}>
        <Stack spacing={2}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr auto 1fr" },
              alignItems: "center",
              gap: 1
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "block" } }} />
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#121f44", textAlign: "center" }}
            >
              After Market (AM) Recommendation
            </Typography>
            <Box sx={{ justifySelf: { xs: "end", sm: "end" } }}>
              {isEditing ? (
                <Stack direction="row" spacing={1}>
                  <IconButton
                    size="small"
                    onClick={handleSave}
                    disabled={isSaving}
                    sx={{ color: "#1f3b73" }}
                  >
                    <SaveOutlinedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={cancelEdit}
                    disabled={isSaving}
                    sx={{ color: "#6b7280" }}
                  >
                    <CloseOutlinedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ) : (
                <IconButton
                  size="small"
                  onClick={openEdit}
                  sx={{ color: "#1f3b73" }}
                >
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5e7ef",
                  background: "#eceff5",
                  boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
                  p: 2.25,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#1d2b5a" }}
                  align="center"
                >
                  Overall AI Summary
                </Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {summaryFields.map((field) => (
                    <Box key={field.key}>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: "#1d2b5a" }}
                      >
                        {field.label}
                      </Typography>
                      {isEditing ? (
                        <FormControl fullWidth size="small" sx={{ mt: 0.5 }}>
                          <InputLabel id={`overall-${field.key}-label`}>
                            Sentiment
                          </InputLabel>
                          <Select
                            labelId={`overall-${field.key}-label`}
                            id={`overall-${field.key}-select`}
                            label="Sentiment"
                            value={draftSummary[field.key]}
                            onChange={(event: SelectChangeEvent<SummaryOption>) =>
                              setDraftSummary((prev) => ({
                                ...prev,
                                [field.key]: event.target.value as SummaryOption,
                              }))
                            }
                            sx={{ background: "#ffffff" }}
                          >
                            {summaryOptions.map((option) => (
                              <MenuItem key={option} value={option}>
                                {option}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        <Chip
                          label={currentSummary[field.key]}
                          color={chipColorMap[currentSummary[field.key]]}
                          variant={
                            currentSummary[field.key] === "Neutral"
                              ? "outlined"
                              : "filled"
                          }
                          sx={{ mt: 0.5, width: "fit-content", fontWeight: 700 }}
                        />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Grid>

            <Grid item xs={12} md={5}>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5e7ef",
                  background: "#eceff5",
                  boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
                  p: 2.25,
                  height: "100%",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#1d2b5a" }}
                  align="center"
                >
                  AM Strategy Recommendation
                </Typography>
                {isEditing ? (
                  <TextField
                    multiline
                    minRows={4}
                    value={draftRecommendation}
                    onChange={(event) => setDraftRecommendation(event.target.value)}
                    sx={{ mt: 1, background: "#ffffff" }}
                  />
                ) : (
                  <Typography
                    sx={{
                      mt: 1,
                      whiteSpace: "pre-line",
                      lineHeight: 1.7,
                      color: "#111827",
                    }}
                  >
                    {currentRecommendation || "-"}
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={3}>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5e7ef",
                  background: "#eceff5",
                  boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
                  p: 2.25,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, color: "#1d2b5a" }}
                  align="center"
                >
                  Potential AM Quantity
                </Typography>
                {isEditing ? (
                  <TextField
                    size="small"
                    value={draftQty}
                    onChange={(event) => setDraftQty(event.target.value)}
                    sx={{ mt: 1, background: "#ffffff" }}
                  />
                ) : (
                  <Typography
                    variant="h5"
                    sx={{ mt: 1, fontWeight: 800, color: "#111827" }}
                  >
                    {currentQty ?? "-"}
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>

          {error ? (
            <Typography variant="body2" sx={{ color: "#b91c1c" }}>
              {error}
            </Typography>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
}

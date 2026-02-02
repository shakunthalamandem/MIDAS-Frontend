import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

type SummaryKey = "t1d" | "t1w" | "t1m";
type SummaryOption = "Positive" | "Neutral" | "Negative";
type SummaryState = Record<SummaryKey, SummaryOption>;

type Props = {
  recommendation: string;
  potentialQty: number | null;
  ticker: string;
  overallSummary: { t1d: string; t1w: string; t1m: string };
  onSaved?: () => void;
};

type DealState = {
  am_strategy_recommendation: string;
  potential_am_quantity: number | null;
  overall: SummaryState;
};

const summaryFields: { key: SummaryKey; short: string }[] = [
  { key: "t1d", short: "1st Day" },
  { key: "t1w", short: "1 Week" },
  { key: "t1m", short: "1 Month" },
];

const summaryOptions: SummaryOption[] = ["Positive", "Neutral", "Negative"];

const chipColorMap: Record<SummaryOption, "success" | "default" | "error"> = {
  Positive: "success",
  Neutral: "default",
  Negative: "error",
};

const selectBgMap: Record<SummaryOption, string> = {
  Positive: "rgba(34, 197, 94, 0.14)",
  Neutral: "rgba(107, 114, 128, 0.08)",
  Negative: "rgba(239, 68, 68, 0.12)",
};

function mapToSummaryOption(value?: string): SummaryOption {
  const normalized = (value || "").toLowerCase();
  if (normalized.includes("positive") || normalized.includes("bull") || normalized.includes("up")) return "Positive";
  if (
    normalized.includes("negative") ||
    normalized.includes("bear") ||
    normalized.includes("down") ||
    normalized.includes("low")
  )
    return "Negative";
  return "Neutral";
}

function buildSummaryState(values: Partial<Record<SummaryKey, string>>): SummaryState {
  return {
    t1d: mapToSummaryOption(values.t1d),
    t1w: mapToSummaryOption(values.t1w),
    t1m: mapToSummaryOption(values.t1m),
  };
}

function toIntOrNull(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

/** backend → UI normalization */
function normalizeDealFromApi(data: any, fallback: DealState): DealState {
  const rec =
    data?.am_strategy_recommendation ??
    data?.amStrategyRecommendation ??
    data?.recommendation ??
    data?.AM_strategy_recommendation ??
    data?.AM_strategy_recommendation ??
    fallback.am_strategy_recommendation ??
    "";

  const qtyRaw =
    data?.potential_am_quantity ??
    data?.potentialAmQuantity ??
    data?.potentialQty ??
    data?.potential_AM_quantity ??
    data?.potential_am_qty ??
    fallback.potential_am_quantity ??
    null;

  const overall = buildSummaryState({
    t1d:
      data?.t1d_overall_pred ??
      data?.t1dOverallPred ??
      data?.t1d_overall_prediction ??
      data?.overallSummary?.t1d ??
      fallback.overall.t1d,
    t1w:
      data?.t1w_overall_pred ??
      data?.t1wOverallPred ??
      data?.t1w_overall_prediction ??
      data?.overallSummary?.t1w ??
      fallback.overall.t1w,
    t1m:
      data?.t1m_overall_pred ??
      data?.t1mOverallPred ??
      data?.t1m_overall_prediction ??
      data?.overallSummary?.t1m ??
      fallback.overall.t1m,
  });

  return {
    am_strategy_recommendation: String(rec ?? ""),
    potential_am_quantity: toIntOrNull(qtyRaw),
    overall,
  };
}

export default function DealAMStrategy({ recommendation, potentialQty, ticker, overallSummary, onSaved }: Props) {
  const API_URL = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const stateFromProps = useMemo<DealState>(
    () => ({
      am_strategy_recommendation: recommendation || "",
      potential_am_quantity: potentialQty ?? null,
      overall: buildSummaryState(overallSummary),
    }),
    [recommendation, potentialQty, overallSummary.t1d, overallSummary.t1w, overallSummary.t1m]
  );

  const [current, setCurrent] = useState<DealState>(stateFromProps);
  const [draft, setDraft] = useState<DealState>(stateFromProps);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Sync from parent ONLY when not editing
  useEffect(() => {
    if (isEditing) return;
    setCurrent(stateFromProps);
    setDraft(stateFromProps);
  }, [stateFromProps, isEditing]);

  const openEdit = () => {
    setError(null);
    setDraft(current);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setError(null);
    setDraft(current);
    setIsEditing(false);
  };

  const fetchDeal = async (): Promise<void> => {
    if (!API_URL) throw new Error("REACT_APP_API_URL is not set.");

    const res = await fetch(`${API_URL}/api/get_deal_recommendation/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ ticker }),
    });

    const raw = await res.text();
    if (!res.ok) throw new Error(raw || "Failed to refresh deal details");

    const data = raw ? JSON.parse(raw) : {};
    const normalized = normalizeDealFromApi(data, stateFromProps);

    setCurrent(normalized);
    setDraft(normalized);
  };

  const handleSave = async () => {
    if (!API_URL) {
      setError("REACT_APP_API_URL is not set.");
      return;
    }

    try {
      setIsSaving(true);
      setError(null);

      const payload = {
        ticker,
        potential_am_quantity: draft.potential_am_quantity,
        am_strategy_recommendation: draft.am_strategy_recommendation.trim(),
        t1d_overall_pred: draft.overall.t1d,
        t1w_overall_pred: draft.overall.t1w,
        t1m_overall_pred: draft.overall.t1m,
      };

      const response = await fetch(`${API_URL}/api/update_deal_recommendation/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      if (!response.ok) throw new Error(raw || "Failed to save AM strategy");

      await fetchDeal();
      onSaved?.();
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.message || "Failed to save AM strategy");
    } finally {
      setIsSaving(false);
    }
  };

  const qtyLabel = (() => {
    const q = isEditing ? draft?.potential_am_quantity : current?.potential_am_quantity;
    if (q === null || q === undefined) return "-";
    return `${Math.trunc(Number(q))}x`;
  })();

  const surfaceSx = {
    borderRadius: 3,
    border: "1px solid rgba(148,163,184,0.28)",
    background: "rgba(255,255,255,0.82)",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 22px rgba(15, 23, 42, 0.06)",
  } as const;

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.28)",
        background: "linear-gradient(180deg, rgba(240,245,255,1) 0%, rgba(248,250,255,1) 100%)",
        boxShadow: "0 18px 44px rgba(15, 23, 42, 0.10)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            mb: 2,
          }}
        >
          <Typography
            sx={{
              fontWeight: 1000,
              color: "#0f172a",
              fontSize: 18,
              textAlign: "center",
              letterSpacing: 0.2,
            }}
          >
            After Market (AM) Recommendation
          </Typography>

          {/* Actions pinned to the right */}
          <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}>
            <Stack direction="row" spacing={1}>
              {isEditing ? (
                <>
                  <Tooltip title="Save">
                    <span>
                      <IconButton size="small" onClick={handleSave} disabled={isSaving}>
                        <SaveOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                  <Tooltip title="Cancel">
                    <span>
                      <IconButton size="small" onClick={cancelEdit} disabled={isSaving}>
                        <CloseOutlinedIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              ) : (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={openEdit}>
                    <EditOutlinedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
          </Box>
        </Box>

        <Divider sx={{ mb: 2, opacity: 0.55 }} />

        <Grid container spacing={2} sx={{ alignItems: "stretch" }}>
          {/* Overall Summary "Table" */}
          <Grid item xs={12} md={4}>
            <Box sx={{ ...surfaceSx, p: 2, height: "100%" }}>
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: 13, mb: 1.5, textAlign: "center" }}>
                Overall AI Summary
              </Typography>

              {/* Table-like grid */}
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid rgba(148,163,184,0.30)",
                  overflow: "hidden",
                  background: "#fff",
                }}
              >
                {/* Header row */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    background: "rgba(15,23,42,0.03)",
                    borderBottom: "1px solid rgba(148,163,184,0.25)",
                  }}
                >
                  {summaryFields.map((field, idx) => (
                    <Box
                      key={field.key}
                      sx={{
                        py: 1,
                        px: 1,
                        textAlign: "center",
                        borderRight: idx !== summaryFields.length - 1 ? "1px solid rgba(148,163,184,0.25)" : "none",
                      }}
                    >
                      <Typography sx={{ fontSize: 11, fontWeight: 800, color: "rgba(15,23,42,0.75)" }}>
                        {field.short}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                {/* Value row */}
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
                  {summaryFields.map((field, idx) => (
                    <Box
                      key={field.key}
                      sx={{
                        p: 1.25,
                        textAlign: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRight: idx !== summaryFields.length - 1 ? "1px solid rgba(148,163,184,0.20)" : "none",
                      }}
                    >
                      {isEditing ? (
                        <FormControl size="small" sx={{ minWidth: 120 }}>
                          <InputLabel id={`overall-${field.key}-label`}>Sentiment</InputLabel>
                          <Select
                            labelId={`overall-${field.key}-label`}
                            label="Sentiment"
                            value={draft.overall[field.key]}
                            onChange={(event: SelectChangeEvent) =>
                              setDraft((prev) => ({
                                ...prev,
                                overall: { ...prev.overall, [field.key]: event.target.value as SummaryOption },
                              }))
                            }
                            sx={{
                              background: selectBgMap[draft.overall[field.key]],
                              borderRadius: 2,
                              "& .MuiSelect-select": { textAlign: "center" },
                            }}
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
                          size="small"
                          label={current.overall[field.key]}
                          color={chipColorMap[current.overall[field.key]]}
                          variant={current.overall[field.key] === "Neutral" ? "outlined" : "filled"}
                          sx={{ fontWeight: 700, px: 0.5 }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Strategy Recommendation */}
          <Grid item xs={12} md={6}>
            <Box sx={{ ...surfaceSx, p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: 13, mb: 1.5, textAlign: "center" }}>
                AM Strategy Recommendation
              </Typography>

              {isEditing ? (
                <TextField
                  multiline
                  minRows={8}
                  value={draft.am_strategy_recommendation}
                  onChange={(e) => setDraft((prev) => ({ ...prev, am_strategy_recommendation: e.target.value }))}
                  placeholder="Write AM strategy recommendation..."
                  fullWidth
                  sx={{
                    "& .MuiInputBase-root": {
                      borderRadius: 2,
                      background: "#fff",
                      textAlign: "left",
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(148,163,184,0.30)",
                    background: "#fff",
                    p: 1.75,
                    flex: 1,
                    overflow: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.7, color: "#0f172a" }}>
                    {current.am_strategy_recommendation || "-"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Potential Qty */}
          <Grid item xs={12} md={2}>
            <Box
              sx={{
                ...surfaceSx,
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                gap: 1.25,
              }}
            >
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: 13, textAlign: "center" }}>
                Potential AM Qty
              </Typography>

              {isEditing ? (
                <TextField
                  size="small"
                  value={draft.potential_am_quantity === null ? "" : String(draft.potential_am_quantity)}
                  onChange={(e) => {
                    const v = e.target.value.replace(/[^\d]/g, "");
                    setDraft((prev) => ({
                      ...prev,
                      potential_am_quantity: v ? Math.trunc(Number(v)) : null,
                    }));
                  }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "center", fontWeight: 900 },
                  }}
                  sx={{ width: "100%", maxWidth: 170, "& .MuiInputBase-root": { borderRadius: 2, background: "#fff" } }}
                  InputProps={{ endAdornment: <InputAdornment position="end">x</InputAdornment> }}
                />
              ) : (
                <Typography sx={{ fontSize: 28, fontWeight: 1000, textAlign: "center", color: "#0f172a" }}>
                  {qtyLabel}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        {error ? (
          <Typography variant="body2" sx={{ color: "#b91c1c", mt: 2, textAlign: "center" }}>
            {error}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

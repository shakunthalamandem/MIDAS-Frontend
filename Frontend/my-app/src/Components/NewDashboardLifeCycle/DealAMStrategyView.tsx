// ✅ UPDATED + CORRECT DealAMStrategyView.tsx
// Put this in: src/Components/NewDashboardLifeCycle/DealAMStrategyView.tsx

import React from "react";
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

export type SummaryKey = "t1d" | "t1w" | "t1m";
export type SummaryOption = "Positive" | "Neutral" | "Negative";
export type SummaryState = Record<SummaryKey, SummaryOption>;

export type DealState = {
  am_strategy_recommendation: string;
  potential_am_quantity: number | null;
  overall: SummaryState;
};

const summaryFields: { key: SummaryKey; short: string }[] = [
  { key: "t1d", short: "1D" },
  { key: "t1w", short: "1W" },
  { key: "t1m", short: "1M" },
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

type Props = {
  ticker: string;
  isEditing: boolean;
  isSaving: boolean;
  error: string | null;

  current: DealState;
  draft: DealState;

  onOpenEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;

  onDraftChange: (next: DealState) => void;
};

export default function DealAMStrategyView({
  ticker,
  isEditing,
  isSaving,
  error,
  current,
  draft,
  onOpenEdit,
  onCancelEdit,
  onSave,
  onDraftChange,
}: Props) {
  const qtyLabel = (() => {
    const q = isEditing ? draft.potential_am_quantity : current.potential_am_quantity;
    if (q === null || q === undefined) return "-";
    const n = Number(q);
    if (!Number.isFinite(n)) return "-";
    return `${Math.trunc(n)}x`;
  })();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.35)",
        background: "linear-gradient(180deg, #F8FAFF 0%, #F4F7FF 100%)",
        boxShadow: "0 16px 40px rgba(15, 23, 42, 0.10)",
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: 18 }}>
              After Market (AM) Recommendation
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            {isEditing ? (
              <>
                <Tooltip title="Save">
                  <span>
                    <IconButton size="small" onClick={onSave} disabled={isSaving}>
                      <SaveOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                <Tooltip title="Cancel">
                  <span>
                    <IconButton size="small" onClick={onCancelEdit} disabled={isSaving}>
                      <CloseOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </>
            ) : (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={onOpenEdit}>
                  <EditOutlinedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        <Divider sx={{ mb: 2, opacity: 0.5 }} />

        <Grid container spacing={2}>
          {/* Overall AI Summary */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(148,163,184,0.30)",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                p: 2,
                height: "100%",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: 13, mb: 1 }}>
                Overall AI Summary
              </Typography>

              <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between" }}>
                {summaryFields.map((field) => (
                  <Box key={field.key} sx={{ flex: 1, minWidth: 0, textAlign: "center" }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 900, color: "rgba(15,23,42,0.7)" }}>
                      {field.short}
                    </Typography>

                    {isEditing ? (
                      <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                        <InputLabel id={`overall-${field.key}-label`}>Sentiment</InputLabel>
                        <Select<SummaryOption>
                          labelId={`overall-${field.key}-label`}
                          label="Sentiment"
                          value={draft.overall[field.key]}
                          onChange={(event: SelectChangeEvent<SummaryOption>) =>
                            onDraftChange({
                              ...draft,
                              overall: {
                                ...draft.overall,
                                [field.key]: event.target.value as SummaryOption,
                              },
                            })
                          }
                          sx={{ background: selectBgMap[draft.overall[field.key]], borderRadius: 2 }}
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
                        sx={{ mt: 1, fontWeight: 900 }}
                        size="small"
                        label={current.overall[field.key]}
                        color={chipColorMap[current.overall[field.key]]}
                        variant={current.overall[field.key] === "Neutral" ? "outlined" : "filled"}
                      />
                    )}
                  </Box>
                ))}
              </Stack>
            </Box>
          </Grid>

          {/* AM Strategy Recommendation */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(148,163,184,0.30)",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography sx={{ fontWeight: 900, color: "#0f172a", fontSize: 13, mb: 1 }}>
                AM Strategy Recommendation
              </Typography>

              {isEditing ? (
                <TextField
                  multiline
                  minRows={8}
                  value={draft.am_strategy_recommendation}
                  onChange={(e) =>
                    onDraftChange({
                      ...draft,
                      am_strategy_recommendation: e.target.value,
                    })
                  }
                  placeholder="Write AM strategy recommendation..."
                  fullWidth
                  sx={{ "& .MuiInputBase-root": { borderRadius: 2, background: "#fff" } }}
                />
              ) : (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: "1px solid rgba(148,163,184,0.30)",
                    background: "#fff",
                    p: 1.5,
                    flex: 1,
                    overflow: "auto",
                  }}
                >
                  <Typography sx={{ whiteSpace: "pre-line", lineHeight: 1.7, color: "#0f172a" }}>
                    {current.am_strategy_recommendation || "-"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Potential AM Quantity */}
          <Grid item xs={12} md={2}>
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid rgba(148,163,184,0.30)",
                background: "rgba(255,255,255,0.75)",
                backdropFilter: "blur(10px)",
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 1,
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
                    onDraftChange({
                      ...draft,
                      potential_am_quantity: v ? Math.trunc(Number(v)) : null,
                    });
                  }}
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    style: { textAlign: "center", fontWeight: 900 },
                  }}
                  sx={{ "& .MuiInputBase-root": { borderRadius: 2, background: "#fff" } }}
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
          <Typography variant="body2" sx={{ color: "#b91c1c", mt: 2 }}>
            {error}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

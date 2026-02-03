import React from "react";
import {
  Paper,
  Typography,
  Stack,
  TextField,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Alert,
} from "@mui/material";

type SummaryOption = "Positive" | "Negative" | "Neutral";
type SummaryKey = "t1d" | "t1w" | "t1m";
type SummaryState = Record<SummaryKey, SummaryOption>;

type DealState = {
  am_strategy_recommendation: string;
  potential_am_quantity: number | null;
  overall: SummaryState;
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

const optionValues: SummaryOption[] = ["Positive", "Negative", "Neutral"];

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
  const updateDraft = (patch: Partial<DealState>) => {
    onDraftChange({ ...draft, ...patch, overall: { ...draft.overall, ...(patch.overall || {}) } });
  };

  return (
    <Paper sx={{ p: 2, border: "1px solid #ddd", borderRadius: 1 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1" fontWeight={600}>
          Ticker: {ticker}
        </Typography>

        {!isEditing ? (
          <Stack spacing={1}>
            <Typography>
              <strong>Recommendation:</strong> {current.am_strategy_recommendation || "—"}
            </Typography>
            <Typography>
              <strong>Potential AM Qty:</strong> {current.potential_am_quantity ?? "—"}
            </Typography>

            <Stack direction="row" spacing={2}>
              <Stack>
                <Typography variant="caption">1d</Typography>
                <Typography>{current.overall.t1d}</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption">1w</Typography>
                <Typography>{current.overall.t1w}</Typography>
              </Stack>
              <Stack>
                <Typography variant="caption">1m</Typography>
                <Typography>{current.overall.t1m}</Typography>
              </Stack>
            </Stack>

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onOpenEdit}>
                Edit
              </Button>
            </Stack>
          </Stack>
        ) : (
          <Stack spacing={2}>
            <TextField
              label="Recommendation"
              multiline
              rows={3}
              value={draft.am_strategy_recommendation}
              onChange={(e) => updateDraft({ am_strategy_recommendation: e.target.value })}
              fullWidth
            />

            <TextField
              label="Potential AM Qty"
              type="number"
              value={draft.potential_am_quantity ?? ""}
              onChange={(e) =>
                updateDraft({
                  potential_am_quantity: e.target.value === "" ? null : Math.trunc(Number(e.target.value) || 0),
                })
              }
              sx={{ width: 200 }}
            />

            <Stack direction="row" spacing={2}>
              {(["t1d", "t1w", "t1m"] as SummaryKey[]).map((k) => (
                <FormControl key={k} sx={{ minWidth: 140 }}>
                  <InputLabel id={`${k}-label`}>{k}</InputLabel>
                  <Select
                    labelId={`${k}-label`}
                    value={draft.overall[k]}
                    label={k}
                    onChange={(e) =>
                      updateDraft({ overall: { ...draft.overall, [k]: e.target.value as SummaryOption } })
                    }
                  >
                    {optionValues.map((o) => (
                      <MenuItem key={o} value={o}>
                        {o}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ))}
            </Stack>

            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </Button>
              <Button variant="outlined" onClick={onCancelEdit} disabled={isSaving}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}
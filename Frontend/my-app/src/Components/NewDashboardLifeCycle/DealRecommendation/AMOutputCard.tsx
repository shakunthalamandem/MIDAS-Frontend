import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  TextField,
  Button,
  Stack,
  CircularProgress,
} from "@mui/material";

import { SectionCard } from "./SectionCard";
import { DealType } from "./DealRecommendationHome";

type Rating = "Positive" | "Neutral" | "Negative";

interface Props {
  t1d_overall_rating: string;
  t1w_overall_rating: string;
  t1m_overall_rating: string;
  AM_strategy_recommendation: string;
  potential_am_quantity: number;
  deal_type: DealType;

  saving?: boolean;

  onSave: (payload: {
    t1d_overall_rating: string;
    t1w_overall_rating: string;
    t1m_overall_rating: string;
    AM_strategy_recommendation: string;
    potential_am_quantity: number;
  }) => Promise<void>;
}

const RATINGS: Rating[] = ["Positive", "Neutral", "Negative"];

/* ================= Strategies ================= */

const IPO_OPTIONS = [
  "(a) If close < issue price → Stay away",
  "(b) Return 0–25% → Participate if close > open",
  "(c) Return >25% → Stay away",
];

const FO_OPTIONS = [
  "(a) Drop >5% → Stay away",
  "(b) -5% to 10% → Participate if close > open",
  "(c) >10% → Stay away",
];

export function AMOutputCard({
  t1d_overall_rating,
  t1w_overall_rating,
  t1m_overall_rating,
  AM_strategy_recommendation,
  potential_am_quantity,
  deal_type,
  saving = false,
  onSave,
}: Props) {
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    t1d: t1d_overall_rating,
    t1w: t1w_overall_rating,
    t1m: t1m_overall_rating,
    strategy: AM_strategy_recommendation,
    qty: potential_am_quantity,
  });

  const options = deal_type === "IPO" ? IPO_OPTIONS : FO_OPTIONS;

  /* ================= Save ================= */

  const handleSave = async () => {
    await onSave({
      t1d_overall_rating: form.t1d,
      t1w_overall_rating: form.t1w,
      t1m_overall_rating: form.t1m,
      AM_strategy_recommendation: form.strategy,
      potential_am_quantity: form.qty,
    });

    setEditMode(false);
  };

  /* ================= UI ================= */

  const renderRating = (label: string, key: "t1d" | "t1w" | "t1m") => (
    <Stack alignItems="center" spacing={0.5}>
      <Typography variant="caption">{label}</Typography>

      {editMode ? (
        <Select
          size="small"
          value={form[key]}
          disabled={saving}
          onChange={(e) =>
            setForm({
              ...form,
              [key]: e.target.value,
            })
          }
        >
          {RATINGS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Chip label={form[key]} size="small" />
      )}
    </Stack>
  );

  return (
    <SectionCard title="After Market (AM) Recommendation">
      <Box display="flex" gap={2}>
        {/* Summary */}
        <Box flex={1} border="1px solid #eee" borderRadius={2} p={2}>
          <Typography fontWeight={600} mb={1}>
            Overall Ratings
          </Typography>

          <Stack direction="row" justifyContent="space-around">
            {renderRating("1st Day", "t1d")}
            {renderRating("1 Week", "t1w")}
            {renderRating("1 Month", "t1m")}
          </Stack>
        </Box>

        {/* Strategy */}
        <Box flex={2} border="1px solid #eee" borderRadius={2} p={2}>
          <Typography fontWeight={600} mb={1}>
            AM Strategy Recommendation
          </Typography>

          {editMode ? (
            <Select
              fullWidth
              size="small"
              disabled={saving}
              value={form.strategy}
              onChange={(e) =>
                setForm({
                  ...form,
                  strategy: e.target.value,
                })
              }
            >
              {options.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          ) : (
            <Typography variant="body2">{form.strategy || "-"}</Typography>
          )}
        </Box>

        {/* Quantity */}
        <Box
          width={160}
          border="1px solid #eee"
          borderRadius={2}
          p={2}
          textAlign="center"
        >
          <Typography fontWeight={600} mb={1}>
            Potential AM Qty
          </Typography>

          {editMode ? (
            <TextField
              size="small"
              type="number"
              fullWidth
              disabled={saving}
              value={form.qty}
              onChange={(e) =>
                setForm({
                  ...form,
                  qty: Number(e.target.value),
                })
              }
            />
          ) : (
            <Typography variant="h5">{form.qty || 0}x</Typography>
          )}
        </Box>
      </Box>

      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" mt={2} gap={1}>
        {saving && <CircularProgress size={20} />}

        {editMode ? (
          <>
            <Button
              size="small"
              disabled={saving}
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              disabled={saving}
              onClick={handleSave}
            >
              Save
            </Button>
          </>
        ) : (
          <Button
            size="small"
            variant="contained"
            onClick={() => setEditMode(true)}
          >
            Edit
          </Button>
        )}
      </Box>
    </SectionCard>
  );
}

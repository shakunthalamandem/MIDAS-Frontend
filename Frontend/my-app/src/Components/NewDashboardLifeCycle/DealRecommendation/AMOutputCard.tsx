import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Select,
  MenuItem,
  TextField,
  Stack,
  CircularProgress,
  IconButton,
  Button,
} from "@mui/material";

import { SectionCard } from "./SectionCard";
import { DealType } from "./DealRecommendationHome";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import EditIcon from "@mui/icons-material/Edit";

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
    t1d: t1d_overall_rating || "",
    t1w: t1w_overall_rating || "",
    t1m: t1m_overall_rating || "",
    strategy: AM_strategy_recommendation,
    qty: potential_am_quantity ? String(potential_am_quantity) : "",
  });

  useEffect(() => {
    setForm({
      t1d: t1d_overall_rating || "",
      t1w: t1w_overall_rating || "",
      t1m: t1m_overall_rating || "",
      strategy: AM_strategy_recommendation,
      qty: potential_am_quantity ? String(potential_am_quantity) : "",
    });
  }, [
    t1d_overall_rating,
    t1w_overall_rating,
    t1m_overall_rating,
    AM_strategy_recommendation,
    potential_am_quantity,
  ]);

  const options = deal_type === "IPO" ? IPO_OPTIONS : FO_OPTIONS;

  /* ================= Save ================= */

  const handleSave = async () => {
    const qtyValue = form.qty === "" ? 0 : Number(form.qty);

    await onSave({
      t1d_overall_rating: form.t1d,
      t1w_overall_rating: form.t1w,
      t1m_overall_rating: form.t1m,
      AM_strategy_recommendation: form.strategy,
      potential_am_quantity: qtyValue,
    });

    setEditMode(false);
  };

  /* ================= UI ================= */

  const renderRating = (label: string, key: "t1d" | "t1w" | "t1m") => (
    <Box textAlign="center" width="100%">
      <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
        {label}
      </Typography>
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
          sx={{
            width: 120,
            borderRadius: 1.25,
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "#dbeafe",
            },
          }}
          displayEmpty
        >
          <MenuItem value="">Select</MenuItem>
          {RATINGS.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </Select>
      ) : (
        <Chip
          label={form[key] || "-"}
          size="small"
          color={form[key] === "Positive" ? "success" : form[key] === "Negative" ? "error" : "default"}
          sx={{
            borderRadius: 1.5,
            px: 1,
            py: 0.5,
          }}
        />
      )}
    </Box>
  );

  return (
    <SectionCard title="After Market (AM) Recommendation">
      <Box display="flex" justifyContent="flex-end" mb={1} alignItems="center" gap={1}>
        {saving && <CircularProgress size={20} />}
        {!editMode ? (
          <IconButton
            size="small"
            onClick={() => setEditMode(true)}
            sx={{
              // background: "#2563eb",
              color: "#5e5d5f",
              // "&:hover": { background: "#1d4ed8" },
            }}
          >
            <EditIcon />
          </IconButton>
        ) : (
          <Stack direction="row" spacing={1}>

            <IconButton
              size="small"
              onClick={handleSave}
              disabled={saving}
              sx={{
                // background: "#16a34a",
                color: "#2563eb",
                // "&:hover": { background: "#15803d" },
              }}
            >
              <SaveIcon />
            </IconButton>
                        <IconButton
              size="small"
              onClick={() => setEditMode(false)}
              disabled={saving}
              sx={{
                background: "#f3f4f6",
                color: "#4b5563",
                // "&:hover": { background: "#fee2e2", color: "#b91c1c" },
              }}
            >
              <CancelIcon />
            </IconButton>
          </Stack>
        )}
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap">
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
          <TextField
            fullWidth
            size="small"
            disabled={saving}
            select
            value={form.strategy}
            onChange={(e) =>
              setForm({
                ...form,
                strategy: e.target.value,
              })
            }
            SelectProps={{
              IconComponent: () => <></>,
              MenuProps: { disableScrollLock: true },
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#dbeafe",
              },
            }}
          >
            {options.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>
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
                  qty: e.target.value,
                })
              }
            />
          ) : (
            <Typography variant="h5">{potential_am_quantity || 0}x</Typography>
          )}
        </Box>
      </Box>


    </SectionCard>
  );
}

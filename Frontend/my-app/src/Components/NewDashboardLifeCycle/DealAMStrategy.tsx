import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";

export default function DealAMStrategy({
  recommendation,
  potentialQty,
  ticker,
}: {
  recommendation: string;
  potentialQty: number | null;
  ticker: string;
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

  const openEdit = () => {
    setError(null);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setDraftRecommendation(currentRecommendation || "");
    setDraftQty(currentQty === null || currentQty === undefined ? "" : String(currentQty));
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
      const response = await fetch(`${API_URL}/api/writeup_data/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          ticker,
          potential_am_quantity: Number.isNaN(parsedQty) ? null : parsedQty,
          am_strategy_recommendation: draftRecommendation.trim(),
        }),
      });
      const raw = await response.text();
      if (!response.ok) {
        throw new Error(raw || "Failed to save AM strategy");
      }

      setCurrentRecommendation(draftRecommendation.trim());
      setCurrentQty(Number.isNaN(parsedQty) ? null : parsedQty);
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
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            gap={1}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 700, color: "#121f44" }}
            >
              After Market (AM) Strategy
            </Typography>
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
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <Box
                sx={{
                  borderRadius: 2,
                  border: "1px solid #e5e7ef",
                  background: "#eceff5",
                  boxShadow: "0 8px 16px rgba(72, 100, 170, 0.12)",
                  p: 2.25,
                  height: "100%"
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
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
                    sx={{ mt: 1, whiteSpace: "pre-line", lineHeight: 1.7, color: "#111827" }}
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
                  justifyContent: "center"
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1d2b5a" }}>
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
                  <Typography variant="h5" sx={{ mt: 1, fontWeight: 800, color: "#111827" }}>
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

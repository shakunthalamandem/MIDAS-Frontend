import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BlockRenderer, { GatorBlock } from "../../GatorPostIpoAgent/BlockRenderer";

interface SavedRecord {
  id: number;
  ticker: string;
  company_name: string | null;
  headline: string | null;
  json_data: GatorBlock[];
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  records: SavedRecord[];
}

interface Props {
  ticker?: string;
}

const deriveMeta = (blocks: GatorBlock[] = []) => {
  let score: number | null = null;
  let sentiment = "";
  let horizon = "";
  for (const b of blocks) {
    if (b.type === "card" && typeof b.title === "string") {
      const t = b.title.toLowerCase();
      if (score === null && /score/.test(t)) {
        const m = b.title.match(/([-+]?\d+(?:\.\d+)?)/);
        if (m) score = parseFloat(m[1]);
        sentiment = (b.subtitle || "").trim();
      } else if (!horizon && /horizon/.test(t)) {
        horizon = `${b.title}${b.subtitle ? " · " + b.subtitle : ""}`;
      }
    }
  }
  return { score, sentiment, horizon };
};

const sentimentTone = (s: string) => {
  const v = (s || "").toLowerCase();
  if (/bullish|strong|positive|favorable/.test(v))
    return { bg: "#ecfdf5", color: "#065f46", border: "#a7f3d0" };
  if (/bearish|weak|negative|cautious/.test(v))
    return { bg: "#fef2f2", color: "#991b1b", border: "#fecaca" };
  return { bg: "#f1f5f9", color: "#334155", border: "#e2e8f0" };
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const GatorPostIpoTickerTab: React.FC<Props> = ({ ticker }) => {
  const [records, setRecords] = useState<SavedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = process.env.REACT_APP_API_URL;
  const token = localStorage.getItem("access_token");

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${apiUrl}/api/gator_post_ipo/list/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });
      const data: ApiResponse = await res.json();
      setRecords(data.records || []);
    } catch {
      setRecords([]);
      setError("Failed to load Gator Post-IPO data");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const tickerKey = (ticker || "").toUpperCase().split(" ")[0];

  const matched = useMemo(() => {
    if (!tickerKey) return null;
    return (
      records.find((r) => (r.ticker || "").toUpperCase().split(" ")[0] === tickerKey) || null
    );
  }, [records, tickerKey]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress size={32} sx={{ color: "#0f766e" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ borderRadius: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!matched) {
    return (
      <Box
        sx={{
          textAlign: "center",
          py: 8,
          px: 3,
          bgcolor: "#f0fdfa",
          border: "1px dashed #99f6e4",
          borderRadius: 3,
        }}
      >
        <RocketLaunchOutlinedIcon sx={{ fontSize: 48, color: "#0f766e", mb: 1.5 }} />
        <Typography sx={{ fontWeight: 700, color: "#134e4a", fontSize: "1rem", mb: 0.5 }}>
          No Gator Post-IPO report yet for {ticker}
        </Typography>
        <Typography sx={{ color: "#475569", fontSize: "0.85rem", maxWidth: 460, mx: "auto" }}>
          A Day&nbsp;1–40 post-listing scorecard hasn't been generated for this ticker. Reports
          appear here automatically once published.
        </Typography>
      </Box>
    );
  }

  const meta = deriveMeta(matched.json_data || []);
  const tone = sentimentTone(meta.sentiment);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
      {/* Header strip — dark neat */}
      <Box
        sx={{
          position: "relative",
          background:
            "linear-gradient(135deg, #0b1220 0%, #0f172a 55%, #111c33 100%)",
          border: "1px solid rgba(45, 212, 191, 0.22)",
          borderRadius: 3,
          p: { xs: 2, md: 2.5 },
          boxShadow:
            "0 12px 32px rgba(2, 6, 23, 0.45), inset 0 1px 0 rgba(255,255,255,0.04)",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background:
              "linear-gradient(90deg, #14b8a6 0%, #2dd4bf 50%, #5eead4 100%)",
            opacity: 0.85,
          },
        }}
      >
        {/* Top row: eyebrow + updated-on-right */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 1.25 }}
        >
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: 1.5,
                background:
                  "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(20, 184, 166, 0.35)",
              }}
            >
              <TrendingUpIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#5eead4",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              Gator Post-IPO · Day 1–40
            </Typography>
          </Stack>

          {matched.updated_at && (
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.7}
              sx={{
                px: 1.25,
                py: 0.55,
                borderRadius: 1.5,
                bgcolor: "rgba(15, 23, 42, 0.6)",
                border: "1px solid rgba(148, 163, 184, 0.18)",
              }}
            >
              <AccessTimeIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: "#cbd5e1",
                  letterSpacing: "0.02em",
                }}
              >
                Updated {formatTime(matched.updated_at)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {/* Headline */}
        <Typography
          sx={{
            fontSize: { xs: "1.05rem", md: "1.15rem" },
            fontWeight: 800,
            color: "#f1f5f9",
            lineHeight: 1.45,
            letterSpacing: "-0.005em",
          }}
        >
          {matched.headline || matched.company_name || matched.ticker}
        </Typography>

        {/* Chips row */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          sx={{ mt: 1.5, rowGap: 1 }}
        >
          {meta.score !== null && (
            <Chip
              label={`Score ${meta.score > 0 ? "+" : ""}${meta.score}`}
              sx={{
                fontWeight: 800,
                fontSize: "0.75rem",
                background:
                  "linear-gradient(135deg, #14b8a6 0%, #0f766e 100%)",
                color: "#fff",
                border: "1px solid rgba(45, 212, 191, 0.4)",
                boxShadow: "0 2px 8px rgba(20, 184, 166, 0.3)",
                "& .MuiChip-label": { px: 1.4 },
              }}
            />
          )}
          {meta.sentiment && (
            <Chip
              label={meta.sentiment.toUpperCase()}
              sx={{
                fontWeight: 700,
                fontSize: "0.7rem",
                bgcolor: "rgba(30, 41, 59, 0.85)",
                color: "#e2e8f0",
                border: "1px solid rgba(148, 163, 184, 0.25)",
                letterSpacing: "0.04em",
              }}
            />
          )}
          {meta.horizon && (
            <Chip
              label={meta.horizon}
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                bgcolor: "rgba(15, 23, 42, 0.7)",
                color: "#cbd5e1",
                border: "1px solid rgba(148, 163, 184, 0.2)",
              }}
            />
          )}
        </Stack>
      </Box>

      {/* Block renderer body */}
      <Box
        sx={{
          bgcolor: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 3,
          p: { xs: 1.5, md: 2.5 },
          boxShadow: "0 4px 18px rgba(15, 23, 42, 0.04)",
        }}
      >
        <BlockRenderer blocks={matched.json_data || []} />
      </Box>
    </Box>
  );
};

export default GatorPostIpoTickerTab;
